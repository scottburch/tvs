import {catchError, combineLatest, firstValueFrom, of, switchMap, tap, timer} from "rxjs";
import {
    newTransaction,
    sendQuery,
    sendTx,
    signTx,
    newRandomApiClient,
    waitForCometDown, waitForTx
} from "@tvs/blockchain";
import {expect} from "chai";
import {addAdmin, addKeyMaker, addRace, addVoteCounter, readVotesByVoter, vote} from "./vote-client.js";
import {KeyMaker, VoteCounter} from "./types.js";
import {startVoteSwarm} from "./test-utils/startVoteSwarm.js";

describe('vote counter', () => {
    it('can be created', (done) => {
        firstValueFrom(startVoteSwarm().pipe(
            switchMap(() => combineLatest([newRandomApiClient(), newRandomApiClient(), newRandomApiClient()])),
            switchMap(([adminClient, keyMakerClient, voteCounterClient]) => of(undefined).pipe(
                switchMap(() => addAdmin(adminClient)),
                switchMap(() => addKeyMaker(adminClient, keyMakerClient.pubKey)),
                switchMap(() => addVoteCounter(keyMakerClient, voteCounterClient.pubKey)),
                switchMap(() => sendQuery<KeyMaker[]>(keyMakerClient, {path: 'get-vote-counters', data: {}})),
                tap(results => {
                    expect(results.value).to.have.length(1);
                    expect(results.value[0].pubKey).to.equal(voteCounterClient.pubKey);
                })
            )),
            tap(() => waitForCometDown().then(() => done())),
            catchError(err => of(done(err))),
        ));
    });

    it('can vote more than once', (done) => {
        firstValueFrom(startVoteSwarm().pipe(
            switchMap(() => combineLatest([newRandomApiClient(), newRandomApiClient(), newRandomApiClient()])),
            switchMap(([adminClient, keyMakerClient, counterClient]) => of(undefined).pipe(
                switchMap(() => addAdmin(adminClient)),
                switchMap(() => addKeyMaker(adminClient, keyMakerClient.pubKey)),
                switchMap(() => addVoteCounter(keyMakerClient, counterClient.pubKey)),
                switchMap(() => addRace(adminClient, {name: 'dog-catcher', candidates: ['Todd', 'Scott']})),
                switchMap(() => combineLatest([
                    vote(counterClient, {
                        candidate: 'Todd',
                        race: 'dog-catcher',
                    }),
                    timer(10).pipe(switchMap(() => vote(counterClient, {
                        candidate: 'Scott',
                        race: 'dog-catcher'
                    }))),
                    timer(20).pipe(switchMap(() => vote(counterClient, {
                        candidate: 'Todd',
                        race: 'dog-catcher'
                    }))),
                    timer(30).pipe(switchMap(() => vote(counterClient, {
                        candidate: 'Jim',
                        race: 'dog-catcher'
                    })))
                ])),
                switchMap(() => readVotesByVoter(counterClient, counterClient.pubKey)),
                // This is not working because votes are stored by pubKey - so a vote counter can only store one vote
                tap(votes => expect(votes).to.have.length(4))
            )),
            tap(() => waitForCometDown().then(() => done())),
            catchError(err => of(done(err)))
        ));
    });

    it('can only be created by a key maker', (done) => {
        firstValueFrom(startVoteSwarm().pipe(
            switchMap(() => newRandomApiClient()),
            switchMap(client => of(undefined).pipe(
                switchMap(() => addVoteCounter(client, client.pubKey)),
                catchError(err => of(err)),
                tap(err => {
                    expect(err.code).to.equal(1);
                    expect(err.log).to.equal('NOT_KEY_MAKER')
                }),
                switchMap(() => sendQuery<KeyMaker[]>(client, {path: 'get-vote-counters', data: {}})),
                tap(x => x),
                tap(results => {
                    expect(results.value).to.have.length(0);
                })
            )),
            tap(() => waitForCometDown().then(() => done())),
            catchError(err => of(done(err))),
        ));
    });

    it('ensures that the maker key is the same as the signer', (done) => {
        firstValueFrom(startVoteSwarm().pipe(
            switchMap(() => combineLatest([newRandomApiClient(), newRandomApiClient(), newRandomApiClient(), newRandomApiClient()])),
            switchMap(([adminClient, keyMakerClient1, keyMakerClient2, voteCounterClient]) => of(undefined).pipe(
                switchMap(() => addAdmin(adminClient)),
                switchMap(() => addKeyMaker(adminClient, keyMakerClient1.pubKey)),
                switchMap(() => addKeyMaker(adminClient, keyMakerClient2.pubKey)),
                switchMap(() => newTransaction<VoteCounter>({
                    msgs: [{
                        path: 'create-vote-counter',
                        data: {pubKey: voteCounterClient.pubKey, maker: keyMakerClient2.pubKey}
                    }]
                })),
                switchMap(tx => signTx(tx, keyMakerClient1.keys)),
                switchMap(tx => sendTx(keyMakerClient1, tx)),
                switchMap(({hash}) => waitForTx(keyMakerClient1, hash)),
                catchError(err => of(err)),
                tap(err => {
                    expect(err.code).to.equal(1);
                    expect(err.log).to.equal('MAKER_NOT_SIGNER');
                }),
                switchMap(() => sendQuery<KeyMaker[]>(keyMakerClient1, {path: 'get-vote-counters', data: {}})),
                tap(results => {
                    expect(results.value).to.have.length(0);
                })
            )),
            tap(() => waitForCometDown().then(() => done())),
            catchError(err => of(done(err))),
        ));

    })
})