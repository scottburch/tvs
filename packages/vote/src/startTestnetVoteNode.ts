// Here for historical purposes.  Needed mostly just for the keys until I build something else


/*
import {newApiClient} from "@tvs/blockchain";
import {startVoteApp} from "./voteApp.js";
import {combineLatest, filter, of, switchMap, tap} from "rxjs";
import {encryptPrivKey, SerializedPrivKey} from "@tvs/crypto";
import {addAdmin, addAuditor, addKeyMaker, addRace, addVoteCounter, addVoter} from "./vote-client.js";
import {startTestnetNode} from "@tvs/blockchain";

import {program} from 'commander'
    program
        .argument('<nodeName>')
        .option( '--api-port <apiPort>')
    program.parse();

const nodeName = program.args[0];
const apiPort = program.getOptionValue('apiPort');

console.log('Starting node: ', nodeName);
console.log('--------------');
console.log('api-port: ', apiPort);

of(undefined).pipe(
    switchMap(() => combineLatest([
        encryptPrivKey('12345', 'QW4SpwUxXtG4WUDEnKMCAT0TLkXfqX4q9zoi5ruV2uc=' as SerializedPrivKey),
        encryptPrivKey('12345', 'YuBn9GAKAQPHoiKya21gr6SK1i3060kNlO8+M6QUlUo=' as SerializedPrivKey),
        encryptPrivKey('12345', 'V714fS1VCv5pLc+2TJFipxftW/Cd5UhAdmwxPxzHXi8=' as SerializedPrivKey),
        encryptPrivKey('12345', 'IUvKLQBL5UEFqCDbZVJTzGFCmSaOpdXTbxRbBVm+Evg=' as SerializedPrivKey),
        encryptPrivKey('12345', 'hsoASD4s4vMwLmvYnKobpJGFl+ANGMkfGTakceIm/UA=' as SerializedPrivKey)
    ])),
    tap(([adminKey, keyMakerKey, voterKey, auditorKey, counterKey]) => {
        console.log('DEMO LOGINS');
        console.log('============')
        console.log('admin:', adminKey);
        console.log('keyMaker:', keyMakerKey);
        console.log('voter:', voterKey);
        console.log('auditor:', auditorKey);
        console.log('counter:', counterKey);
        console.log('password', '12345')
        console.log('\n\n')
    }),
    switchMap(() => startTestnetNode({nodeName: nodeName, apiPort}, startVoteApp)),
    filter(() => nodeName === 'root'),
    switchMap(() => combineLatest([
        newApiClient({
            url: 'http://localhost:1234',
            privKey: 'QW4SpwUxXtG4WUDEnKMCAT0TLkXfqX4q9zoi5ruV2uc=' as SerializedPrivKey
        }),
        newApiClient({
            url: 'http://localhost:1234',
            privKey: 'YuBn9GAKAQPHoiKya21gr6SK1i3060kNlO8+M6QUlUo=' as SerializedPrivKey
        }),
        newApiClient({
            url: 'http://localhost:1234',
            privKey: 'V714fS1VCv5pLc+2TJFipxftW/Cd5UhAdmwxPxzHXi8=' as SerializedPrivKey
        }),
        newApiClient({
            url: 'http://localhost:1234',
            privKey: 'IUvKLQBL5UEFqCDbZVJTzGFCmSaOpdXTbxRbBVm+Evg=' as SerializedPrivKey
        }),
        newApiClient({
            url: 'http://localhost:1234',
            privKey: 'hsoASD4s4vMwLmvYnKobpJGFl+ANGMkfGTakceIm/UA=' as SerializedPrivKey
        })
    ])),
    switchMap(([adminClient, keyMakerClient, voterClient, auditorClient, counterClient]) => of(undefined).pipe(
        switchMap(() => addAdmin(adminClient)),
        switchMap(() => addKeyMaker(adminClient, keyMakerClient.pubKey)),
        switchMap(() => addVoter(keyMakerClient, voterClient.pubKey)),
        switchMap(() => addAuditor(keyMakerClient, auditorClient.pubKey)),
        switchMap(() => addVoteCounter(keyMakerClient, counterClient.pubKey)),
        switchMap(() => addRace(adminClient, {name: 'dog-catcher', candidates: ['Todd', 'Scott', 'Jim']})),
        switchMap(() => addRace(adminClient, {name: 'floor-sweeper', candidates: ['Jean', 'Timmy', 'John']})),
        switchMap(() => addRace(adminClient, {name: 'night-watchman', candidates: ['Joan', 'Karen', 'Sally']}))
    ))
).subscribe();
*/
/*******************
 **** Keys
 * admin - QW4SpwUxXtG4WUDEnKMCAT0TLkXfqX4q9zoi5ruV2uc=
 * keyMaker - YuBn9GAKAQPHoiKya21gr6SK1i3060kNlO8+M6QUlUo=
 * voter - V714fS1VCv5pLc+2TJFipxftW/Cd5UhAdmwxPxzHXi8=
 * auditor - IUvKLQBL5UEFqCDbZVJTzGFCmSaOpdXTbxRbBVm+Evg=
 * counter - hsoASD4s4vMwLmvYnKobpJGFl+ANGMkfGTakceIm/UA=
 *
 * ****** Login Keys
 *
 * admin: HGSfOgXUGTpmW/YPu0oQbvRaCsqovnE4nKcoKqt+YQM2UEcAwqGlX/vR4BSpH5A4
 * keyMaker: V8Ms9FgO5djpSVULsm1x9C3eyPhsWXc8h6eyNpiHJ1iSNk7FUOD9fbZF/Q13Bzvu
 * voter: Ce8XAvLGmd8wS2enQdK1Mj0Y/CBt4MqxpDsccoYpOWTFAWIQRztkFlboFqdoVbgt
 * auditor - 341P5EtiWu6YmiBHCLFCZwL+yPYW+3YmZYX8WHJmkCfYQ1ITdohyEyDuH/gWLHZU
 * counter - /lHJBv+JPLao0ZAtaHwcSFTzJT6Ib+xYl1TKGoPgfPnNy6nQO2qH8RaIAVxxDAtP
 *
 * password: 12345
 *
 */
