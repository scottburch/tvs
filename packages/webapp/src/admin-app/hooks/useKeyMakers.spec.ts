import {catchError, combineLatest, firstValueFrom, of, switchMap, tap} from "rxjs";
import {newRandomApiClient, waitForCometDown} from "@tvs/blockchain";
import {addAdmin, readKeyMaker, startVoteSwarm} from "@tvs/vote";
import {createKeyMaker} from "./useKeyMakers.js";
import {expect} from 'chai'

describe('useKeyMakers()', () => {
    it('should create a new keymaker in the blockchain returning the pubKey and an encrypted privKey', (done) => {
        firstValueFrom(startVoteSwarm().pipe(
            switchMap(() => combineLatest([newRandomApiClient()])),
            switchMap(([adminClient]) => of(undefined).pipe(
                switchMap(() => addAdmin(adminClient)),
                switchMap(() => createKeyMaker(adminClient, 'testing')),
                switchMap(keys => combineLatest([
                    of(keys),
                    readKeyMaker(adminClient, keys.pubKey),
                ])),
                tap(([keys, result]) => {
                    expect(keys.pubKey).to.equal(result.value.pubKey)
                    expect(keys.encPrivKey).to.have.length(64);
                })
            )),
            tap(() => waitForCometDown().then(() => done())),
            catchError(err => of(done(err))),
        ));
    });
})