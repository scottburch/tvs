import {AppConfig, broadcastTx, newTransaction, Query, sendQuery, sendTx, signTx, startApp, tvsClient, UnsignedTransaction} from "./index.js";
import {combineLatest, firstValueFrom, from, map, of, switchMap} from "rxjs";
import {waitFor} from "poll-until-promise";
import psList from "ps-list";
import {generateNewKeyPair} from "@tvs/crypto";
import {startSwarm} from "@tvs/blockchain";
import {newRandomApiClient} from "./api-client/api-client.js";


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

export const sendTestTx = (tx: UnsignedTransaction) =>
    combineLatest([
        newTransaction(tx),
        newRandomApiClient()
    ]).pipe(
        switchMap(([tx, client]) => signTx(tx, client.keys).pipe(
            switchMap(tx => sendTx(client, tx)),
            map(result => ({result, client, tx}))
        ))
    );

export const sendTestQuery = (query: Query) =>
    newRandomApiClient().pipe(
        switchMap(client => sendQuery(client, query))
    );

export type StartVoteSwarmOpts = {
    numValidators?: number,
    numNodes?: number,
    msgHandlers?: AppConfig['msgHandlers'],
    queryHandlers?: AppConfig['queryHandlers']
}


export const startTestSwarm = (opts: StartVoteSwarmOpts = {}) =>
    startSwarm({
        chainId: 'my-chain',
        validators: Array(opts.numValidators || 1).fill(1).map((_, idx) => ({name: `val-${idx}`})),
        nodes: Array(opts.numNodes || 0).fill(1).map((_, idx) => ({name: `node-${idx}`})),
        msgHandlers: opts.msgHandlers || {},
        queryHandlers: opts.queryHandlers || {}
    }, startApp)







