import {useContext, useEffect, useState} from "react";
import {ClientContext} from "@tvs/react";
import {from, map, mergeMap, switchMap, tap, toArray} from "rxjs";
import {RaceResult, readRaceResults, readRaces} from "@tvs/vote";
import {ApiClient} from "@tvs/blockchain";

export const useAllRaceResults = () => {
    const [client] = useContext(ClientContext);
    const [results, setResults] = useState<RaceResult[]>([]);

    useEffect(() => {
        client.pubKey && _allRaceResults(client).pipe(
            tap(results => setResults(results))
        ).subscribe()
    }, [client.pubKey]);

    return results;
};

export const _allRaceResults = (client: ApiClient) =>
    readRaces(client).pipe(
        switchMap(races => from(races)),
        mergeMap(race => readRaceResults(client, race.name).pipe(
            map(result => result.value)
        )),
        toArray()
    )