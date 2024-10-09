import {Race, readRaces} from "@tvs/vote";
import {useEffect, useState} from "react";
import {ApiClient} from "@my-blockchain/blockchain";
import {useClient} from "@my-blockchain/react";
import {tap} from "rxjs";

export const useRaces = () => {
    const [races, setRaces] = useState<Race[]>([]);
    const [client] = useClient()

    useEffect(() => {
        client.pubKey && _races(client).pipe(
            tap(races => setRaces(races))
        ).subscribe()
    }, [client.pubKey]);
    return races;
};

export const _races = (client: ApiClient) =>
    readRaces(client);
