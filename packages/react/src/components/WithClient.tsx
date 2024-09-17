import React, {createContext, useState} from 'react'
import type {PropsWithChildren} from 'react'
import type {ApiClient} from '@tvs/blockchain'
import {newApiClient} from "@tvs/blockchain";
import {type SerializedPrivKey, type SerializedPubKey} from "@tvs/crypto";
import {map, Observable, of, tap} from "rxjs";


export const ClientContext =
    createContext<[
        client: ApiClient,
        login: (privKey: SerializedPrivKey) => Observable<undefined>,
        logout: () => Observable<undefined>,
        roLogin: (pubKey: SerializedPubKey) => Observable<undefined>
    ]>([{url: ''} as ApiClient, () => of(undefined), () => of(undefined), () => of(undefined),
]);

export const WithClient: React.FC<PropsWithChildren<{url: string}>> = ({url, children}) => {

    const [client, setClient] = useState<ApiClient>({url} as ApiClient);

    const roLogin = (pubKey: SerializedPubKey) =>
        of(undefined).pipe(
            tap(() => setClient({pubKey, url} as ApiClient)),
            map(() => undefined)
        );

    const login = (privKey: SerializedPrivKey) =>
        newApiClient({url, privKey}).pipe(
            tap(client => setClient(client)),
            map(() => undefined)
        );

    const logout = () => of(undefined).pipe(
        map(() => setClient({url} as ApiClient)),
        map(() => undefined)
    );

    return (
        <ClientContext.Provider value={[client, login, logout, roLogin]}>
            {children}
        </ClientContext.Provider>
    );
};