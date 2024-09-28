import {catchError, combineLatest, firstValueFrom, mergeMap, of, range, switchMap, tap} from "rxjs";
import {
    newTransaction,
    sendTx,
    signTx,
    testApiClient,
    waitForCometDown,
    waitForTx
} from "@tvs/blockchain";
import {
    addAdmin,
    addAuditor,
    addKeyMaker,
    addRace,
    addVoter,
    flagVote,
    readAuditor,
    readAuditors,
    readVote,
    readVoter,
    vote
} from "./vote-client.js";
import {expect} from "chai";
import {Auditor} from "./types.js";
import {startVoteSwarm} from "./test-utils/startVoteSwarm.js";

describe('vote auditors', () => {
    it('can be created by a keymaker', (done) => {
        firstValueFrom(startVoteSwarm().pipe(
            switchMap(() => combineLatest([testApiClient(), testApiClient(), testApiClient()])),
            switchMap(([adminClient, keyMakerClient, auditorClient]) => of(undefined).pipe(
                switchMap(() => addAdmin(adminClient)),
                switchMap(() => addKeyMaker(adminClient, keyMakerClient.pubKey)),
                switchMap(() => addAuditor(keyMakerClient, auditorClient.pubKey)),
                switchMap(() => readAuditor(auditorClient, auditorClient.pubKey)),
                tap(auditor => {
                    expect(auditor.pubKey).to.equal(auditorClient.pubKey);
                    expect(auditor.maker).to.equal(keyMakerClient.pubKey);
                })
            )),
            tap(() => waitForCometDown().then(() => done())),
            catchError(err => of(done(err))),
        ));
    });

    it('can only be created by a key maker', (done) => {
        firstValueFrom(startVoteSwarm().pipe(
            switchMap(() => combineLatest([testApiClient(), testApiClient()])),
            switchMap(([fakeClient, auditorClient]) => of(undefined).pipe(
                switchMap(() => addAuditor(fakeClient, auditorClient.pubKey)),
                catchError(err => of(err)),
                tap(err => {
                    expect(err.code).to.equal(1);
                    expect(err.log).to.equal('NOT_KEY_MAKER')
                }),
                switchMap(() => readVoter(auditorClient, auditorClient.pubKey)),
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
            switchMap(([adminClient, keyMakerClient, auditorClient]) => of(undefined).pipe(
                switchMap(() => addAdmin(adminClient)),
                switchMap(() => addKeyMaker(adminClient, keyMakerClient.pubKey)),
                switchMap(() => newTransaction({
                    msgs: [{
                        path: 'create-voter',
                        data: {pubKey: auditorClient.pubKey, maker: auditorClient.pubKey} satisfies Auditor
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
                switchMap(() => readAuditor(auditorClient, auditorClient.pubKey)),
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

    it('can flag a vote', (done) => {
        firstValueFrom(startVoteSwarm().pipe(
            switchMap(() => combineLatest([testApiClient(), testApiClient(), testApiClient(), testApiClient()])),
            switchMap(([adminClient, keyMakerClient, auditorClient, voterClient]) => of(undefined).pipe(
                switchMap(() => addAdmin(adminClient)),
                switchMap(() => addKeyMaker(adminClient, keyMakerClient.pubKey)),
                switchMap(() => addVoter(keyMakerClient, voterClient.pubKey)),
                switchMap(() => addRace(adminClient, {name: 'dog-catcher', candidates: ['Todd', 'Scott']})),
                switchMap(() => vote(voterClient, {race: 'dog-catcher', candidate: 'Todd'})),
                switchMap(() => readVote(voterClient, 'dog-catcher', voterClient.pubKey)),
                switchMap(vote => of(undefined).pipe(
                    switchMap(() => addAuditor(keyMakerClient, auditorClient.pubKey)),
                    switchMap(() => flagVote(auditorClient, {
                        vote,
                        flag: 'invalid',
                        value: true,
                        reason: 'cuz I say so',
                    })),
                    switchMap(() => readVote(voterClient, 'dog-catcher', voterClient.pubKey)),
                    tap(vote => {
                        expect(vote.race).to.equal('dog-catcher');
                        expect(vote.voter).to.equal(voterClient.pubKey);
                        expect(vote.flags?.invalid).to.be.true
                        expect(vote.log?.[0].reason).to.equal('cuz I say so');
                        expect(vote.log?.[0].change).to.equal('invalid');
                        expect(vote.log?.[0].by).to.equal(auditorClient.pubKey)
                    })
                ))
            )),
            tap(() => waitForCometDown().then(() => done())),
            catchError(err => of(done(err))),
        ));
    });

    it('should ensure that only an auditor can flag a vote', (done) => {
        firstValueFrom(startVoteSwarm().pipe(
            switchMap(() => combineLatest([testApiClient(), testApiClient(), testApiClient()])),
            switchMap(([adminClient, keyMakerClient, voterClient]) => of(undefined).pipe(
                switchMap(() => addAdmin(adminClient)),
                switchMap(() => addKeyMaker(adminClient, keyMakerClient.pubKey)),
                switchMap(() => addVoter(keyMakerClient, voterClient.pubKey)),
                switchMap(() => addRace(adminClient, {name: 'dog-catcher', candidates: ['Todd']})),
                switchMap(() => vote(voterClient, {race: 'dog-catcher', candidate: 'Todd'})),
                switchMap(() => readVote(voterClient, 'dog-catcher', voterClient.pubKey)),
                switchMap(vote => of(undefined).pipe(
                    switchMap(() => flagVote(keyMakerClient, {
                        vote,
                        flag: 'invalid',
                        value: true,
                        reason: 'cuz I say so',
                    })),
                    catchError(err => of(err)),
                    tap(err => {
                        expect(err.code).to.equal(1);
                        expect(err.log).to.equal('NOT_AN_AUDITOR')
                    })
                ))
            )),
            tap(() => waitForCometDown().then(() => done())),
            catchError(err => of(done(err))),
        ));
    });

    it("should be able to return a list of auditors", (done) => {
        firstValueFrom(startVoteSwarm().pipe(
            switchMap(() => combineLatest([testApiClient(), testApiClient(), testApiClient(), testApiClient()])),
            switchMap(([adminClient, keyMakerClient]) => of(undefined).pipe(
                switchMap(() => addAdmin(adminClient)),
                switchMap(() => addKeyMaker(adminClient, keyMakerClient.pubKey)),
                switchMap(() => range(0, 5).pipe(
                    mergeMap(n => of(undefined).pipe(
                        switchMap(() => testApiClient()),
                        switchMap(client => addAuditor(keyMakerClient, client.pubKey)),
                    ))
                )),
                switchMap(() => readAuditors(keyMakerClient)),
            )),
            tap(() => waitForCometDown().then(() => done())),
            catchError(err => of(done(err))),
        ));
    });

});