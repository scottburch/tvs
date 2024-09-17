import {catchError, combineLatest, firstValueFrom, of, switchMap, tap} from "rxjs";
import {
    newApiClient,
    newTransaction,
    sendQuery,
    sendTx,
    signTx,
    startCleanValidator,
    testApiClient,
    waitForCometDown
} from "@tvs/blockchain";
import {startVoteApp} from "./voteApp.js";
import {generateNewKeyPair, serializeKey} from "@tvs/crypto";
import {expect} from 'chai'
import {addAdmin, readAdmin} from "./vote-client.js";
import {Admin} from "./types.js";


describe('voting admin', () => {
    it('should create and read voting admin', (done) => {
        firstValueFrom(startCleanValidator({}, startVoteApp).pipe(
            switchMap(() => testApiClient()),
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
        firstValueFrom(startCleanValidator({}, startVoteApp).pipe(
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
        firstValueFrom(startCleanValidator({}, startVoteApp).pipe(
            switchMap(() => testApiClient()),
            switchMap(client => of(undefined).pipe(
                switchMap(() => addAdmin(client)),
                switchMap(() => sendQuery<Admin>(client, {path: 'get-admin', data: {}})),
                catchError(err => of(err)),
                tap(resp => {
                    expect(resp.code).to.equal(0);
                    expect(resp.value.pubKey).to.equal(client.pubKey);
                })
            )),
            switchMap(() => testApiClient()),
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
        firstValueFrom(startCleanValidator({}, startVoteApp).pipe(
            switchMap(() => testApiClient()),
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