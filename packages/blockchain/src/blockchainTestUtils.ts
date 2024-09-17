import {homedir} from "node:os";
import {
    broadcastTx,
    newApiClient,
    newTransaction, Query, sendQuery,
    sendTx,
    signTx,
    startApp,
    UnsignedTransaction,
    tvsClient
} from "./index.js";
import {combineLatest, firstValueFrom, from, map, of, switchMap} from "rxjs";
import {fs} from 'zx'
import {waitFor} from "poll-until-promise";
import psList from "ps-list";
import {AppConfig} from "./index.js";
import {generateNewKeyPair, serializeKey} from "@tvs/crypto";
import {getDir} from "./utils.js";


export const startCleanValidator = (config: Partial<AppConfig> = {}, startAppFn: typeof startApp = startApp) =>
    from(fs.rm(`${homedir()}/.tvs-test`, {recursive: true, force: true})).pipe(
        switchMap(() => fs.promises.mkdir(`${homedir()}/.tvs-test`)),
        map(() => getDir(import.meta.url)),
        switchMap(dir => fs.promises.cp(`${dir}/../tvs-template`, `${homedir()}/.tvs-test`, {recursive: true})),
        switchMap(() => startAppFn({
            appVersion: 1,
            version: '1.0.0',
            home: `${homedir()}/.tvs-test`,
            queryHandlers: {},
            msgHandlers: {},
            ...config
        })),
    );

export const waitForCometDown = () => waitFor(() => {
    return firstValueFrom(from(psList()).pipe(
        map(processes => !processes.find(p => /cometbft/.test(p.name))),
    ))
}, {timeout: 15000});

export const broadcastTestTx = (tx: UnsignedTransaction) =>
    generateNewKeyPair().pipe(
        switchMap(keys => combineLatest([
            of(keys),
            newTransaction(tx)
        ])),
        switchMap(([keys, tx]) => signTx(tx, keys)),
        map(tx => ({client: tvsClient(), tx})),
        switchMap(({client, tx}) => broadcastTx(client, tx).pipe(map(({hash}) => ({hash, client})))),
    );

export const testApiClient = () => generateNewKeyPair().pipe(
    switchMap(keys => serializeKey(keys.privKey)),
    switchMap(privKey => newApiClient({url: 'http://localhost:1234', privKey}))
);

export const sendTestTx = (tx: UnsignedTransaction) =>
    combineLatest([
        newTransaction(tx),
        testApiClient()
    ]).pipe(
        switchMap(([tx, client]) => of(undefined).pipe(
            switchMap(() => signTx(tx, client.keys)),
            switchMap(tx => sendTx(client, tx)),
            map(result => ({result, client, tx}))
        ))
    );

export const sendTestQuery = (query: Query) =>
    testApiClient().pipe(
        switchMap(client => sendQuery(client, query))
    )






