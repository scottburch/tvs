import {catchError, combineLatest, firstValueFrom, of, switchMap, tap} from "rxjs";
import {waitForCometDown} from "@tvs/blockchain";
import {readVote, startVoteSwarm} from "@tvs/vote";
import {openBrowser} from "@end-game/utils/openBrowser";
import {auditReadySetup} from "./helpers/setupHelpers.js";
import {doAdminLogin} from "./helpers/loginHelper.js";
import {expect} from "chai";
import {omit} from "lodash-es";

describe('votes page', () => {
    it('should display votes', (done) => {
        firstValueFrom(startVoteSwarm().pipe(
            switchMap(() => combineLatest([
                auditReadySetup(),
                openBrowser({url: 'http://localhost:1515/admin'})
            ])),
            switchMap(([{adminClient, voterClient, keyMakerClient, auditorClient, auditorLoginKey}, page]) =>
                of(undefined).pipe(
                    switchMap(() => doAdminLogin(page, auditorLoginKey)),
                    switchMap(() => of(undefined).pipe(
                        switchMap(() => page.click('a:text("Votes")')),
                        switchMap(() => page.click('#race-select')),
                        switchMap(() => page.click(':text("Dog Catcher")')),
                        switchMap(() => page.click('button:text("FLAG")')),
                        switchMap(() => page.click('#reason-select')),
                        switchMap(() => page.click(':text("Invalid Voter Registration")')),
                        switchMap(() => page.click('button:text("Invalidate")')),
                        switchMap(() => page.locator('div[data-field=flags]:text("invalid")').waitFor())
                    )),
                    switchMap(() => readVote(adminClient,  'dog-catcher', voterClient.pubKey)),
                    tap(vote => {
                        expect(omit(vote, ['time'])).to.deep.equal({
                            race: "dog-catcher",
                            candidate: "Todd",
                            flags: {
                                invalid: true
                            },
                            log: [
                                {
                                    by: auditorClient.pubKey,
                                    change: "invalid",
                                    reason: "Invalid voter registration"
                                }
                            ],
                            "voter": voterClient.pubKey
                        })
                    })
                ),
            ),
            tap(() => waitForCometDown().then(() => done())),
            catchError(err => of(done(err))),
        ));

    })
});