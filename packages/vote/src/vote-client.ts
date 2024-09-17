import {
    ApiClient,
    getTxByHash,
    newTransaction,
    sendQuery,
    sendTx,
    signTx, Transaction,
    UnsignedTransaction,
    waitForTx
} from "@tvs/blockchain";
import {map, switchMap} from "rxjs";
import type {
    Admin,
    Auditor,
    FlagVoteOpts,
    KeyMaker,
    Race,
    RaceResult,
    Vote,
    VoteCounter,
    Voter
} from "./types.js";
import {STORE_PREFIX} from './types.js'
import {SerializedPubKey} from "@tvs/crypto";
import {base64ToString} from "uint8array-extras";


export const readRaceResults = (client: ApiClient, race: string) => sendQuery<RaceResult>(client, {
    path: 'get-race-results',
    data: {race}
});

export const vote = (client: ApiClient, vote: Omit<Vote, 'voter' | 'flags' | 'log' | 'time'>) => newTransaction({
    msgs: [{path: 'vote', data: {...vote, flags: {}, log: [], time: new Date().toISOString()} satisfies Omit<Vote, 'voter'>}]
}).pipe(
    switchMap(tx => transmitTx(client, tx))
);

export const addAdmin = (client: ApiClient) => newTransaction({
    msgs: [{
        path: 'set-admin',
        data: {pubKey: client.pubKey}
    }]
}).pipe(
    switchMap(tx => transmitTx(client, tx))
);

export const addRace = (client: ApiClient, race: Race) => newTransaction({
    msgs: [{
        path: 'create-race',
        data: race
    }]
}).pipe(
    switchMap(tx => transmitTx(client, tx))
);

export const readAdmin = (client: ApiClient) => sendQuery<Admin>(client, {path: 'get-admin', data: {}});

export const addKeyMaker = (client: ApiClient, keyMakerPubKey: string) => newTransaction({
    msgs: [{
        path: 'create-key-maker',
        data: {pubKey: keyMakerPubKey}
    }]
}).pipe(
    switchMap(tx => transmitTx(client, tx))
);

export const addVoteCounter = (keyMakerClient: ApiClient, voteCounterPubKey: SerializedPubKey) => newTransaction<VoteCounter>({
    msgs: [{
        path: 'create-vote-counter',
        data: {pubKey: voteCounterPubKey, maker: keyMakerClient.pubKey}
    }]
}).pipe(
    switchMap(tx => transmitTx(keyMakerClient, tx))
);

export const flagVote = (auditorClient: ApiClient, opts: FlagVoteOpts) => newTransaction<FlagVoteOpts>({
    msgs: [{
        path: 'flag-vote',
        data: opts
    }]
}).pipe(
    switchMap(tx => transmitTx(auditorClient, tx))
);

export const addVoter = (keyMakerClient: ApiClient, voterPubKey: SerializedPubKey) => newTransaction({
    msgs: [{
        path: 'create-voter',
        data: {pubKey: voterPubKey, maker: keyMakerClient.pubKey} satisfies Voter
    }]
}).pipe(
    switchMap(tx => transmitTx(keyMakerClient, tx))
);

export const addAuditor = (keyMakerClient: ApiClient, auditorPubKey: SerializedPubKey) => newTransaction({
    msgs: [{
        path: 'create-auditor',
        data: {pubKey: auditorPubKey, maker: keyMakerClient.pubKey} satisfies Auditor
    }]
}).pipe(
    switchMap(tx => transmitTx(keyMakerClient, tx))
);

export const readVoter = (client: ApiClient, voterPubKey: SerializedPubKey) =>
    sendQuery<Voter>(client, {path: 'get-voter', data: {pubKey: voterPubKey}}).pipe(
        map(response => response.value)
    );

export const readVote = (client: ApiClient, race: string, voterPubKey: SerializedPubKey) =>
    sendQuery<Vote>(client, {path: 'get-vote', data: {race, voter: voterPubKey}}).pipe(
        map(response => response.value)
    );

export const readAuditor = (client: ApiClient, auditorPubKey: SerializedPubKey) =>
    sendQuery<Auditor>(client, {path: 'get-auditor', data: {pubKey: auditorPubKey}}).pipe(
        map(response => response.value)
    );

export const readKeyMakers = (client: ApiClient) =>
    sendQuery<KeyMaker[]>(client, {path: 'get-key-makers', data: {}}).pipe(
        map(response => response.value)
    );

export const readKeyMaker = (client: ApiClient, pubKey: SerializedPubKey) =>
    sendQuery<KeyMaker>(client, {path: 'get-key-maker', data: {pubKey}});

export const readVoters = (client: ApiClient) =>
    sendQuery<Voter[]>(client, {path: 'get-voters', data: {}}).pipe(
        map(response => response.value)
    );

export const readAuditors = (client: ApiClient) =>
    sendQuery<Auditor[]>(client, {path: 'get-auditors', data: {}}).pipe(
        map(response => response.value)
    );

export const readRace = (client: ApiClient, name: string) =>
    sendQuery<Race>(client, {path: 'get-race', data: {name}}).pipe(
        map(response => response.value)
    );

export const readRaces = (client: ApiClient) =>
    sendQuery<Race[]>(client, {path: 'get-races', data: {}}).pipe(
        map(response => response.value)
    );

export const readVoteTxByHash = (client: ApiClient, txHash: string) =>
    getTxByHash(client, txHash).pipe(
        map(({tx}) => base64ToString(tx)),
        map(json => JSON.parse(json) as Transaction)
    );

export const readVotesByVoter = (client: ApiClient, voter: SerializedPubKey) =>
    sendQuery<Vote[]>(client, {path: 'get-votes-by-voter', data: {voter}}).pipe(
        map(response => response.value)
    );

export const readVotesByRace = (client: ApiClient, race: string) =>
    sendQuery<Vote[]>(client, {path: 'get-votes-by-race', data: {race}}).pipe(
        map(response => response.value)
    )

const transmitTx = (client: ApiClient, tx: UnsignedTransaction) =>
    signTx(tx, client.keys).pipe(
        switchMap(tx => sendTx(client, tx)),
        switchMap(({hash}) => waitForTx(client, hash))
    );

export const voteIdFromVote = (vote: Vote) =>
    `${STORE_PREFIX.VOTE}-${vote.race}-${vote.voter}-${vote.time}`;



