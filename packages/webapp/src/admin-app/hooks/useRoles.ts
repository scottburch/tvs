import {useEffect, useState} from "react";
import {catchError, combineLatest, filter, interval, map, of, switchMap, tap} from "rxjs";
import {useClient} from "@my-blockchain/react";
import {readAdmin, readAuditor, readKeyMaker, readVoter} from "@tvs/vote";
import {ApiClient} from "@my-blockchain/blockchain";
import {SerializedPubKey} from "@my-blockchain/crypto";

export type Roles = {
    admin: boolean
    keyMaker: boolean
    voter: boolean
    auditor: boolean
}

export const useRoles = () => {
    const [client] = useClient();
    const [roles, setRoles] = useState<Record<keyof Roles, boolean>>({admin: false, keyMaker: false, voter: false, auditor: false});

    useEffect(() => {
        !client && setRoles({admin: false, keyMaker: false, voter: false, auditor: false});

        const sub = interval(2000).pipe(
            filter(() => !!client?.pubKey),
            switchMap(() => readRoles(client)),
            tap(setRoles)
        ).subscribe();

        !!client?.pubKey && readRoles(client).pipe(
            tap(setRoles)
        ).subscribe();

        return () => sub.unsubscribe();
    }, [client]);
    return roles;
};

export const readRoles = (client: ApiClient) => of(undefined).pipe(
    filter(() => !!client?.pubKey),
    switchMap(() => combineLatest([
        readAdmin(client).pipe(
            map(admin => admin.value.pubKey === client?.pubKey),
            catchError(() => of(false))
        ),
        readKeyMaker(client, client?.pubKey as SerializedPubKey).pipe(
            map(() => true),
            catchError(() => of(false))
        ),
        readVoter(client, client?.pubKey as SerializedPubKey).pipe(
            map(() => true),
            catchError(() => of(false))
        ),
        readAuditor(client, client?.pubKey as SerializedPubKey).pipe(
            map(() => true),
            catchError(() => of(false))
        )
    ])),
    map(([admin, keyMaker, voter, auditor]) => ({admin, keyMaker, voter, auditor}))
);
