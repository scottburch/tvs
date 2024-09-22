import {combineLatest, from, last, map, mergeMap, of, range, switchMap, toArray} from "rxjs";
import {testApiClient} from "@tvs/blockchain";
import {addAdmin, addAuditor, addKeyMaker, addVoter, vote} from "@tvs/vote";
import {encryptPrivKey, SerializedPrivKey, serializeKey} from "@tvs/crypto";
import {addRace} from "@tvs/vote";

export const noVoterSetup = () =>
    combineLatest([
        testApiClient('QW4SpwUxXtG4WUDEnKMCAT0TLkXfqX4q9zoi5ruV2uc=' as SerializedPrivKey),
        testApiClient('YuBn9GAKAQPHoiKya21gr6SK1i3060kNlO8+M6QUlUo=' as SerializedPrivKey)
    ]).pipe(
        switchMap(([adminClient, keyMakerClient]) => of(undefined).pipe(
            switchMap(() => addAdmin(adminClient)),
            switchMap(() => addKeyMaker(adminClient, keyMakerClient.pubKey)),
            switchMap(() => serializeKey(keyMakerClient.keys.privKey)),
            map(keyMakerPrivKey => ({keyMakerClient, adminClient, keyMakerPrivKey}))
        ))
    );


export const singleVoterSetup = () =>
    combineLatest([testApiClient(), testApiClient(), testApiClient(), testApiClient()]).pipe(
        switchMap(([adminClient, keyMakerClient, voterClient, auditorClient]) => of(undefined).pipe(
            switchMap(() => addAdmin(adminClient)),
            switchMap(() => addKeyMaker(adminClient, keyMakerClient.pubKey)),
            switchMap(() => combineLatest([
                addVoter(keyMakerClient, voterClient.pubKey),
                addAuditor(keyMakerClient, auditorClient.pubKey)
            ])),
            switchMap(() => serializeKey(voterClient.keys.privKey)),
            switchMap(privKey => encryptPrivKey('12345', privKey)),
            map(privKey => ({keyMakerClient, adminClient, auditorClient, client: voterClient, privKey}))
        ))
    );

export const multiVoterSetup = () =>
    combineLatest([
        testApiClient(),
        testApiClient(),
        range(0, 20).pipe(
            mergeMap(() => testApiClient()),
            toArray())
    ]).pipe(
        switchMap(([adminClient, keyMakerClient, voters]) => of(undefined).pipe(
            switchMap(() => addAdmin(adminClient)),
            switchMap(() => addKeyMaker(adminClient, keyMakerClient.pubKey)),
            switchMap(() => combineLatest([
                addRace(adminClient, {name: 'dog-catcher', candidates: ['Todd', 'Scott']}),
                addRace(adminClient, {name: 'doorman', candidates: ['Joe', 'Jean']})
            ])),
            switchMap(() => from(voters).pipe(
                mergeMap(voter => addVoter(keyMakerClient, voter.pubKey)),
                last()
            )),
            switchMap(() => combineLatest([
                range(0, 11).pipe(
                    mergeMap(n => vote(voters[n], {race: 'dog-catcher', candidate: n < 4 ? 'Todd' : 'Scott'}))
                ),
                range(11, 9).pipe(
                    mergeMap(n => vote(voters[n], {race: 'doorman', candidate: n < 16 ? 'Joe' : 'Jean'}))
                )
            ])),
            last(),
            switchMap(() => serializeKey(voters[0].keys.privKey)),
            switchMap(privKey => encryptPrivKey('12345', privKey)),
            map(privKey => ({privKey, client: voters[0]}))
        )),
    );