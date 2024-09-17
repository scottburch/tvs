import {startCleanValidator, testApiClient, waitForCometDown} from "@tvs/blockchain";
import {startVoteApp} from "./voteApp.js";
import {catchError, combineLatest, delay, firstValueFrom, map, of, switchMap, tap} from "rxjs";
import {expect} from 'chai'
import {
    addAdmin,
    addKeyMaker,
    addRace,
    addVoter,
    readRaceResults,
    readVotesByVoter,
    readVoteTxByHash,
    vote
} from "./vote-client.js";

describe('voting blockchain app', () => {
    it('should startup a server', (done) => {
        firstValueFrom(startCleanValidator({}, startVoteApp).pipe(
            switchMap(() => combineLatest([testApiClient(), testApiClient(), testApiClient()])),
            switchMap(([adminClient, keyMakerClient, voterClient]) => of(undefined).pipe(
                switchMap(() => addAdmin(adminClient)),
                switchMap(() => addKeyMaker(adminClient, keyMakerClient.pubKey)),
                switchMap(() => addVoter(keyMakerClient, voterClient.pubKey)),
                switchMap(() => addRace(adminClient, {name: 'dog-catcher', candidates: ['Todd', 'Scott']})),
                switchMap(() => vote(voterClient, {candidate: 'scott', race: 'dog-catcher'}))
            )),
            tap(() => waitForCometDown().then(() => done())),
            catchError(err => of(done(err))),
        ));
    });



    it('should not be able to cast a double vote', (done) => {
        firstValueFrom(startCleanValidator({}, startVoteApp).pipe(
            switchMap(() => combineLatest([testApiClient(), testApiClient(), testApiClient()])),
            switchMap(([adminClient, keyMakerClient, voterClient]) => of(undefined).pipe(
                switchMap(() => addAdmin(adminClient)),
                switchMap(() => addKeyMaker(adminClient, keyMakerClient.pubKey)),
                switchMap(() => addVoter(keyMakerClient, voterClient.pubKey)),
                switchMap(() => addRace(adminClient, {name: 'dog-catcher', candidates: ['todd', 'gene', 'scott']})),
                switchMap(() => vote(voterClient, {candidate: 'todd', race: 'dog-catcher'})),
                switchMap(() => vote(voterClient, {candidate: 'gene', race: 'dog-catcher'})),
                delay(1000), // This is here to make sure the transactions go into different blocks
                switchMap(() => vote(voterClient, {candidate: 'scott', race: 'dog-catcher'})),
                catchError(err => of(err)),
                tap(err => {
                    expect(err.code).to.equal(1);
                    expect(err.log).to.equal('DOUBLE_VOTE');
                }),
            )),
            switchMap(() => testApiClient()),
            switchMap(client => readRaceResults(client, 'dog-catcher')),
            tap(results => {
                expect(results.value).to.deep.equal({
                    race: "dog-catcher",
                    counts: [{
                            candidate: "todd",
                            count: 1
                    }]
                });
            }),
            tap(() => waitForCometDown().then(() => done())),
            catchError(err => of(done(err)))
        ));
    });


    it('should require that the voter be registered before voting', (done) => {
        firstValueFrom(startCleanValidator({}, startVoteApp).pipe(
            switchMap(() => testApiClient()),
            switchMap(client => vote(client, {
                race: 'dog-catcher',
                candidate: 'todd'
            })),
            catchError(err => of(err)),
            tap(err => {
                expect(err.code).to.equal(1);
                expect(err.log).to.equal('NOT_REGISTERED_VOTER');
            }),
            tap(() => waitForCometDown().then(() => done())),
            catchError(err => of(done(err)))
        ));
    });

    it('can verify a vote by its transaction hash', (done) => {
        firstValueFrom(startCleanValidator({}, startVoteApp).pipe(
            switchMap(() => combineLatest([testApiClient(), testApiClient(), testApiClient()])),
            switchMap(([adminClient, keyMakerClient, voterClient]) => of(undefined).pipe(
                switchMap(() => addAdmin(adminClient)),
                switchMap(() => addKeyMaker(adminClient, keyMakerClient.pubKey)),
                switchMap(() => addVoter(keyMakerClient, voterClient.pubKey)),
                switchMap(() => addRace(adminClient, {name: 'dog-catcher', candidates: ['todd']})),
                switchMap(() => vote(voterClient, {candidate: 'todd', race: 'dog-catcher'})),
                switchMap(({hash}) => readVoteTxByHash(voterClient, hash)),
                tap(result => {
                    expect(result.msgs[0].path).to.equal('vote');
                    expect(result.msgs[0].data.candidate).to.equal('todd');
                    expect(result.msgs[0].data.race).to.equal('dog-catcher');
                })
            )),
            tap(() => waitForCometDown().then(() => done())),
            catchError(err => of(done(err)))
        ));
    });

    it('can lookup votes by a voters pubKey', (done) => {
        firstValueFrom(startCleanValidator({}, startVoteApp).pipe(
            switchMap(() => combineLatest([testApiClient(), testApiClient(), testApiClient()])),
            switchMap(([adminClient, keyMakerClient, voterClient]) => of(undefined).pipe(
                switchMap(() => of(undefined).pipe(
                    switchMap(() => addAdmin(adminClient)),
                    switchMap(() => addKeyMaker(adminClient, keyMakerClient.pubKey)),
                    switchMap(() => addVoter(keyMakerClient, voterClient.pubKey)),
                    switchMap(() => combineLatest([
                        addRace(adminClient, {name: 'dog-catcher', candidates: ['todd']}),
                        addRace(adminClient, {name: 'floor-sweeper', candidates: ['scott']})
                    ]))
                )),
                switchMap(() => of(undefined).pipe(
                    switchMap(() => vote(voterClient, {
                        candidate: 'todd',
                        race: 'dog-catcher',
                    })),
                    switchMap(() => vote(voterClient, {
                        candidate: 'scott',
                        race: 'floor-sweeper'
                    }))
                )),
                switchMap(() => readVotesByVoter(voterClient, voterClient.pubKey)),
                map(votes => votes.sort((a, b) => a.race < b.race ? -1 : 1)),
                tap(votes => {
                    expect(votes[0].candidate).to.equal('todd');
                    expect(votes[1].candidate).to.equal('scott');
                })
            )),
            tap(() => waitForCometDown().then(() => done())),
            catchError(err => of(done(err)))
        ));
    });
});

