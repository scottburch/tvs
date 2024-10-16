import {generateNewKeyPair, KeyPair, keyPairFromSerializedPrivKey, SerializedPrivKey, SerializedPubKey, serializeKey} from "@my-blockchain/crypto";
import {combineLatest, from, map, of, switchMap, throwError} from "rxjs";
import {BroadcastTxResponse, Query} from "../rpc-client.js";
import {signTx, Transaction} from "../Tx.js";
import {QueryHandlerResult} from "../app.js";

export type ApiClientOpts = {
    url: string
    privKey: SerializedPrivKey
}

const fetchOptions = {
    method: 'POST',
    headers: {'Content-type': 'application/json'}
}

export type ApiClient = {keys: KeyPair, pubKey: SerializedPubKey} & Omit<ApiClientOpts, 'privKey'>;

export const newApiClient = (opts: ApiClientOpts) => keyPairFromSerializedPrivKey(opts.privKey).pipe(
    switchMap(keys => combineLatest([
        of(keys),
        serializeKey(keys.pubKey)
    ])),
    map(([keys, pubKey]) => ({url: opts.url, keys, pubKey} satisfies ApiClient as ApiClient))
);

export const sendTx = (client: ApiClient, tx: Transaction) =>
    signTx(tx, client.keys).pipe(
        switchMap(tx => fetch(`${client.url}/tx`, {
            ...fetchOptions,
//            mode: 'no-cors',
            body: JSON.stringify(tx)
        })),
        switchMap(resp => resp.json()),
        switchMap(resp => resp.code ? throwError(() => resp) : of(resp)),
        map(result => result as BroadcastTxResponse)
    );

export const sendQuery = <T = string>(client: ApiClient, query: Query) =>
    from(fetch(`${client.url}/query`, {
        ...fetchOptions,
//        mode: 'no-cors',
        body: JSON.stringify(query)
    })).pipe(
        switchMap(resp => resp.json()),
        switchMap(resp => resp.code ? throwError(() => resp) : of(resp)),
        map(resp => ({...resp, value: JSON.parse(resp.value ? resp.value : '{}')} as QueryHandlerResult<T>))
    );

export const getTxByHash = (client: ApiClient, hash: string) =>
    from(fetch(`${client.url}/tx-by-hash`, {
        ...fetchOptions,
//        mode: 'no-cors',
        body: JSON.stringify({hash})
    })).pipe(
        switchMap(resp => resp.json()),
        map(result => result  as {hash: string, height: string, tx: string})
    );

export const waitForTx = (client: ApiClient, hash: string) =>
    from(fetch(`${client.url}/wait-for-tx`, {
        ...fetchOptions,
//        mode: 'no-cors',
        body: JSON.stringify({hash})
    })).pipe(
        switchMap(resp => resp.json())
    );

export const newRandomApiClient = (url: string = 'http://localhost:1234', privKey: SerializedPrivKey = '' as SerializedPrivKey) =>
    (privKey ? of(privKey) : generateNewKeyPair().pipe(
        switchMap(keys => serializeKey(keys.privKey))
    )).pipe(
        switchMap(privKey => newApiClient({url, privKey}))
    );