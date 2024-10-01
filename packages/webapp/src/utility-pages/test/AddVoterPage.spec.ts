import {catchError, delay, firstValueFrom, of, switchMap, tap} from "rxjs";
import {waitForCometDown} from "@tvs/blockchain";
import {startVoteSwarm} from "@tvs/vote";
import {noVoterSetup} from "../../voter-app/test/helpers/setupHelpers.js";
import {openBrowser} from "@end-game/utils/openBrowser";

describe('add voter page', () => {
    it('should add a voter to the system and provide a login key', (done) => {
        firstValueFrom(startVoteSwarm({numValidators: 2, numNodes: 1}).pipe(
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