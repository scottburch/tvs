import {catchError, firstValueFrom, from, of, switchMap, take, tap, toArray} from "rxjs";
import {waitForCometDown} from "@tvs/blockchain";
import {startVoteSwarm} from "@tvs/vote";
import {multiVoterSetup} from "../../voter-app/test/helpers/setupHelpers.js";
import {expect} from "chai";
import {_races} from "./useRaces.js";

describe('useRaces hook', () => {
    it('should return a list of races', (done) => {
        firstValueFrom(startVoteSwarm().pipe(
            switchMap(() => multiVoterSetup()),
            switchMap(({client}) => _races(client)),
            tap(races => races.sort((a, b) => a.name > b.name ? 1 : -1)),
            switchMap(races => from(races)),
            tap(race => race.candidates.sort()),
            take(2),
            toArray(),
            tap(races => expect(races).to.deep.equal([{
                name: "dog-catcher",
                candidates: ["Scott", "Todd"]
            }, {
                name: "doorman",
                candidates: ["Jean", "Joe"]
            }])),
            tap(() => waitForCometDown().then(() => done())),
            catchError(err => of(done(err))),
        ))

    });
})