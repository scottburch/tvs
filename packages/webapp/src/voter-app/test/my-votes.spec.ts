import {catchError, combineLatest, firstValueFrom, of, switchMap, tap} from "rxjs";
import {startCleanValidator, waitForCometDown} from "@tvs/blockchain";
import {addRace, flagVote, readVote, startVoteApp, vote} from "@tvs/vote";
import {singleVoterSetup} from "./helpers/setupHelpers.js";
import {openBrowser} from "@end-game/utils/openBrowser";
import {doLogin} from "./helpers/loginHelper.js";

describe('my votes page', () => {
    it('should return a list of my votes', (done) => {
        firstValueFrom(startCleanValidator({}, startVoteApp).pipe(
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
                switchMap(() => page.locator('span:text("dog catcher")').waitFor()),
                switchMap(() => page.locator('p:text("Todd")').waitFor())
            )),
            tap(() => waitForCometDown().then(() => done())),
            catchError(err => of(done(err))),
        ));
    });

    it('should display flags', (done) => {
        firstValueFrom(startCleanValidator({}, startVoteApp).pipe(
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
                    switchMap(() => page.locator('span:text("dog catcher")').waitFor()),
                    switchMap(() => page.locator('p:text("Todd")').waitFor()),
                    switchMap(() => page.locator(':text("Cuz I said so")').waitFor()),
                    switchMap(() => page.locator(':text("invalid")').waitFor())
                ))
            )),
            tap(() => waitForCometDown().then(() => done())),
            catchError(err => of(done(err))),
        ));

    })
});