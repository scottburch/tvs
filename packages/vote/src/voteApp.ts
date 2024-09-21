import {
    App,
    AppStore,
    findPrefix,
    get,
    Message,
    MsgHandler,
    put,
    QueryHandler,
    startApp,
    Transaction
} from '@tvs/blockchain'
import {
    catchError,
    combineLatest,
    defaultIfEmpty,
    first,
    groupBy,
    map,
    mergeMap,
    of,
    reduce,
    switchMap,
    throwError,
    throwIfEmpty,
    toArray
} from "rxjs";
import {SerializedPubKey} from "@tvs/crypto";
import {
    Admin,
    Auditor,
    FlagVoteOpts,
    KeyMaker,
    Race,
    RaceResult,
    STORE_PREFIX,
    Vote,
    VoteCounter,
    Voter
} from "./types.js";


import {AppConfig} from "@tvs/blockchain";

export type VoteAppConfig = AppConfig & {}

export const startVoteApp = (config: VoteAppConfig) =>
    of({
        ...config,
        msgHandlers: {
            'vote': voteMsgHandler,
            'set-admin': setAdminMsgHandler,
            'create-key-maker': createKeyMakerMsgHandler,
            'create-vote-counter': createVoteCounterMsgHandler,
            'create-voter': createVoterMsgHandler,
            'create-auditor': createAuditorMsgHandler,
            'flag-vote': flagVoteMsgHandler,
            'create-race': createRaceMsgHandler
        },
        queryHandlers: {
            'get-race-results': raceResultsQueryHandler,
            'get-admin': getAdminQueryHandler,
            'get-key-maker': getKeyMakerQueryHandler,
            'get-key-makers': getKeyMakersQueryHandler,
            'get-vote-counters': getVoteCountersQueryHandler,
            'get-voter': getVoterQueryHandler,
            'get-voters': getVotersQueryHandler,
            'get-votes-by-voter': getVotesByVoterQueryHandler,
            'get-auditor': getAuditorQueryHandler,
            'get-vote': getVoteQueryHandler,
            'get-auditors': getAuditorsQueryHandler,
            'get-race': getRaceQueryHandler,
            'get-races': getRacesQueryHandler,
            'get-votes-by-race': getVotesByRaceQueryHandler
        }
    } as VoteAppConfig).pipe(
        switchMap(config => startApp(config))
    );

const makeVoteKey = (vote: Vote) => `${STORE_PREFIX.VOTE}-${vote.race}-${vote.voter}-${vote.time}`

const createVoterMsgHandler: MsgHandler<Voter> = ({app, msg, tx}) =>
    checkIsKeyMaker(app.appStore, msg.data.maker).pipe(
        switchMap(() => checkPubkeyIsSigner(tx, msg.data.maker, 'MAKER')),
        switchMap(() => put(app.appStore, `${STORE_PREFIX.VOTER}-${msg.data.pubKey}`, JSON.stringify(msg.data)))
    );

const createRaceMsgHandler: MsgHandler<Race> = ({app, msg, tx}) =>
    checkIsAdmin(app, tx.signer).pipe(
        switchMap(() => put(app.appStore, `${STORE_PREFIX.RACE}-${msg.data.name}`, JSON.stringify(msg.data)))
    )


const checkIsAdmin = (app: App, pubKey: SerializedPubKey) =>
    get(app.appStore, 'admin').pipe(
        catchError(err => throwError(() => ({code: 1, log: err.code === 'NOT_FOUND' ? 'ADMIN_NOT_FOUND' : err.code}))),
        map(admin => JSON.parse(admin) as Admin),
        switchMap(admin => admin.pubKey === pubKey ? of(undefined) : throwError(() => ({
            code: 1,
            log: `NOT_ADMIN:${pubKey}`
        }))),
    );

const createAuditorMsgHandler: MsgHandler<Auditor> = ({app, msg, tx}) =>
    checkIsKeyMaker(app.appStore, msg.data.maker).pipe(
        switchMap(() => checkPubkeyIsSigner(tx, msg.data.maker, 'MAKER')),
        switchMap(() => put(app.appStore, `${STORE_PREFIX.AUDITOR}-${msg.data.pubKey}`, JSON.stringify(msg.data)))
    );

