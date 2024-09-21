import {startServer} from "./server.js";
import {$, fs, ProcessPromise} from 'zx'
import {
    ExecTxResult,
    Request,
    RequestCheckTx,
    RequestCommit,
    RequestFinalizeBlock,
    RequestFlush,
    RequestInitChain,
    RequestPrepareProposal,
    RequestProcessProposal,
    RequestQuery,
    Response,
    ResponseCheckTx,
    ResponseCommit,
    ResponseFinalizeBlock,
    ResponseFlush,
    ResponseInfo,
    ResponseInitChain,
    ResponsePrepareProposal,
    ResponseProcessProposal,
    ResponseProcessProposal_ProposalStatus,
    ResponseQuery
} from "@tvs/proto";
import {
    catchError,
    combineLatest,
    concatMap,
    delay,
    finalize,
    from,
    map, mergeMap,
    Observable,
    of,
    Subject,
    switchMap,
    tap,
    throwError,
    toArray
} from "rxjs";
import {AppStore, close, commit, hash, newAppStore, newTempStore} from "./appStore.js";
import {hash as cryptoHash} from 'node:crypto'
import {memoize} from "lodash-es";
import {parse} from "smol-toml";
import {stringToUint8Array} from "uint8array-extras";
import {startApiService} from "./api-service/api-service.js";
import {deserializeTx, Message, Transaction, verifyTx} from "./Tx.js";

export type AppConfig = {
    appVersion: number
    version: `${number}.${number}.${number}`
    home: string
    stdout?: (text: string) => void
    stderr?: (text: string) => void
    msgHandlers: Record<string, MsgHandler<any>>
    queryHandlers: Record<string, QueryHandler<any, any>>
    apiPort?: number
}

export type App = {
    config: AppConfig,
    appStore: AppStore
}

export type QueryHandlerOpts<T extends Object> = {
    app: App,
    path: string
    data: T
}


export type QueryHandler<T extends Object, R = string> = (opts: QueryHandlerOpts<T>) => Observable<Partial<QueryHandlerResult<R>>>

export type QueryHandlerResult<T = string> = Omit<ResponseQuery, 'proofOps' | 'index' | 'height' | 'key' | 'value'> & {
    key: string
    value: T
}

export type MsgHandlerOpts<T extends Object> = {
    app: App,
    msg: Message<T>
    tx: Transaction
    reason: 'checkTx' | 'finalize'
}

export type MsgHandler<T extends Object> = (opts: MsgHandlerOpts<T>) => Observable<unknown>

export type CometConfig = {
    proxy_app: string
    rpc: {
        laddr: string
    }
}

export type MsgProcessorError = Partial<ExecTxResult>


export const startApp = (config: AppConfig) => {
    let app: App;

    return newAppStore(`${config.home}/data/appstore`).pipe(
        map(appStore => ({
            config,
            appStore
        } satisfies App as App)),
        tap(a => app = a),
        switchMap(app => combineLatest([
            of(app),
            readCometConfig(app)
        ])),
        switchMap(([app, cometConfig]) => startServer({
            processorFactory: cmdProcessorFactory(app),
            port: parseInt(cometConfig.proxy_app.replace(/.*:/, ''))
        })),
        switchMap(() => startComet(config)),
        tap(proc => {
            proc.stdout.on('data', out => config.stdout ? config.stdout(out.toString()) : console.log(out.toString()));
            proc.stderr.on('data', err => config.stderr ? config.stderr(err.toString()) : console.error(err.toString()));
        }),
        switchMap(() => startApiService(app)),
        map(() => app),
        finalize(() => close(app.appStore))
    );
}


let currentHeight = 0;
let currentAppHash = '';

const startComet = (config: AppConfig) => new Observable<ProcessPromise>(sub => {
    console.log('starting comet');
    let cometProc: ProcessPromise;
    const s = of(config).pipe(
        map(config => [
            'start',
            '--home',
            config.home
        ]),
        map(opts => $`cometbft ${opts}`),
        tap(proc => cometProc = proc),
        delay(1000),
        tap(proc => sub.next(proc)),
    ).subscribe();

    return () => {
        s.unsubscribe()
        console.log('stopping comet');
        cometProc.kill();
    }
})


const bytesToRequest = (bytes: Uint8Array) => {
    return of(Request.decode(bytes)).pipe(
        switchMap(request => of(undefined).pipe(
            map(() => Object.keys(request).find(k => (request as Record<string, any>)[k]) as keyof Request),
            switchMap(cmd => cmd ? of({
                cmd,
                data: (request as Record<string, any>)[cmd]
            }) : throwError(() => ({code: 'INVALID_CMD', data: cmd})))
        ))
    )
};

