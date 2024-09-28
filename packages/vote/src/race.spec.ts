import {catchError, combineLatest, firstValueFrom, of, switchMap, tap} from "rxjs";
import {testApiClient, waitForCometDown} from "@tvs/blockchain";
import {addAdmin, addRace, readRace, readRaces} from "./vote-client.js";
import {expect} from "chai";
import {Race} from "./types.js";
import {startVoteSwarm} from "./test-utils/startVoteSwarm.js";

describe('race', () => {
    it('should allow a admin to create a new race', (done) => {
        firstValueFrom(startVoteSwarm().pipe(
            switchMap(() => testApiClient()),
            switchMap(adminClient => of(undefined).pipe(
                switchMap(() => addAdmin(adminClient)),
                switchMap(() => addRace(adminClient, {name: 'my-race', candidates: ['Todd', 'Scott']} satisfies Race as Race)),
                switchMap(() => readRace(adminClient, 'my-race')),
                tap(race => {
                    expect(race.name).to.equal('my-race');
                    expect(race.candidates).to.deep.equal(['Todd', 'Scott'])
                })
            )),
            tap(() => waitForCometDown().then(() => done())),
            catchError(err => of(done(err))),
        ));
    });

    it('should only allow an admin to create a race', (done) => {
        firstValueFrom(startVoteSwarm().pipe(
            switchMap(() => combineLatest([testApiClient(), testApiClient()])),
            switchMap( ([adminClient, client]) => of(undefined).pipe(
                switchMap(() => addAdmin(adminClient)),
                switchMap(() => addRace(client, {name: 'my-race', candidates: ['Todd', 'Scott']} satisfies Race as Race)),
                catchError(err => of(err)),
                tap(err => {
                    expect(err.log).to.equal(`NOT_ADMIN:${client.pubKey}`)
                }),
                switchMap(() => readRace(client, 'my-race')),
                catchError(err => of(err)),
                tap(err => expect(err.log).to.equal('RACE_NOT_FOUND'))
            )),
            tap(() => waitForCometDown().then(() => done())),
            catchError(err => of(done(err))),
        ));
    });

    it("can return a list of races", (done) => {
        firstValueFrom(startVoteSwarm().pipe(
            switchMap(() => testApiClient()),
            switchMap(adminClient => of(undefined).pipe(
                switchMap(() => addAdmin(adminClient)),
                switchMap(() => combineLatest([
                    addRace(adminClient, {name: 'race1', candidates: ['Todd', 'Scott']} satisfies Race as Race),
                    addRace(adminClient, {name: 'race2', candidates: ['Joe', 'Bob']} satisfies Race as Race),
                    addRace(adminClient, {name: 'race3', candidates: ['Gene', 'Kelly']} satisfies Race as Race),
                ])),
                switchMap(() => readRaces(adminClient)),
                tap(races => {
                    expect(races).to.deep.equal([
                        {
                            name: "race1",
                            candidates: ["Todd","Scott"]
                        }, {
                            name: "race2",
                            candidates: ["Joe","Bob"]
                        }, {
                            name: "race3",
                            "candidates": ["Gene","Kelly"]
                        }
                    ])
                })
            )),
            tap(() => waitForCometDown().then(() => done())),
            catchError(err => of(done(err))),
        ));
    });

    it('should return an empty array if there are no races', (done) => {
        firstValueFrom(startVoteSwarm().pipe(
            switchMap(() => testApiClient()),
            switchMap(adminClient => of(undefined).pipe(
                switchMap(() => addAdmin(adminClient)),
                switchMap(() => readRaces(adminClient)),
                tap(races => {
                    expect(races).to.deep.equal([])
                })
            )),
            tap(() => waitForCometDown().then(() => done())),
            catchError(err => of(done(err))),
        ));

    })
});