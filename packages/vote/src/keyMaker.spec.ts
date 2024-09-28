import {catchError, combineLatest, firstValueFrom, of, switchMap, tap} from "rxjs";
import {sendQuery, testApiClient, waitForCometDown} from "@tvs/blockchain";
import {expect} from 'chai'
import {addAdmin, addKeyMaker, readKeyMaker, readKeyMakers} from "./vote-client.js";
import {KeyMaker} from "./types.js";
import {startVoteSwarm} from "./test-utils/startVoteSwarm.js";

describe('key makers', () => {
    it('should allow admin to create a key maker', (done) => {
        firstValueFrom(startVoteSwarm().pipe(
            switchMap(() => combineLatest([testApiClient(), testApiClient()])),
            switchMap(([adminClient, keyMakerClient]) => of(undefined).pipe(
                switchMap(() => addAdmin(adminClient)),
                switchMap(() => addKeyMaker(adminClient, keyMakerClient.pubKey)),
                switchMap(() => sendQuery<KeyMaker[]>(keyMakerClient, {path: 'get-key-makers', data: {}})),
                tap(results => {
                    expect(results.value).to.have.length(1);
                    expect(results.value[0].pubKey).to.equal(keyMakerClient.pubKey);
                })
            )),
            tap(() => waitForCometDown().then(() => done())),
            catchError(err => of(done(err))),
        ));
    });

    it('should allow a keymaker to create a keymaker', (done) => {
        firstValueFrom(startVoteSwarm().pipe(
            switchMap(() => combineLatest([testApiClient(), testApiClient(), testApiClient()])),
            switchMap(([adminClient, keyMakerClient, newKeyMakerClient]) => of(undefined).pipe(
                switchMap(() => addAdmin(adminClient)),
                switchMap(() => addKeyMaker(adminClient, keyMakerClient.pubKey)),
                switchMap(() => addKeyMaker(keyMakerClient, newKeyMakerClient.pubKey)),
                switchMap(() => sendQuery<KeyMaker[]>(keyMakerClient, {path: 'get-key-makers', data: {}})),
                tap(results => {
                    expect(results.value).to.have.length(2);
                })
            )),
            tap(() => waitForCometDown().then(() => done())),
            catchError(err => of(done(err))),
        ));

    });

    it('should not allow just anyone to create a keymaker', (done) => {
        firstValueFrom(startVoteSwarm().pipe(
            switchMap(() => combineLatest([testApiClient(), testApiClient(), testApiClient()])),
            switchMap(([adminClient, keyMakerClient, otherClient]) => of(undefined).pipe(
                switchMap(() => addAdmin(adminClient)),
                switchMap(() => addKeyMaker(otherClient, keyMakerClient.pubKey)),
                catchError(err => of(err)),
                tap(err => {
                    expect(err.code).to.equal(1);
                    expect(err.log).to.equal('NOT_ALLOWED_TO_CREATE_KEYMAKER');
                }),
                switchMap(() => readKeyMakers(otherClient)),
                tap(keyMakers => {
                    expect(keyMakers).to.have.length(0);
                }),
            )),
            tap(() => waitForCometDown().then(() => done())),
            catchError(err => of(done(err)))
        ))
    });

    describe('readKeyMaker()', () => {
        it('should be able to find a keymaker by pubKey', (done) => {
            firstValueFrom(startVoteSwarm().pipe(
                switchMap(() => combineLatest([testApiClient(), testApiClient(), testApiClient()])),
                switchMap(([adminClient, keyMakerClient]) => of(undefined).pipe(
                    switchMap(() => addAdmin(adminClient)),
                    switchMap(() => addKeyMaker(adminClient, keyMakerClient.pubKey)),
                    switchMap(() => readKeyMaker(adminClient, keyMakerClient.pubKey)),
                    tap(results => {
                        expect(results.value.pubKey).to.equal(keyMakerClient.pubKey);
                    }),
                )),
                tap(() => waitForCometDown().then(() => done())),
                catchError(err => of(done(err)))

            ))
        });

        it('should throw error if keymaker not found', (done) => {
            firstValueFrom(startVoteSwarm().pipe(
                switchMap(() => testApiClient()),
                switchMap(client => of(undefined).pipe(
                    switchMap(() => readKeyMaker(client, client.pubKey)),
                    catchError(err => of(err)),
                    tap(err => {
                        expect(err.code).to.equal(1);
                        expect(err.log).to.equal(`KEY_MAKER_NOT_FOUND:${client.pubKey}`);
                    }),
                )),
                tap(() => waitForCometDown().then(() => done())),
                catchError(err => of(done(err)))
            ))
        })
    });
});