const cmdProcessorFactory = (app: App) => () => {
    const sub = new Subject<Uint8Array>();
    const resp = sub.pipe(
        concatMap(data => bytesToRequest(data)),
        tap(({cmd, data}) => console.log('processing cmd', cmd, data)),
        concatMap(({cmd, data}) => processCmd(app, cmd, data)),
    );
    return {sub, resp};
};

const processCmd = (app: App, cmd: keyof Request, data: any) =>
        commandProcessors[cmd](app, data);

const infoCmdProcessor: CommandProcessor = (app, data: RequestInfo) =>
    of({
        appVersion: app.config.appVersion,
        data: '',
        lastBlockAppHash: new Uint8Array(),
        lastBlockHeight: 0,
        version: app.config.version
    } satisfies ResponseInfo).pipe(
        map(info => ResponseInfo.fromJSON(info)),
        switchMap(data => prepResponse('info', data))
    );

const flushCmdProcessor: CommandProcessor = (app, data: RequestFlush) => of(ResponseFlush.fromJSON({})).pipe(
    switchMap(data => prepResponse('flush', data)),
);

const initChainCmdProcessor: CommandProcessor = (app, data: RequestInitChain) => of({
    appHash: new Uint8Array(),
    validators: [],
    consensusParams: undefined
} satisfies ResponseInitChain).pipe(
    switchMap(data => prepResponse('initChain', data))
);

const prepareProposalCmdProcessor: CommandProcessor = (app, data: RequestPrepareProposal) => {
    return of(ResponsePrepareProposal.fromJSON({
        txs: removeExcessTxs(data.txs, data.maxTxBytes)
    } satisfies ResponsePrepareProposal)).pipe(
        switchMap(data => prepResponse('prepareProposal', data))
    )

    function removeExcessTxs(txs: Uint8Array[], max: number): Uint8Array[] {
        const totalLen = txs.reduce((len, tx) => len + tx.length, 0);
        return totalLen > max ? removeExcessTxs(txs.slice(1), max) : txs
    }
}

const processProposalCmdProcessor: CommandProcessor = (app, data: RequestProcessProposal) => of(ResponseProcessProposal.fromJSON({
    status: ResponseProcessProposal_ProposalStatus.ACCEPT
} satisfies ResponseProcessProposal)).pipe(
    switchMap(data => prepResponse('processProposal', data))
)

const finalizeBlockCmdProcessor: CommandProcessor = (app, req: RequestFinalizeBlock) => {
    return from(req.txs).pipe(
        concatMap(tx => processMsgs(app, deserializeTx(tx), 'finalize').pipe(
            map(result => ({} as Partial<ExecTxResult>)),
            catchError((err: MsgProcessorError) => of(err)),
        )),
        toArray(),
        switchMap(results => combineLatest([
            of(results),
            calculateAppHash(app)
        ])),
        tap(([_, hash]) => {
            currentAppHash = hash.toString('hex');
            currentHeight = req.height;
        }),
        map(([results, appHash]) => ResponseFinalizeBlock.fromJSON({
            appHash: appHash,
            consensusParamUpdates: undefined,
            events: [],
            txResults: results.map(result => ExecTxResult.fromJSON({
                code: result.code || 0,
                codespace: result.codespace || 'unknown',
                data: result.data || new Uint8Array(),
                events: result.events || [],
                gasWanted: result.gasWanted || 0,
                gasUsed: result.gasUsed || 0,
                info: result.info || '',
                log: result.log || ''
            } satisfies ExecTxResult)),
            validatorUpdates: []
        } satisfies ResponseFinalizeBlock)),
        switchMap(data => prepResponse('finalizeBlock', data)
        )
    );

}

const commitCmdProcessor: CommandProcessor = (app, data: RequestCommit) =>
    updateAppJSON(app.config.home, {lastAppHash: currentAppHash, lastHeight: currentHeight}).pipe(
        switchMap(() => commit(app.appStore)),
        map(() => ResponseCommit.fromJSON({
            retainHeight: 0
        } satisfies ResponseCommit)),
        switchMap(data => prepResponse('commit', data)),
    );


