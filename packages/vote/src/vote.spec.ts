import {catchError, combineLatest, firstValueFrom, mergeMap, of, range, switchMap, tap, toArray} from "rxjs";
import {newRandomApiClient, waitForCometDown} from "@my-blockchain/blockchain";
import {addAdmin, addKeyMaker, addRace, addVoteCounter, addVoter, readRaceResults, readVote, readVotesByRace, vote} from "./vote-client.js";
import {expect} from "chai";
import {startVoteSwarm} from "./test-utils/startVoteSwarm.js";

describe('votes', () => {

    it('should be able to read a vote by race and voter', (done) => {
        firstValueFrom(startVoteSwarm().pipe(
            switchMap(() => combineLatest([newRandomApiClient(), newRandomApiClient(), newRandomApiClient()])),
            switchMap(([adminClient, keyMakerClient, voterClient]) => of(undefined).pipe(
                switchMap(() => addAdmin(adminClient)),
                switchMap(() => addKeyMaker(adminClient, keyMakerClient.pubKey)),
                switchMap(() => addVoter(keyMakerClient, voterClient.pubKey)),
                switchMap(() => addRace(adminClient, {name: 'dog-catcher', candidates: ['Todd', 'Scott']})),
                switchMap(() => vote(voterClient, {
                    candidate: 'todd',
                    race: 'dog-catcher',
                })),
                switchMap(() => readVote(voterClient, 'dog-catcher', voterClient.pubKey)),
                tap(vote => {
                    expect(vote.candidate).to.equal('todd');
                    expect(vote.race).to.equal('dog-catcher');
                })
            )),
            tap(() => waitForCometDown().then(() => done())),
            catchError(err => of(done(err)))
        ));
    });

    it('should be able to read a votes by race', (done) => {
        firstValueFrom(startVoteSwarm().pipe(
            switchMap(() => combineLatest([newRandomApiClient(), newRandomApiClient(), newRandomApiClient()])),
            switchMap(([adminClient, keyMakerClient, counterClient]) => of(undefined).pipe(
                switchMap(() => addAdmin(adminClient)),
                switchMap(() => addKeyMaker(adminClient, keyMakerClient.pubKey)),
                switchMap(() => addVoteCounter(keyMakerClient, counterClient.pubKey)),
                switchMap(() => combineLatest([
                    addRace(adminClient, {name: 'dog-catcher', candidates: ['Todd', 'Scott']}),
                    addRace(adminClient, {name: 'doorman', candidates: ['Joe', 'Jim']})
                ])),
                switchMap(() => combineLatest([
                    vote(counterClient, {
                        candidate: 'Todd',
                        race: 'dog-catcher',
                    }),
                    vote(counterClient, {
                        candidate: 'Scott',
                        race: 'dog-catcher'
                    }),
                    vote(counterClient, {
                        candidate: 'Joe',
                        race: 'doorman'
                    }),
                    vote(counterClient, {
                        candidate: 'Jim',
                        race: 'doorman'
                    })
                ])),
                switchMap(() => readVotesByRace(counterClient, 'dog-catcher')),
                tap(x => x)
            )),
            tap(() => waitForCometDown().then(() => done())),
            catchError(err => of(done(err)))
        ));
    });

    it('should be able to cast votes', (done) => {
        firstValueFrom(startVoteSwarm().pipe(
            switchMap(() => combineLatest([newRandomApiClient(), newRandomApiClient()])),
            switchMap(([adminClient, keyMakerClient]) => of(undefined).pipe(
                switchMap(() => addAdmin(adminClient)),
                switchMap(() => addKeyMaker(adminClient, keyMakerClient.pubKey)),
                switchMap(() => addRace(adminClient, {name: 'dog-catcher', candidates: ['Todd', 'Scott']})),
                switchMap(() => range(0, 5).pipe(
                    mergeMap(count => of(undefined).pipe(
                        switchMap(() => newRandomApiClient()),
                        switchMap(voterClient => of(undefined).pipe(
                            switchMap(() => addVoter(keyMakerClient, voterClient.pubKey)),
                            switchMap(() => vote(voterClient, {
                                candidate: count % 2 ? 'todd' : 'scott',
                                race: 'dog-catcher',
                            }))
                        )),
                        toArray()
                    ))
                )),
                switchMap(() => readRaceResults(adminClient, 'dog-catcher')),
                tap(results => {
                    results.value.counts.sort((a, b) => a.candidate > b.candidate ? 1 : -1)
                    expect(results).to.deep.equal({
                        code: 0,
                        log: "",
                        info: "",
                        index: "0",
                        key: "",
                        value: {
                            race: "dog-catcher",
                            counts: [
                                {candidate: "scott",count: 3},
                                {candidate: "todd", count: 2}
                            ]
                        },
                        "proof": null
                    })
                })
            )),
            tap(() => waitForCometDown().then(() => done())),
            catchError(err => of(done(err)))
        ));
    });
});