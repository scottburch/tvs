import {catchError, combineLatest, firstValueFrom, of, switchMap, tap} from "rxjs";
import {waitForCometDown} from "@my-blockchain/blockchain";
import {startVoteSwarm} from "@tvs/vote";
import {multiVoterSetup} from "./helpers/setupHelpers.js";
import {openBrowser} from "@end-game/utils/openBrowser";
import {doLogin} from "./helpers/loginHelper.js";

describe("race results", () => {
    it('should display race results', (done) => {
        firstValueFrom(startVoteSwarm().pipe(
            switchMap(() => multiVoterSetup()),
            switchMap(({privKey, client}) => combineLatest([
                of(client),
                of(privKey),
                openBrowser({url: 'http://localhost:1515/vote'})
            ])),
            switchMap(([client, privKey, page]) => of(undefined).pipe(
                switchMap(() => doLogin(page, privKey)),
                switchMap(() => page.click('button:text("vote results")')),
                switchMap(() => page.locator('span:text("Dog Catcher")').waitFor()),
                switchMap(() => page.locator('span:text("Doorman")').waitFor()),
                switchMap(() => page.locator('div:text("Scott: 7")').waitFor()),
                switchMap(() => page.locator('div:text("Todd: 4")').waitFor()),
                switchMap(() => page.locator('div:text("Joe: 5")').waitFor()),
                switchMap(() => page.locator('div:text("Jean: 4")').waitFor()),
            )),
            tap(() => waitForCometDown().then(() => done())),
            catchError(err => of(done(err))),
        ))

    });
});