const createVoteCounterMsgHandler: MsgHandler<VoteCounter> = ({app, msg, tx}) =>
    checkIsKeyMaker(app.appStore, msg.data.maker).pipe(
        switchMap(() => checkPubkeyIsSigner(tx, msg.data.maker, 'MAKER')),
        switchMap(() => put(app.appStore, `${STORE_PREFIX.VOTE_COUNTER}-${msg.data.pubKey}`, JSON.stringify(msg.data))),
    );


const checkIsKeyMaker = (store: AppStore, pubKey: SerializedPubKey) =>
    get(store, `${STORE_PREFIX.KEY_MAKER}-${pubKey}`).pipe(
        catchError(err => err.code === 'NOT_FOUND' ? throwError(() => ({
            code: 1,
            log: 'NOT_KEY_MAKER'
        })) : throwError(() => err)),
    );

const checkPubkeyIsSigner = (tx: Transaction, pubKey: SerializedPubKey, name: string) =>
    tx.signer === pubKey ? of(undefined) : throwError(() => ({code: 1, log: `${name}_NOT_SIGNER`}))


const getVoterQueryHandler: QueryHandler<{ pubKey: SerializedPubKey }> = ({app, data}) =>
    get(app.appStore, `${STORE_PREFIX.VOTER}-${data.pubKey}`).pipe(
        map(voter => ({code: 0, key: `${STORE_PREFIX.VOTER}-${data.pubKey}`, value: voter})),
        catchError(err => of({code: 1, log: err.code}))
    );

const getVoteQueryHandler: QueryHandler<{ race: string, voter: SerializedPubKey }> = ({app, data}) => {
    const key = `${STORE_PREFIX.VOTE}-${data.race}-${data.voter}`;
    return findPrefix(app.appStore, key).pipe(
        first(),
        map(([_, vote]) => ({code: 0, key, value: vote})),
        throwIfEmpty(() => ({code: 1, log: `VOTE_NOT_FOUND:${key}`}))
    )
}

const getAuditorQueryHandler: QueryHandler<{ pubKey: SerializedPubKey }> = ({app, data}) =>
    get(app.appStore, `${STORE_PREFIX.AUDITOR}-${data.pubKey}`).pipe(
        map(auditor => ({code: 0, key: `auditor-${data.pubKey}`, value: auditor})),
        catchError(err => of({code: 1, log: err.code}))
    )


const getVoteCountersQueryHandler: QueryHandler<{}> = ({app}) =>
    findPrefix(app.appStore, `${STORE_PREFIX.VOTE_COUNTER}-`).pipe(
        map(([_, value]) => JSON.parse(value)),
        toArray(),
        map(voteCounters => ({code: 0, key: 'vote-counters', value: JSON.stringify(voteCounters)}))
    );

const getVotesByVoterQueryHandler: QueryHandler<{ voter: SerializedPubKey }> = ({app, data}) =>
    findPrefix(app.appStore, `${STORE_PREFIX.IDX_VOTE_PUBKEY}-${data.voter}-`).pipe(
        mergeMap(([_, key]) => get(app.appStore, key)),
        map(json => JSON.parse(json)),
        toArray(),
        map(votes => ({code: 0, key: 'votes-by-voter', value: JSON.stringify(votes)}))
    );

const getVotesByRaceQueryHandler: QueryHandler<{race: string}> = ({app, data}) =>
    findPrefix(app.appStore, `${STORE_PREFIX.VOTE}-${data.race}-`).pipe(
        map(([_, json]) => JSON.parse(json)),
        toArray(),
        map(votes => ({code: 0, key: 'votes-by-race', value: JSON.stringify(votes)}))
    )

const createKeyMakerMsgHandler: MsgHandler<KeyMaker> = ({app, msg, tx}) =>
    checkCanCreateKeyMaker(app, msg, tx).pipe(
        switchMap(() => put(app.appStore, `${STORE_PREFIX.KEY_MAKER}-${msg.data.pubKey}`, JSON.stringify(msg.data)))
    );

const checkCanCreateKeyMaker = (app: App, msg: Message<KeyMaker>, tx: Transaction) =>
    get(app.appStore, 'admin').pipe(
        map(admin => JSON.parse(admin)),
        switchMap(admin => tx.signer === admin.pubKey ? of(undefined) : of(undefined).pipe(
            switchMap(() => get(app.appStore, `${STORE_PREFIX.KEY_MAKER}-${tx.signer}`)),
            catchError(err => err.code === 'NOT_FOUND' ? throwError(() => ({
                code: 1,
                log: 'NOT_ALLOWED_TO_CREATE_KEYMAKER'
            })) : of(undefined))
        ))
    )

