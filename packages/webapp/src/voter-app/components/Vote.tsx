import React, {useEffect, useRef, useState} from "react";
import capitalize from 'lodash-es/capitalize.js'

import {
    Box,
    Button,
    FormControl,
    FormControlLabel,
    FormLabel,
    Radio,
    RadioGroup,
    Stack
} from "@mui/material";
import {readVote, readVotesByVoter, vote} from "@tvs/vote";
import {useClient} from "@tvs/react";
import {filter, from, map, switchMap, defaultIfEmpty, tap, catchError, of} from "rxjs";



export const Vote: React.FC<{ race: string, candidates: string[], voteDone: () => void }> = ({race, candidates, voteDone}) => {
    const [client] = useClient();
    const candidate = useRef('');
    const [previouslyVoted, setPreviouslyVoted] = useState('Loading...');
    const raceDisplay = (race: string) => race.split('-').map(capitalize).join(' ');
    const [txWait, setTxWait] = useState(false);

    const doVote = () => {
        setTxWait(true);
        vote(client, {candidate: candidate.current, race}).pipe(
            tap(() => setTxWait(false)),
            tap(() => setPreviouslyVoted(candidate.current)),
            tap(() => voteDone())
        ).subscribe();
    };

    useEffect(() => {
        client.pubKey && readVote(client, race, client.pubKey).pipe(
            tap(vote => setPreviouslyVoted(vote.candidate)),
            catchError(() => of(setPreviouslyVoted('')))
        ).subscribe();
    }, [client.pubKey, race])


    return (
        <>
            <Stack spacing={2}>
                <FormControl>
                    <FormLabel id="demo-radio-buttons-group-label">{raceDisplay(race)}</FormLabel>
                    <RadioGroup
                        name="candidates"
                        onChange={ev => candidate.current = ev.target.value}
                    >
                        {candidates.map(candidate => <FormControlLabel key={candidate} value={candidate}
                                                                       control={<Radio disabled={!!previouslyVoted || txWait}/>}
                                                                       label={candidate}/>)}
                    </RadioGroup>
                </FormControl>
                <Box>
                    <Button disabled={!!previouslyVoted || txWait} variant={'outlined'} onClick={() => doVote()}>
                        {previouslyVoted ? (
                            `Previously voted for ${previouslyVoted}`
                        ) : (
                            txWait ? ('Sending Vote') : ('Register Vote')
                        )}
                    </Button>
                </Box>
            </Stack>
        </>
    )
}