import {readVotesByVoter, Vote} from "@tvs/vote";
import {useClient} from "@tvs/react";
import {useEffect, useState} from "react";
import {tap} from "rxjs";

export const useMyVotes = () => {
    const [client] = useClient();
    const [votes, setVotes] = useState<Vote[]>();

    useEffect(() => {
        client && readVotesByVoter(client, client.pubKey).pipe(
            tap(votes => setVotes(votes))
        ).subscribe()
    }, [client]);

    return votes
};

