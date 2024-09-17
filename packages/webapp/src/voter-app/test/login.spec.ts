import {catchError, firstValueFrom, of, switchMap, tap, delay, combineLatest} from "rxjs";
import {startCleanValidator, waitForCometDown} from "@tvs/blockchain";
import {startVoteApp} from "@tvs/vote";
import {singleVoterSetup} from "./helpers/setupHelpers.js";
import {openBrowser} from "@end-game/utils/openBrowser";
import {doLogin} from "./helpers/loginHelper.js";

describe('login', () => {
    it('can login', (done) => {
        firstValueFrom(startCleanValidator({}, startVoteApp).pipe(
            switchMap(() => singleVoterSetup()),
            switchMap(({privKey, client}) => combineLatest([
                of(client),
                of(privKey),
                openBrowser({url: 'http://localhost:1515'})
            ])),
            switchMap(([client, privKey, page]) => of(undefined).pipe(
                switchMap(() => doLogin(page, privKey)),
            )),
            tap(() => waitForCometDown().then(() => done())),
            catchError(err => of(done(err))),
        ))
    });
})