import {catchError, combineLatest, delay, firstValueFrom, of, switchMap, tap} from "rxjs";
import {addRace, readVote, startVoteSwarm, vote} from "@tvs/vote";
import {singleVoterSetup} from "../test/helpers/setupHelpers.js";
import {waitForCometDown} from "@my-blockchain/blockchain";
import {useCheckVote} from "./useCheckVote.js";
import {expect} from "chai";

describe('useCheckVote hook', () => {
    it('should read a vote', (done) => {
        firstValueFrom(startVoteSwarm({numValidators: 3, numNodes: 1}).pipe(
            switchMap(() => singleVoterSetup()),
            switchMap(({privKey, client, adminClient, auditorClient, keyMakerClient}) => of(undefined).pipe(
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
                switchMap(() => combineLatest([
                    useCheckVote()('http://localhost:1235', 'dog-catcher', client.pubKey),
                    useCheckVote()('http://localhost:1236', 'dog-catcher', client.pubKey),
                    useCheckVote()('http://localhost:1237', 'dog-catcher', client.pubKey)
                ])),
                tap(([vote1, vote2, vote3]) => {
                    expect(vote1.race).to.equal('dog-catcher');
                    expect(vote2.race).to.equal('dog-catcher');
                    expect(vote3.race).to.equal('dog-catcher');
                    expect(vote1.candidate).to.equal('Todd');
                    expect(vote1.candidate).to.equal('Todd');
                    expect(vote1.candidate).to.equal('Todd');
                }),
            )),
            tap(() => waitForCometDown().then(() => done())),
            catchError(err => of(done(err))),
        ));

    })
})