const checkTxCmdProcessor: CommandProcessor = (app, req: RequestCheckTx) => {
    const responseJSON = {
        code: 0,
        codespace: 'app',
        data: new Uint8Array(),
        events: [],
        gasUsed: 0,
        gasWanted: 0,
        info: '',
        log: '',
    } satisfies ResponseCheckTx;
    return checkForBadSignature(req.tx).pipe(
        switchMap(() => processMsgs({...app, appStore: newTempStore(app.appStore)}, deserializeTx(req.tx), 'checkTx')),
        switchMap(() => prepResponse('checkTx', responseJSON)),
        catchError(err => prepResponse('checkTx', {...responseJSON, ...err}))
    )

    function checkForBadSignature(tx: Uint8Array) {
        return of(deserializeTx(tx)).pipe(
            switchMap(tx => verifyTx(tx)),
            switchMap(valid => valid ? of(undefined) : throwError(() => ({code: 1, log: 'INVALID_SIGNATURE'}))),
        )
    }
}

const processMsgs = (app: App, tx: Transaction, reason: MsgHandlerOpts<any>['reason']) =>
    from(tx.msgs).pipe(
        map(msg => ({handler: app.config.msgHandlers[msg.path], msg})),
        mergeMap(({handler, msg}) => !!handler ? of({handler, msg}) : throwError(() => ({
            code: 1,
            log: `NO_MSG_HANDLER:${msg.path}`
        }))),
        concatMap(({handler, msg}) => handler({msg, app, tx, reason})),
    );

const processQueryHandler = (app: App, path: string, data: Object) =>
    of(app.config.queryHandlers[path] || (() => of({
        code: 1,
        value: '',
        key: '',
        info: path,
        codespace: 'unknown',
        log: 'NO_QUERY_HANDLER'
    } satisfies QueryHandlerResult as QueryHandlerResult))).pipe(
        concatMap(handler => handler({app, path, data}))
    );


const placeholderProcessor: CommandProcessor = (app, data: any) => of(data);

const queryCmdProcessor: CommandProcessor = (app, query: RequestQuery) => {
    return of(query).pipe(
        map(query => JSON.parse(query.data.toString())),
        switchMap(data => processQueryHandler(app, query.path, data)),
        catchError(err => of({
            value: '',
            key: '',
            code: err.code || 1,
            info: '',
            codespace: 'unknown',
            log: err.log
        } satisfies QueryHandlerResult)),
        map(result => ResponseQuery.fromJSON({
            ...result,
            code: result.code || 0,
            info: result.info || '',
            codespace: result.codespace || 'unknown',
            log: result.log || '',
            key: stringToUint8Array(result.key || ''),
            value: stringToUint8Array(result.value || ''),
            height: query.height || 0,
            index: 0,
            proofOps: undefined
        } satisfies ResponseQuery)),
        switchMap(data => prepResponse('query', data))
    )
}

type CommandProcessor = (app: App, data: any) => Observable<Uint8Array>;

const commandProcessors: Record<keyof Request, CommandProcessor> = {
    info: infoCmdProcessor,
    flush: flushCmdProcessor,
    initChain: initChainCmdProcessor,
    prepareProposal: prepareProposalCmdProcessor,
    processProposal: processProposalCmdProcessor,
    finalizeBlock: finalizeBlockCmdProcessor,
    commit: commitCmdProcessor,
    checkTx: checkTxCmdProcessor,
    query: queryCmdProcessor,


    applySnapshotChunk: placeholderProcessor,
    echo: placeholderProcessor,
    extendVote: placeholderProcessor,
    listSnapshots: placeholderProcessor,
    loadSnapshotChunk: placeholderProcessor,
    offerSnapshot: placeholderProcessor,
    verifyVoteExtension: placeholderProcessor

};

const prepResponse = <T>(cmd: keyof Response, data: T) => of({[cmd]: data}).pipe(
    map(response => Response.fromJSON(response)),
    map(response => Response.encode(response).finish())
);

export type AppJSON = {
    lastAppHash: string
    lastHeight: number
}

const updateAppJSON = (home: string, updates: Partial<AppJSON>) =>
    readAppJSON(home).pipe(
        map(obj => ({
            ...obj,
            ...updates
        })),
        map(obj => JSON.stringify(obj)),
        switchMap(content => fs.promises.writeFile(`${home}/data/app.json`, content, {}))
    );

const readAppJSON = (home: string) =>
    of(home).pipe(
        switchMap(home => fs.promises.readFile(`${home}/data/app.json`)),
        map(json => JSON.parse(json.toString())),
        catchError(err => of({})),
        map(obj => obj as AppJSON)
    );

const calculateAppHash = (app: App) =>
    combineLatest([
        readAppJSON(app.config.home),
        hash(app.appStore)
    ]).pipe(
        map(([prevHash, storeHash]) => cryptoHash('SHA256', prevHash + storeHash, 'buffer')),
    );

export const readCometConfig = memoize((app: App) =>
    from(fs.promises.readFile(`${app.config.home}/config/config.toml`)).pipe(
        map(doc => parse(doc.toString()) as CometConfig)
    )
)

