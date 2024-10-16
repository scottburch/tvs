import {catchError, combineLatest, delay, firstValueFrom, of, switchMap, tap} from "rxjs";
import {waitForCometDown} from "@my-blockchain/blockchain";
import {addRace, flagVote, readVote, startVoteSwarm, vote} from "@tvs/vote";
import {singleVoterSetup} from "./helpers/setupHelpers.js";
import {openBrowser} from "@end-game/utils/openBrowser";
import {doLogin} from "./helpers/loginHelper.js";

describe('my votes page', () => {
    it('should return a list of my votes', (done) => {
        firstValueFrom(startVoteSwarm().pipe(
            switchMap(() => combineLatest([
                singleVoterSetup(),
                openBrowser({url: 'http://localhost:1515/vote'})
            ])),
            switchMap(([{privKey, client, adminClient}, page]) => of(undefined).pipe(
                switchMap(() => combineLatest([
                    addRace(adminClient, {name: 'dog-catcher', candidates: ['Todd']}),
                    addRace(adminClient, {name: 'floor-sweeper', candidates: ['Jim']}),
                    addRace(adminClient, {name: 'doorman', candidates: ['Jean']})
                ])),
                switchMap(() => combineLatest([
                    vote(client, {race: 'dog-catcher', candidate: 'Todd'}),
                    vote(client, {race: 'floor-sweeper', candidate: 'Jim'}),
                    vote(client, {race: 'doorman', candidate: 'Jean'})
                ])),
                switchMap(() => doLogin(page, privKey)),
                switchMap(() => page.click('button:text("my votes")')),
                switchMap(() => page.locator('p:text("Dog Catcher:")').waitFor()),
                switchMap(() => page.locator('p:text("Todd")').waitFor())
            )),
            tap(() => waitForCometDown().then(() => done())),
            catchError(err => of(done(err))),
        ));
    });

    it('should display flags', (done) => {
        firstValueFrom(startVoteSwarm().pipe(
            switchMap(() => combineLatest([
                singleVoterSetup(),
                openBrowser({url: 'http://localhost:1515/vote'})
            ])),
            switchMap(([{privKey, client, adminClient, auditorClient, keyMakerClient}, page]) => of(undefined).pipe(
                switchMap(() => combineLatest([
                    addRace(adminClient, {name: 'dog-catcher', candidates: ['Todd']}),
                    addRace(adminClient, {name: 'floor-sweeper', candidates: ['Jim']}),
                    addRace(adminClient, {name: 'doorman', candidates: ['Jean']})
                ])),
                switchMap(() => combineLatest([
                    vote(client, {race: 'dog-catcher', candidate: 'Todd'}),
                    vote(client, {race: 'floor-sweeper', candidate: 'Jim'}),
                    vote(client, {race: 'doorman', candidate: 'Jean'})
                ])),
                switchMap(() => readVote(client, 'dog-catcher', client.pubKey)),
                switchMap(vote => flagVote(auditorClient, {
                    vote,
                    flag: 'invalid',
                    reason: 'Cuz I said so',
                    value: true,
                })),
                switchMap(() => doLogin(page, privKey).pipe(
                    switchMap(() => page.click('button:text("my votes")')),
                    switchMap(() => page.locator('p:text("dog catcher")').waitFor()),
                    switchMap(() => page.locator('p:text("Todd")').waitFor()),
                    switchMap(() => page.locator(':text("Cuz I said so")').waitFor()),
                    switchMap(() => page.locator(':text("invalid")').waitFor())
                ))
            )),
            tap(() => waitForCometDown().then(() => done())),
            catchError(err => of(done(err))),
        ));

    });


    it('should allow you to check your vote on other servers', (done) => {
        firstValueFrom(startVoteSwarm({numValidators: 3, numNodes: 1}).pipe(
            switchMap(() => combineLatest([
                singleVoterSetup(),
                openBrowser({url: 'http://localhost:1515/vote'})
            ])),
            switchMap(([{privKey, client, adminClient, auditorClient, keyMakerClient}, page]) => of(undefined).pipe(
                switchMap(() => combineLatest([
                    addRace(adminClient, {name: 'dog-catcher', candidates: ['Todd']}),
                    addRace(adminClient, {name: 'floor-sweeper', candidates: ['Jim']}),
                    addRace(adminClient, {name: 'doorman', candidates: ['Jean']})
                ])),
                switchMap(() => combineLatest([
                    vote(client, {race: 'dog-catcher', candidate: 'Todd'}),
                    vote(client, {race: 'floor-sweeper', candidate: 'Jim'}),
                    vote(client, {race: 'doorman', candidate: 'Jean'})
                ])),
                switchMap(() => doLogin(page, privKey).pipe(
                    switchMap(() => page.click('button:text("my votes")')),
                )),
                switchMap(() => page.locator('button:text("check")').first().click()),
                switchMap(() => of(undefined).pipe(
                    switchMap(() => page.locator('pre:has-text("dog-catcher")').waitFor()),
                    switchMap(() => page.locator('pre:has-text("Todd")').waitFor())
                ))
            )),
            tap(() => waitForCometDown().then(() => done())),
            catchError(err => of(done(err))),
        ));

    })
});