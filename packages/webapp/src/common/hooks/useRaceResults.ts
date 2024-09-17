import {useContext, useEffect, useState} from "react";
import {ClientContext} from "@tvs/react";
import {tap} from "rxjs";
import {RaceResult, readRaceResults} from "@tvs/vote";

export const useRaceResults = (race: string) => {
    const [client] = useContext(ClientContext);
    const [results, setResults] = useState<RaceResult>();

    useEffect(() => {
        !!client.pubKey && readRaceResults(client, race).pipe(
            tap(({value}) => setResults(value))
        )
    }, [client.pubKey]);
    return results;
};