import {catchError,  firstValueFrom, of, switchMap, tap} from "rxjs";
import {startCleanValidator, waitForCometDown} from "@tvs/blockchain";
import {startVoteApp} from "@tvs/vote";
import {noVoterSetup} from "../../voter-app/test/helpers/setupHelpers.js";
import {openBrowser} from "@end-game/utils/openBrowser";

describe('add voter page', () => {
    it('should add a voter to the system and provide a login key', (done) => {
        firstValueFrom(startCleanValidator({}, startVoteApp).pipe(
            switchMap(() => noVoterSetup()),
            switchMap(({keyMakerPrivKey}) =>
                openBrowser({url: 'http://localhost:1515/utility-pages/create-voter'})
            ),
            switchMap(page => of(undefined).pipe(
                switchMap(() => page.click('button:text("Add Voter")')),
                switchMap(() => page.locator('td:text("Voter Login Id:")').waitFor())
            )),
            tap(() => waitForCometDown().then(() => done())),
            catchError(err => of(done(err))),
        ))

    })
})