const getKeyMakerQueryHandler: QueryHandler<{ pubKey: SerializedPubKey }> = ({app, data}) => of(undefined).pipe(
    switchMap(() => get(app.appStore, `${STORE_PREFIX.KEY_MAKER}-${data.pubKey}`)),
    map(keyMaker => ({code: 0, value: keyMaker, key: `${STORE_PREFIX.KEY_MAKER}-${data.pubKey}`})),
    catchError(_ => of({code: 1, log: `KEY_MAKER_NOT_FOUND:${data.pubKey}`}))
)

const getKeyMakersQueryHandler: QueryHandler<KeyMaker[]> = ({app}) => of(undefined).pipe(
    switchMap(() => findPrefix(app.appStore, `${STORE_PREFIX.KEY_MAKER}-`)),
    map(([_, value]) => JSON.parse(value)),
    toArray(),
    map(keyMakers => ({code: 0, key: 'key-makers', value: JSON.stringify(keyMakers)}))
);

const getVotersQueryHandler: QueryHandler<Voter[]> = ({app}) => of(undefined).pipe(
    switchMap(() => findPrefix(app.appStore, `${STORE_PREFIX.VOTER}-`)),
    map(([_, value]) => JSON.parse(value)),
    toArray(),
    map(voters => ({code: 0, key: 'voters', value: JSON.stringify(voters)}))
);

const getAuditorsQueryHandler: QueryHandler<Auditor[]> = ({app}) =>
    findPrefix(app.appStore, `${STORE_PREFIX.AUDITOR}-`).pipe(
        map(([_, value]) => JSON.parse(value)),
        toArray(),
        map(auditors => ({code: 0, key: 'auditors', value: JSON.stringify(auditors)}))
    );


const setAdminMsgHandler: MsgHandler<Admin> = ({app, msg, tx}) =>
    of(undefined).pipe(
        switchMap(() => checkSignerMatchPubKey(app, msg, tx)),
        switchMap(() => checkInvalidOverwriteOfAdmin(app, msg, tx)),
        switchMap(() => put(app.appStore, 'admin', JSON.stringify(msg.data))),
    )

const checkInvalidOverwriteOfAdmin = (app: App, msg: Message<Admin>, tx: Transaction) =>
    get(app.appStore, 'admin').pipe(
        map(value => JSON.parse(value)),
        switchMap(({pubKey}) => tx.signer === pubKey ? of(undefined) : throwError(() => ({
            code: 1,
            log: `NOT_OWNER:${msg.data.pubKey}`
        }))),
        catchError(err => err.code === 'NOT_FOUND' ? of(undefined) : throwError(() => err))
    )

const checkSignerMatchPubKey = (app: App, msg: Message<Admin>, tx: Transaction) =>
    of(undefined).pipe(
        switchMap(() => tx.signer === msg.data.pubKey ? of(undefined) : throwError(() => ({
            code: 1,
            log: 'PUBKEY_SIGNER_MISMATCH'
        })))
    )

const checkRaceExists = (app: App, msg: Message<Vote>) =>
    get(app.appStore, `${STORE_PREFIX.RACE}-${msg.data.race}`).pipe(
        catchError(err => err.code === 'NOT_FOUND' ? throwError(() => ({
            code: 1,
            log: 'RACE_NOT_FOUND'
        })) : of(undefined))
    )

const voteMsgHandler: MsgHandler<Vote> = ({app, msg, tx}) => of(undefined).pipe(
    switchMap(() => checkVoterRegistered(app, tx)),
    switchMap(() => checkRaceExists(app, msg)),
    switchMap(() => checkDoubleVote(app, msg, tx)),
    map(() => `${STORE_PREFIX.VOTE}-${msg.data.race}-${tx.signer}-${msg.data.time}`),
    switchMap(key => combineLatest([
        put(app.appStore, key, JSON.stringify({...msg.data, voter: tx.signer} satisfies Vote)),
        put(app.appStore, `${STORE_PREFIX.IDX_VOTE_PUBKEY}-${tx.signer}-${msg.data.race}-${msg.data.time}`, key)
    ]))
);

