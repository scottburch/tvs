import {catchError, combineLatest, firstValueFrom, of, switchMap, tap} from "rxjs";
import {newRandomApiClient, waitForCometDown} from "@my-blockchain/blockchain";
import {expect} from "chai";
import {addAdmin, addKeyMaker, addVoter, startVoteSwarm} from "@tvs/vote";
import {readRoles} from "./useRoles.js";

describe('useRoles()', () => {
    it('should return a role for a client', (done) => {
        firstValueFrom(startVoteSwarm().pipe(
            switchMap(() => combineLatest([newRandomApiClient(), newRandomApiClient(), newRandomApiClient()])),
            switchMap(([adminClient, keyMakerClient, voterClient]) => of(undefined).pipe(
                switchMap(() => readRoles(adminClient).pipe(
                    tap(roles => expect(roles).to.deep.equal({admin: false, keyMaker: false, voter: false, auditor: false})),
                )),
                switchMap(() => addAdmin(adminClient)),
                switchMap(() => addKeyMaker(adminClient, keyMakerClient.pubKey)),
                switchMap(() => addVoter(keyMakerClient, voterClient.pubKey)),
                switchMap(() => combineLatest([
                    readRoles(adminClient).pipe(
                        tap(roles => expect(roles).to.deep.equal({admin: true, keyMaker: false, voter: false, auditor: false})),
                    ),
                    readRoles(keyMakerClient).pipe(
                        tap(roles => expect(roles).to.deep.equal({admin: false, keyMaker: true, voter: false, auditor: false})),
                    ),
                    readRoles(voterClient).pipe(
                        tap(roles => expect(roles).to.deep.equal({admin: false, keyMaker: false, voter: true, auditor: false}))
                    )
                ]))
            )),
            tap(() => waitForCometDown().then(() => done())),
            catchError(err => of(done(err))),
        ));
    })
});