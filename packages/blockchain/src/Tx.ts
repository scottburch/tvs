import {combineLatest, map, of, switchMap} from "rxjs";
import {
    deserializeKey,
    deserializeSig, KeyPair, SerializedPubKey, SerializedSig, serializeKey,
    serializeSig,
    sign,
    verify
} from "@my-blockchain/crypto";

import {stringToUint8Array, uint8ArrayToString} from "uint8array-extras";

export type Message<T extends Object> = {
    path: string,
    data: T
}

export type Transaction = {
    sig: SerializedSig
    signer: SerializedPubKey
    msgs: Message<any>[]
}

export type UnsignedTransaction = Omit<Transaction, 'sig' | 'signer'>

export const newTransaction = <M extends Object>(tx: UnsignedTransaction) =>
    of(tx);

export const signTx = (tx: UnsignedTransaction, keys: KeyPair) =>
    getSignDataFromTx(tx).pipe(
        switchMap(bytes => sign(bytes, keys.privKey)),
        switchMap(sig => combineLatest([serializeSig(sig), serializeKey(keys.pubKey)])),
        map(([sig, pubKey]) => ({...tx, sig, signer: pubKey} as Transaction))
    );

export const verifyTx = (tx: Transaction) =>
    combineLatest([getSignDataFromTx(tx), deserializeSig(tx.sig), deserializeKey(tx.signer)]).pipe(
        switchMap(([data, sig, pubKey]) => verify(data, sig, pubKey))
    );

const getSignDataFromTx = (tx: Transaction | UnsignedTransaction) =>
    of(tx.msgs).pipe(
        map(msgs => JSON.stringify(msgs)),
        map(json => stringToUint8Array(json))
    );

export const serializeTx = (tx: Transaction) =>
    stringToUint8Array(JSON.stringify(tx));

export const deserializeTx = (bytes: Uint8Array) =>
    JSON.parse(uint8ArrayToString(bytes)) as Transaction;