const flagVoteMsgHandler: MsgHandler<FlagVoteOpts> = ({app, msg, tx, reason}) => of(undefined).pipe(
    switchMap(() => checkIsAuditor(app, tx)),
        switchMap(() => checkVoteExists(app, makeVoteKey(msg.data.vote))),
        switchMap(() => get(app.appStore, makeVoteKey(msg.data.vote))),
        map(vote => JSON.parse(vote) as Vote),
        map(vote => ({
            ...vote,
            flags: {
                ...vote.flags,
                [msg.data.flag]: msg.data.value
            },
            log: [...vote.log || [], {by: tx.signer, change: msg.data.flag, reason: msg.data.reason}]
        } satisfies Vote)),
        switchMap(vote => put(app.appStore, makeVoteKey(msg.data.vote), JSON.stringify(vote))),
);

const checkVoteExists = (app: App, voteId: string) => {
    console.log('***', voteId)
    return get(app.appStore, voteId).pipe(
        catchError(err => err.code === 'NOT_FOUND' ? throwError(() => ({
            code: 1,
            log: `NO_SUCH_VOTE:${voteId}`
        })) : throwError(() => ({code: 1, log: err.code}))),
    )
}

const checkIsAuditor = (app: App, tx: Transaction) =>
    get(app.appStore, `${STORE_PREFIX.AUDITOR}-${tx.signer}`).pipe(
        catchError(err => err.code === 'NOT_FOUND' ? throwError(() => ({
            code: 1,
            log: 'NOT_AN_AUDITOR'
        })) : of(undefined)),
    )

const checkVoterRegistered = (app: App, tx: Transaction) =>
    get(app.appStore, `${STORE_PREFIX.VOTER}-${tx.signer}`).pipe(
        catchError(err => err.code === 'NOT_FOUND' ? of(undefined).pipe(
            switchMap(() => get(app.appStore, `${STORE_PREFIX.VOTE_COUNTER}-${tx.signer}`))
        ) : throwError(() => ({code: 1, log: err.code}))),
        catchError(err => err.code === 'NOT_FOUND' ? throwError(() => ({
            code: 1,
            log: 'NOT_REGISTERED_VOTER'
        })) : of(undefined)),
    );

const checkDoubleVote = (app: App, msg: Message<Vote>, tx: Transaction) =>
    findPrefix(app.appStore, `${STORE_PREFIX.VOTE}-${msg.data.race}-${tx.signer}`).pipe(
        switchMap(() => get(app.appStore, `${STORE_PREFIX.VOTE_COUNTER}-${tx.signer}`)),
        defaultIfEmpty(undefined),
        catchError(err => err.code === 'NOT_FOUND' ? throwError(() => ({code: 1, log: 'DOUBLE_VOTE'})): throwError(() => ({code: 1, log: err.code}))),
    );

const raceResultsQueryHandler: QueryHandler<{ race: string }> = ({app, data}) =>
    of(undefined).pipe(
        switchMap(() => findPrefix(app.appStore, `${STORE_PREFIX.VOTE}-${data.race}`)),
        map(([_, vote]) => JSON.parse(vote) as Vote),
        groupBy(vote => vote.candidate),
        mergeMap(group => group.pipe(
            reduce((result, vote) => ({
                candidate: vote.candidate,
                count: result.count + 1
            }), {count: 0} as { candidate: string, count: number }),
        )),
        toArray(),
        map(counts => ({
            race: data.race,
            counts
        } satisfies RaceResult)),
        map(result => ({value: JSON.stringify(result)})),
        catchError(err => of({code: 1, log:err.code}))
    );

const getAdminQueryHandler: QueryHandler<{}> = ({app}) =>
    of(undefined).pipe(
        switchMap(() => get(app.appStore, 'admin')),
        map(result => ({key: 'admin', value: result})),
        catchError(err => of({code: 1, log: err.code === 'NOT_FOUND' ? 'ADMIN_NOT_FOUND' : err.code})),
    );

const getRaceQueryHandler: QueryHandler<{ name: string }> = ({app, data}) =>
    get(app.appStore, `${STORE_PREFIX.RACE}-${data.name}`).pipe(
        map(result => ({key: `${STORE_PREFIX.RACE}-${data.name}`, value: result})),
        catchError(err => of({code: 1, log: err.code === 'NOT_FOUND' ? 'RACE_NOT_FOUND' : err.code}))
    );

const getRacesQueryHandler: QueryHandler<{}> = ({app}) =>
    findPrefix(app.appStore, `${STORE_PREFIX.RACE}-`).pipe(
        map(([_, value]) => JSON.parse(value)),
        toArray(),
        map(races => ({code: 0, key: 'races', value: JSON.stringify(races)})),
        catchError(err => of({code: 1, log: err.code}))
    );





