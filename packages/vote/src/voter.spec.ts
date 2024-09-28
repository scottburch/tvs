import {catchError, combineLatest, firstValueFrom, mergeMap, of, range, switchMap, tap, toArray} from "rxjs";
import {
    newTransaction,
    sendTx,
    signTx,
    testApiClient,
    waitForCometDown, waitForTx
} from "@tvs/blockchain";
import {addAdmin, addKeyMaker, addVoter, readVoter, readVoters} from "./vote-client.js";
import {expect} from "chai";
import {Voter} from "./types.js";
import {startVoteSwarm} from "./test-utils/startVoteSwarm.js";

describe('voter', () => {
    it('can be created', (done) => {
        firstValueFrom(startVoteSwarm().pipe(
            switchMap(() => combineLatest([testApiClient(), testApiClient(), testApiClient()])),
            switchMap(([adminClient, keyMakerClient, voterClient]) => of(undefined).pipe(
                switchMap(() => addAdmin(adminClient)),
                switchMap(() => addKeyMaker(adminClient, keyMakerClient.pubKey)),
                switchMap(() => addVoter(keyMakerClient, voterClient.pubKey)),
                switchMap(() => readVoter(voterClient, voterClient.pubKey)),
                tap(voter => {
                    expect(voter.pubKey).to.equal(voterClient.pubKey);
                    expect(voter.maker).to.equal(keyMakerClient.pubKey);
                })
            )),
            tap(() => waitForCometDown().then(() => done())),
            catchError(err => of(done(err))),
        ));
    });

    it('can only be created by a key maker', (done) => {
        firstValueFrom(startVoteSwarm().pipe(
            switchMap(() => combineLatest([testApiClient(), testApiClient()])),
            switchMap(([fakeClient, voterClient]) => of(undefined).pipe(
                switchMap(() => addVoter(fakeClient, voterClient.pubKey)),
                catchError(err => of(err)),
                tap(err => {
                    expect(err.code).to.equal(1);
                    expect(err.log).to.equal('NOT_KEY_MAKER')
                }),
                switchMap(() => readVoter(voterClient, voterClient.pubKey)),
                catchError(err => of(err)),
                tap(err => {
                    expect(err.code).to.equal(1);
                    expect(err.log).to.equal('NOT_FOUND')
                })
            )),
            tap(() => waitForCometDown().then(() => done())),
            catchError(err => of(done(err))),
        ));
    });

    it('ensures that the maker address matches the tx signer', (done) => {
        firstValueFrom(startVoteSwarm().pipe(
            switchMap(() => combineLatest([testApiClient(), testApiClient(), testApiClient()])),
            switchMap(([adminClient, keyMakerClient, voterClient]) => of(undefined).pipe(
                switchMap(() => addAdmin(adminClient)),
                switchMap(() => addKeyMaker(adminClient, keyMakerClient.pubKey)),
                switchMap(() => newTransaction({
                    msgs: [{
                        path: 'create-voter',
                        data: {pubKey: voterClient.pubKey, maker: voterClient.pubKey} satisfies Voter
                    }]
                })),
                    switchMap(tx => signTx(tx, keyMakerClient.keys)),
                    switchMap(tx => sendTx(keyMakerClient, tx)),
                    switchMap(({hash}) => waitForTx(keyMakerClient, hash)),
                catchError(err => of(err)),
                tap(err => {
                    expect(err.code).to.equal(1);
                    expect(err.log).to.equal('NOT_KEY_MAKER')
                }),
                switchMap(() => readVoter(voterClient, voterClient.pubKey)),
                catchError(err => of(err)),
                tap(err => {
                    expect(err.code).to.equal(1);
                    expect(err.log).to.equal('NOT_FOUND')
                })
            )),
            tap(() => waitForCometDown().then(() => done())),
            catchError(err => of(done(err))),
        ));
    });

    it('can return a list of voters', (done) => {
        firstValueFrom(startVoteSwarm().pipe(
            switchMap(() => combineLatest([testApiClient(), testApiClient()])),
            switchMap(([adminClient, keyMakerClient]) => of(undefined).pipe(
                switchMap(() => addAdmin(adminClient)),
                switchMap(() => addKeyMaker(adminClient, keyMakerClient.pubKey)),
                switchMap(() => range(0, 5)),
                mergeMap(() => testApiClient()),
                mergeMap(client => addVoter(keyMakerClient, client.pubKey)),
                toArray(),
                switchMap(() => readVoters(adminClient)),
                tap(voters => {
                    expect(voters.length).to.equal(5);
                })
            )),
            tap(() => waitForCometDown().then(() => done())),
            catchError(err => of(done(err))),
        ));
    });
});