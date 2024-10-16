import {catchError, combineLatest, firstValueFrom, of, switchMap, tap} from "rxjs";
import {newApiClient, newTransaction, sendQuery, sendTx, signTx, newRandomApiClient, waitForCometDown} from "@my-blockchain/blockchain";
import {generateNewKeyPair, serializeKey} from "@my-blockchain/crypto";
import {expect} from 'chai'
import {addAdmin, readAdmin} from "./vote-client.js";
import {Admin} from "./types.js";
import {startVoteSwarm} from "./test-utils/startVoteSwarm.js";


describe('voting admin', () => {
    it('should create and read voting admin', (done) => {
        firstValueFrom(startVoteSwarm().pipe(
            switchMap(() => newRandomApiClient()),
            switchMap(adminClient => of(undefined).pipe(
                switchMap(() => addAdmin(adminClient)),
                switchMap(() => readAdmin(adminClient)),
                tap(result => expect(result.value.pubKey).to.equal(adminClient.pubKey)),
            )),
            tap(() => waitForCometDown().then(() => done())),
            catchError(err => of(done(err))),
        ))
    });

    it('should stop someone from putting in a pubKey that is not the pubKey of the signer', (done) => {
        firstValueFrom(startVoteSwarm().pipe(
            switchMap(() => generateNewKeyPair()),
            switchMap(keys => combineLatest([
                of(keys),
                serializeKey(keys.privKey)
            ])),
            switchMap(([keys, privKey]) => of(undefined).pipe(
                switchMap(() => newApiClient({url: 'http://localhost:1234', privKey})),
                switchMap(client => of(undefined).pipe(
                    switchMap(() => newTransaction({
                        msgs: [{
                            path: 'set-admin',
                            data: {pubKey: 'aaa'}
                        }]
                    })),
                    switchMap(tx => signTx(tx, keys)),
                    switchMap(tx => sendTx(client, tx)),
                    catchError(err => of(err)),
                    tap(err => expect(err.log).to.equal('PUBKEY_SIGNER_MISMATCH')),
                    switchMap(() => sendQuery<Admin>(client, {path: 'get-admin', data: {}})),
                    catchError(err => of(err)),
                    tap(resp => {
                        expect(resp.code).to.equal(1);
                        expect(resp.log).to.equal('ADMIN_NOT_FOUND');
                    }),
                    tap(() => waitForCometDown().then(() => done())),
                    catchError(err => of(done(err))),
                ))
            ))
        ));
    });

    it('should stop someone from changing the admin after creation', (done) => {
        firstValueFrom(startVoteSwarm().pipe(
            switchMap(() => newRandomApiClient()),
            switchMap(client => of(undefined).pipe(
                switchMap(() => addAdmin(client)),
                switchMap(() => sendQuery<Admin>(client, {path: 'get-admin', data: {}})),
                catchError(err => of(err)),
                tap(resp => {
                    expect(resp.code).to.equal(0);
                    expect(resp.value.pubKey).to.equal(client.pubKey);
                })
            )),
            switchMap(() => newRandomApiClient()),
            switchMap(client => addAdmin(client)),
            catchError(err => of(err)),
            tap(err => {
                expect(err.code).to.equal(1);
                expect(err.log).to.match(/^NOT_OWNER/)
            }),
            tap(() => waitForCometDown().then(() => done())),
            catchError(err => of(done(err))),
        ));
    });

    it('should throw error if no admin exists', (done) => {
        firstValueFrom(startVoteSwarm().pipe(
            switchMap(() => newRandomApiClient()),
            switchMap(client => readAdmin(client)),
            catchError(err => of(err)),
            tap(err => {
                expect(err.code).to.equal(1);
                expect(err.log).to.equal('ADMIN_NOT_FOUND')
            }),
            tap(() => waitForCometDown().then(() => done())),
            catchError(err => of(done(err))),
        ));

    })
});