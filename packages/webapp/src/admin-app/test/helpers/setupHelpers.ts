import {combineLatest, map, of, switchMap} from "rxjs";
import {testApiClient} from "@tvs/blockchain";
import {addAdmin, addAuditor, addKeyMaker, addRace, addVoter, vote} from "@tvs/vote";
import {encryptPrivKey, serializeKey} from "@tvs/crypto";

export const auditReadySetup = () =>
    combineLatest([testApiClient(), testApiClient(), testApiClient(), testApiClient()]).pipe(
        switchMap(([adminClient, keyMakerClient, voterClient, auditorClient]) => of(undefined).pipe(
            switchMap(() => addAdmin(adminClient)),
            switchMap(() => addKeyMaker(adminClient, keyMakerClient.pubKey)),
            switchMap(() => addVoter(keyMakerClient, voterClient.pubKey)),
            switchMap(() => addAuditor(keyMakerClient, auditorClient.pubKey)),
            switchMap(() => combineLatest([
                addRace(adminClient, {name: 'dog-catcher', candidates: ['Todd']}),
                addRace(adminClient, {name: 'floor-sweeper', candidates: ['Jim']}),
                addRace(adminClient, {name: 'doorman', candidates: ['Jean']})
            ])),
            switchMap(() => combineLatest([
                vote(voterClient, {race: 'dog-catcher', candidate: 'Todd'}),
                vote(voterClient, {race: 'floor-sweeper', candidate: 'Jim'}),
                vote(voterClient, {race: 'doorman', candidate: 'Jean'})
            ])),
            switchMap(() => serializeKey(auditorClient.keys.privKey)),
            switchMap(privKey => encryptPrivKey('12345', privKey)),
            map(auditorLoginKey => ({adminClient, keyMakerClient, voterClient, auditorClient, auditorLoginKey}))
        ))
    );


