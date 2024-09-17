import {JSONRPCClient, JSONRPCRequest} from "json-rpc-2.0";
import {catchError, delay, from, map, Observable, of, switchMap, throwError} from "rxjs";
import {
    base64ToString,
    hexToUint8Array,
    stringToUint8Array,
    uint8ArrayToBase64,
    uint8ArrayToHex
} from "uint8array-extras";
import {ResponseQuery} from "@tvs/proto";
import {Transaction} from "./Tx.js";

export type TvsClient = {
    rpc: JSONRPCClient
}

export type QueryResponse = Omit<ResponseQuery, 'key' | 'value'> & {
    key: string
    value: string
};

export type BroadcastTxResponse = {
    hash: string,
    height: string,
    code: string,
    log: string
}


export const tvsClient = () => ({rpc: jsonRpcClient()});


export const broadcastTx = (client: TvsClient, tx: Transaction) =>
    from(client.rpc.request('broadcast_tx_sync', {tx: btoa(JSON.stringify(tx))})).pipe(
        switchMap(resp => resp.code !== 0 ? throwError(() => resp) : of(resp)),
        map(resp => ({code: resp.code, log: resp.log, hash: resp.hash}))
    );


export const txByHash = (client: TvsClient, hash: string, opts: {proof: boolean} = {proof: false}) =>
    of(hash).pipe(
        map(hex => hexToUint8Array(hex)),
        map(bytes => uint8ArrayToBase64(bytes)),
        switchMap(base64Hash => client.rpc.request('tx', {hash: base64Hash, prove: opts.proof})),
        map(result => ({hash: result.hash, height: result.height, tx: result.tx, proof: result.proof}))
    );

export const waitForTx = (client: TvsClient, hash: string, count: number = 0): Observable<any> =>
    from(txByHash(client, hash)).pipe(
        catchError(err => of(err).pipe(
            switchMap(err => count > 100 ? throwError(() => err) : of(err)),
            switchMap(err => /tx.*not found/.test(err.data) ? of(err) : throwError(() => err)),
            delay(500),
            switchMap(() => waitForTx(client, hash, count + 1))
        ))
    );


export type Query = {
    path: string,
    data: Object,
    height?: string,
    proof?: boolean
}

export const query = (client: TvsClient, query: Query) =>
    of(query).pipe(
        map(opts => ({...opts, data: uint8ArrayToHex(stringToUint8Array(JSON.stringify(opts.data)))})),
        switchMap(params => client.rpc.request('abci_query', params)),
        map(({response}) => response as QueryResponse),
        map((response) => ({
            code: response.code,
            log: response.log,
            info: response.info,
            index: response.index,
            key: base64ToString(response.key || ''),
            value: base64ToString(response.value || ''),
            proof: response.proofOps
        }))
    )


const jsonRpcClient = () => {
    const c = new JSONRPCClient((jsonRPCRequest: JSONRPCRequest): any => {
        return fetch("http://localhost:26657", {
            method: "POST",
            headers: {
                "content-type": "application/json",
            },
            body: JSON.stringify(jsonRPCRequest),
        }).then((response) => {
            if (response.status === 200) {
                // Use client.receive when you received a JSON-RPC response.
                return response
                    .json()
                    .then((jsonRPCResponse) => c.receive(jsonRPCResponse));
            } else if (jsonRPCRequest.id !== undefined) {
                return Promise.reject(new Error(response.statusText));
            }
        });
    });
    return c;
};


