import {
    catchError,
    combineLatest,
    firstValueFrom,
    from, last,
    map, mergeMap,
    of, range,
    switchMap,
    tap,
    throwError,
    toArray
} from "rxjs";
import {
    MsgHandler,
    MsgHandlerOpts,
    QueryHandler,
    QueryHandlerOpts,
    QueryHandlerResult,
    readCometConfig
} from "./app.js";
import {generateNewKeyPair} from "@tvs/crypto";
import {expect} from "chai";
import {ResponseCheckTx} from "@tvs/proto";
import {exists, findPrefix, get, put} from "./appStore.js";
import {broadcastTestTx, startTestSwarm, waitForCometDown} from "./blockchainTestUtils.js";
import {broadcastTx, query, tvsClient, waitForTx} from "./rpc-client.js";
import {newTransaction, signTx, Transaction} from "./Tx.js";

describe('the application functions', () => {
    describe('reading the toml configs', () => {
        it('should be able to read the config.toml file', (done) => {
            firstValueFrom(startTestSwarm().pipe(
                switchMap(apps => readCometConfig(apps[0])),
                tap(() => waitForCometDown().then(() => done()))
            ));
        });
    });

    describe('mempool transaction processing', () => {
        it('should not allow a transaction into the mempool with a bad signature', (done) => {
            firstValueFrom(startTestSwarm().pipe(
                switchMap(() => generateNewKeyPair()),
                switchMap(keys => combineLatest([
                    of(keys),
                    newTransaction({
                        msgs: [{path: 'my/transaction', data: {foo: 10}}]
                    })
                ])),
                switchMap(([keys, tx]) => signTx(tx, keys)),
                map(tx => ({...tx, sig: tx.sig.toUpperCase()} as Transaction)),
                map(tx => ({client: tvsClient(), tx})),
                switchMap(({client, tx}) => broadcastTx(client, tx).pipe(map(({hash}) => ({hash, client})))),
                switchMap(() => throwError(() => 'Should not reach here')),
                catchError(err => of(err)),
                tap((result: ResponseCheckTx) => {
                    expect(result.code).to.equal(1);
                    expect(result.log).to.equal('INVALID_SIGNATURE')
                }),
                tap(() => waitForCometDown().then(() => done())),
                catchError(err => of(done(err)))
            ))
        });

        it('should call message handlers when a transaction is sent to the mempool', (done) => {
            const msgProcessor = (opts: MsgHandlerOpts<any>) => {
                expect(opts.msg.path).to.equal('my/path')
                expect(opts.tx.msgs).to.have.length(1)
                expect(opts.app.config.appVersion).to.equal(1)
                expect(opts.reason).to.equal('checkTx')
                waitForCometDown().then(() => done());
                return of(undefined);
            }

            firstValueFrom(startTestSwarm({msgHandlers: {'my/path': msgProcessor}}).pipe(
                switchMap(() => broadcastTestTx({msgs: [{path: 'my/path', data: {foo: 10}}]}))
            ))
        });

        it('should clear the mem store after messages are processed during mempool checks', (done) => {
            const msgProcessor = (opts: MsgHandlerOpts<any>) =>
                put(opts.app.appStore, 'my-key', 'my-val');


            firstValueFrom(startTestSwarm({msgHandlers: {'my/path': msgProcessor}}).pipe(
                switchMap(apps => of(undefined).pipe(
                    switchMap(() => combineLatest([
                        broadcastTestTx({msgs: [{path: 'my/path', data: {foo: 10}}]}),
                    ])),
                    switchMap(() => exists(apps[0].appStore, 'my-key')),
                    switchMap(exists => exists ? throwError(() => 'key should not exist') : of(undefined)),
                    tap(() => waitForCometDown().then(() => done())),
                    catchError(err => of(done(err))),
                ))
            ))
        });

        it('should not allow a transaction into the mempool if a message handler throws exception', (done) => {
            const msgProcessor = (_: MsgHandlerOpts<any>) => of(undefined).pipe(
                switchMap(() => throwError(() => ({code: 1, log: 'some error'})))
            )

            firstValueFrom(startTestSwarm({msgHandlers: {'my/path': msgProcessor}}).pipe(
                    switchMap(() => broadcastTestTx({msgs: [{path: 'my/path', data: {foo: 10}}]})),
                    tap(() => done('should not reach here.  Should throw error')),
                    catchError(err => of(err)),
                    tap(() => waitForCometDown().then(() => done())),
                    tap(err => {
                        expect(err.code).to.equal(1);
                        expect(err.log).to.equal('some error');
                        expect(err.hash).to.have.length(64);
                        expect(err.codespace).to.equal('app');
                    }),
                    catchError(err => of(done(err)))
            ))
        });
    });

    describe('processing transactions for inclusion in a block', () => {
        it('should return an error if a message in the transaction has no handler', (done) => {
            firstValueFrom(startTestSwarm().pipe(
                switchMap(() => broadcastTestTx({msgs: [{path: 'no-path', data: {}}]})),
                catchError(err => of(err)),
                tap(err => {
                    expect(err.code).to.equal(1);
                    expect(err.log).to.equal('NO_MSG_HANDLER:no-path');
                }),
                tap(() => waitForCometDown().then(() => done())),
                catchError(err => of(done(err)))
            ))
        });

        it('should work if one of the transactions fails', (done) => {
            const msgProcessor = (opts: MsgHandlerOpts<any>) => {
                return (opts.reason === 'finalize' && opts.msg.path === 'bad' ? throwError(() => ({
                        code: 1,
                        log: 'throwing'
                    })) : of(undefined)).pipe(
                    switchMap(() => put(opts.app.appStore, 'my-key', opts.msg.path + opts.reason))
                )
            };

            const myQuery = (opts: QueryHandlerOpts<{}>) => {
                return get(opts.app.appStore, 'my-key').pipe(
                    map(value => ({code: 0, value})),
                    catchError(err => of({code: 1, log: JSON.stringify(err)}))
                )
            }

            firstValueFrom(startTestSwarm({
                msgHandlers: {
                    'good': msgProcessor,
                    'bad': msgProcessor
                },
                queryHandlers: {
                    'my-query': myQuery
                }
            }).pipe(
                switchMap(() => combineLatest([
                    broadcastTestTx({msgs: [{path: 'good', data: {}}]}),
                    broadcastTestTx({msgs: [{path: 'bad', data: {}}]})
                ])),
                switchMap(([result1, result2]) => combineLatest([
                    waitForTx(result1.client, result1.hash),
                    waitForTx(result2.client, result2.hash)
                ])),
                map(() => tvsClient()),
                switchMap(client => query(client, {path: 'my-query', data: {}, proof: false, height: '0'})),
                tap(result => expect(result.value).to.equal('goodfinalize')),
                tap(() => waitForCometDown().then(() => done())),
                catchError(err => of(done(err)))
            ))

        });

        it('should call a message handler for transactions going into a block storing state changes', (done) => {
            const msgProcessor = (opts: MsgHandlerOpts<any>) => {
                return get(opts.app.appStore, opts.msg.data.key).pipe(
                    switchMap(val => put(opts.app.appStore, opts.msg.data.key + '2', opts.msg.data.val + val)),
                    catchError(() => put(opts.app.appStore, opts.msg.data.key, opts.msg.data.val))
                )
            }

            firstValueFrom(startTestSwarm({
                msgHandlers: {
                    'my/path1': msgProcessor,
                    'my/path2': msgProcessor,
                }
            }).pipe(
                switchMap(apps => of(undefined).pipe(
                    switchMap(() => combineLatest([
                        broadcastTestTx({msgs: [{path: 'my/path1', data: {key: 'foo1', val: 'val1'}}]}),
                        broadcastTestTx({msgs: [{path: 'my/path2', data: {key: 'foo2', val: 'val2'}}]}),
                    ])),
                    switchMap(([{hash: hash1, client}, {hash: hash2}]) => combineLatest([
                        waitForTx(client, hash1),
                        waitForTx(client, hash2)
                    ])),
                    switchMap(() => from(apps[0].appStore.disk.iterator()).pipe(
                        toArray(),
                        tap(stored => expect(stored).to.deep.equal([
                            ["foo1", "val1"],
                            ["foo2", "val2"]
                        ]))
                    )),
                    tap(() => waitForCometDown().then(() => done())),
                    catchError(err => of(done(err)))
                ))
            ))
        });
    });

    describe('querying', () => {
        const queryHandlerResponseBase = {
            log: '',
            codespace: '',
            info: '',
            code: 0,
            value: '',
            key: ''
        } satisfies QueryHandlerResult;

        it('should return an error message if no handler exists for this path', (done) => {
            firstValueFrom(startTestSwarm().pipe(
                switchMap(_ => of(undefined).pipe(
                    map(() => tvsClient()),
                    switchMap(client => query(client, {path: 'my/query', data: {foo: 10}, proof: false, height: '0'})),
                    tap(result => {
                        expect(result).to.deep.equal({
                            "code": 1,
                            "log": "NO_QUERY_HANDLER",
                            "info": "my/query",
                            "index": "0",
                            "key": "",
                            "value": "",
                            "proof": null
                        })
                    }),
                    tap(() => waitForCometDown().then(() => done())),
                    catchError(err => of(done(err)))
                ))
            ))

        })

        it('should call a query handler for queries', (done) => {
            const myQueryHandler: QueryHandler<{}, {}> = () => of({
                ...queryHandlerResponseBase,
                log: 'query ran',
                codespace: 'my-query',
                key: 'my-key',
                value: 'my-value'
            })


            firstValueFrom(startTestSwarm({
                queryHandlers: {
                    'my/query': myQueryHandler
                }
            }).pipe(
                switchMap(_ => of(undefined).pipe(
                    map(() => tvsClient()),
                    switchMap(client => query(client, {path: 'my/query', data: {foo: 10}, proof: false, height: '0'})),
                    tap(result => {
                        expect(result).to.deep.equal({
                            "code": 0,
                            "log": "query ran",
                            "info": "",
                            "index": "0",
                            "key": "my-key",
                            "value": "my-value",
                            "proof": null
                        })
                    }),
                    tap(() => waitForCometDown().then(() => done())),
                    catchError(err => of(done(err)))
                ))
            ))
        });

        it('should have a non zero code if exception thrown in handler', (done) => {
            const myQueryHandler: QueryHandler<{}, {}> = () => of(undefined).pipe(
                switchMap(() => throwError(() => ({code: 1, log: 'my-error'})))
            )


            firstValueFrom(startTestSwarm({
                queryHandlers: {
                    'my/query': myQueryHandler
                }
            }).pipe(
                switchMap(_ => of(undefined).pipe(
                    map(() => tvsClient()),
                    switchMap(client => query(client, {path: 'my/query', data: {foo: 10}, proof: false, height: '0'})),
                    tap(result => {
                        expect(result).to.deep.equal({
                            "code": 1,
                            "log": "my-error",
                            "info": "",
                            "index": "0",
                            "key": "",
                            "value": "",
                            "proof": null
                        })
                    }),
                    tap(() => waitForCometDown().then(() => done())),
                    catchError(err => of(done(err)))
                ))
            ))
        });
    });

    it('should work with multiple transactions quickly', (done) => {
        const COUNT = 200;
        const myMsgHandler: MsgHandler<any> = ({msg, app}) => of(msg).pipe(
            switchMap(msg => put(app.appStore, msg.data.key, msg.data.value)),
        );

        const myQueryHandler: QueryHandler<{}, {}> = ({app}) => of(undefined).pipe(
            switchMap(() => findPrefix(app.appStore, 'my-key-')),
            toArray(),
            map(val => ({
                key: 'results',
                value: JSON.stringify(val)
            })),
            catchError(err => of({code: 1, log: err.code}))
        );

        firstValueFrom(startTestSwarm({
            queryHandlers: {'my/query': myQueryHandler},
            msgHandlers: {'my/msg': myMsgHandler}
        }).pipe(
            switchMap(_ => of(undefined).pipe(
                map(() => tvsClient()),
                switchMap(() => range(0, COUNT).pipe(
                    mergeMap(count => of(undefined).pipe(
                        switchMap(() => broadcastTestTx({
                            msgs: [{path: 'my/msg', data: {key: `my-key-${count}`, value: `my-val-${count}`}}]
                        })),
                        switchMap(({hash}) => waitForTx(tvsClient(), hash)),
                    )),
                )),
                last(),
                switchMap(() => query(tvsClient(), {
                    path: 'my/query',
                    data: {},
                    proof: false,
                    height: '0'
                })),
                map(result => JSON.parse(result.value)),
                switchMap(results => range(0, COUNT).pipe(
                    map(n => results.find((r: any) => r[0] === `my-key-${n}`)),
                    tap(found => expect(found).not.to.be.undefined)
                )),
                last(),
                tap(() => waitForCometDown().then(() => done())),
                catchError(err => of(done(err)))
            ))
        ))
    });
});


