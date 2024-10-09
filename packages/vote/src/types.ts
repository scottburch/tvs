import {SerializedPubKey} from "@my-blockchain/crypto";

export type Vote = {
    candidate: string
    race: string
    voter: SerializedPubKey
    flags: {
        invalid?: boolean
    },
    log: {
        change: keyof Vote['flags']
        reason: string,
        by: SerializedPubKey
    }[],
    time: string
};

export type Admin = {
    pubKey: SerializedPubKey
}

export type KeyMaker = {
    pubKey: SerializedPubKey
}

export type VoteCounter = {
    pubKey: SerializedPubKey
    maker: SerializedPubKey
}

export type Voter = {
    pubKey: SerializedPubKey
    maker: SerializedPubKey
}

export type Auditor = {
    pubKey: SerializedPubKey
    maker: SerializedPubKey
}

export type Race = {
    name: string,
    candidates: string[]
}

export type RaceResult = {
    race: string,
    counts: {candidate: string, count: number}[]
}

export const STORE_PREFIX = {
    VOTE: '0',
    ADMIN: '1',
    KEY_MAKER: '2',
    VOTER: '3',
    VOTE_COUNTER: '4',
    IDX_VOTE_PUBKEY: '5',
    AUDITOR: '6',
    RACE: '7'
};

export type FlagVoteOpts = {
    vote: Vote
    flag: keyof Required<Vote['flags']>,
    value: boolean,
    reason: string,
}
