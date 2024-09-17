import React from "react";
import {useRaceResults} from "../hooks/useRaceResults.js";
import {Box, Typography} from "@mui/material";

export const RaceResults: React.FC<{race: string}> = ({race}) => {
    const votes = useRaceResults(race);


    return (
        <>
            <Typography variant={'h3'}>Results for {race}</Typography>
            {votes.map(vote => (
                <Box>
                    {vote.candidate}: {vote.votes}
                </Box>
            ))}
        </>
    );
};

