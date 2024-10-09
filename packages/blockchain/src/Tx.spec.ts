import {deserializeTx, newTransaction, serializeTx, signTx, Transaction, verifyTx} from "./Tx.js";
import {combineLatest, firstValueFrom, map, of, switchMap, tap} from "rxjs";
import {generateNewKeyPair, SerializedSig} from "@my-blockchain/crypto";
import {expect} from "chai";
import {isUint8Array} from "uint8array-extras";

describe('transaction stuff', () => {
    it('should sign and verify the signature of a transaction', () =>
        firstValueFrom(generateNewKeyPair().pipe(
            switchMap(keys => of(undefined).pipe(
                switchMap(() => newTransaction({msgs: [{path: 'my/path', data: {foo: 10}}]})),
                switchMap(tx => signTx(tx, keys)),
                switchMap(tx => verifyTx(tx)),
                tap(valid => expect(valid).to.be.true)
            ))
        ))
    );

    it('should validate a transaction with a invalid signature as false', () =>
        firstValueFrom(generateNewKeyPair().pipe(
            switchMap(keys => of(undefined).pipe(
                switchMap(() => newTransaction({msgs: [{path: 'my/path', data: {foo: 10}}] })),
                switchMap(tx => signTx(tx, keys)),
                map(tx => ({...tx, sig: tx.sig.replace(/[abcdefghijkl]/, 'A') as SerializedSig} satisfies Transaction as Transaction)),
                switchMap(tx => verifyTx(tx)),
                tap(valid => expect(valid).to.be.false)
            ))
        ))
    );

    it('should serialize and deserialize a transaction into a Uint8Array', () =>
        firstValueFrom(newTransaction({
            msgs: [{path: 'my/transaction', data: {foo: 10}}]
        }).pipe(
            switchMap(tx => combineLatest([
                of(tx),
                generateNewKeyPair()
            ])),
            switchMap(([tx, keys]) => signTx(tx, keys)),
            map(tx => ({tx, serTx: serializeTx(tx)})),
            tap(({serTx}) => expect(isUint8Array(serTx)).to.be.true),
            map(({tx, serTx}) => ([tx, deserializeTx(serTx)])),
            tap(([origTx, tx]) => expect(tx).to.deep.equal(origTx))
        ))
    )
})