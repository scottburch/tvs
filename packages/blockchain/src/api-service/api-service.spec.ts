import {startTestSwarm, waitForCometDown} from "../blockchainTestUtils.js";
import {catchError, delay, firstValueFrom, of, switchMap, tap, throwError} from "rxjs";
import {getTxByHash, newApiClient, sendQuery, sendTx} from "../api-client/api-client.js";
import {generateNewKeyPair, serializeKey} from "@my-blockchain/crypto";

import {expect} from "chai";
import {newTransaction, signTx} from "../Tx.js";


describe('api service', () => {
    it('should startup the api proxy service based on paths passed to the app', (done) => {
        firstValueFrom(startTestSwarm({
            msgHandlers: {'my/tx': () => of(undefined)},
            queryHandlers: {'my/query': ({data}) => of({key: 'my-key', value: JSON.stringify({foo:10, ...data})})}
        }).pipe(
            delay(1000),
            switchMap(generateNewKeyPair),
            switchMap(keys => serializeKey(keys.privKey)),
            switchMap(privKey => newApiClient({url: 'http://localhost:1234', privKey})),
            switchMap(client => of(undefined).pipe(
                switchMap(() => newTransaction({msgs: [{path: 'my/tx', data: {foo: 10}}]})),
                switchMap(tx => signTx(tx, client.keys)),
                switchMap(tx => sendTx(client, tx)),
                tap(result => {
                    expect(result.code).to.equal(0);
                    expect(result.log).to.equal('');
                    expect(result.hash).to.have.length(64);
                }),
                delay(1000),
                switchMap(({hash}) => getTxByHash(client, hash)),
                tap(results => {
                    expect(results.tx).to.have.length(264);
                }),
                switchMap(() => sendQuery(client, {path: 'my/query', data: {bar: 1}, height: '0', proof: false})),
                tap(result => {
                    expect(result).to.deep.equal({
                        code: 0,
                        index: "0",
                        info: "",
                        key: "my-key",
                        log: "",
                        proof: null,
                        value: {bar: 1,foo: 10}
                    })
                })
            )),
            tap(() => waitForCometDown().then(() => done())),
            catchError(err => of(done(err)))
        ))
    });

    it('should forward errors to the api-client', (done) => {
        firstValueFrom(startTestSwarm({
            msgHandlers: {'my/tx': _ => throwError(() => ({code: 1, log: 'some error'}))},
        }).pipe(
            switchMap(() => generateNewKeyPair()),
            switchMap(keys => serializeKey(keys.privKey)),
            switchMap(privKey => newApiClient({url: 'http://localhost:1234', privKey})),
            switchMap(client => of(undefined).pipe(
                switchMap(() => newTransaction({msgs: [{path: 'my/tx', data: {}}]})),
                switchMap(tx => signTx(tx, client.keys)),
                switchMap(tx => sendTx(client, tx)),
                tap(() => done('should not reach here')),
                catchError(err => of(err)),
                tap(err => {
                    expect(err.code).to.equal(1);
                }),
                tap(() => waitForCometDown().then(() => done())),
            ))
        ))
    });

});