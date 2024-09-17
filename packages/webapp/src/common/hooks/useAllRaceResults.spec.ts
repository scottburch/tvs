import {catchError, firstValueFrom, from, of, switchMap, tap, take, toArray} from "rxjs";
import {startCleanValidator, waitForCometDown} from "@tvs/blockchain";
import {startVoteApp} from "@tvs/vote";
import {multiVoterSetup} from "../../voter-app/test/helpers/setupHelpers.js";
import {_allRaceResults} from "./useAllRaceResults.js";
import {expect} from "chai";

describe('useAllRaceResults()', () => {
    it('should return the results for all races', (done) => {
        firstValueFrom(startCleanValidator({}, startVoteApp).pipe(
            switchMap(() => multiVoterSetup()),
            switchMap(({client}) => _allRaceResults(client)),
            tap(results => results.sort((a, b) => a.race > b.race ? 1 : -1)),
            switchMap(results => from(results)),
            tap(result => result.counts.sort((a, b) => a.candidate < b.candidate ? 1 : -1)),
            tap(x => x),
            take(2),
            toArray(),
            tap(results => expect(results).to.deep.equal([
                {
                    race: "dog-catcher",
                    counts: [{candidate: "Todd", count: 4}, {candidate: "Scott", count: 7}]
                }, {
                    race: "doorman",
                    counts: [{candidate: "Joe",count: 5}, {candidate: "Jean",count: 4}]
                }
            ])),
            tap(() => waitForCometDown().then(() => done())),
            catchError(err => of(done(err))),
        ))
    });
});