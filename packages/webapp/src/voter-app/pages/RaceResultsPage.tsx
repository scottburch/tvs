import React from "react";
import capitalize from "lodash-es/capitalize.js";
import {Box, Divider, List, ListItem, ListItemText} from "@mui/material";
import {RaceResult} from "@tvs/vote";
import {useAllRaceResults} from "../../common/hooks/useAllRaceResults.js";


const raceDisplay = (race: string) => race.split('-').map(capitalize).join(' ');

export const RaceResultsPage: React.FC = () => {
    const results = useAllRaceResults();


    return (
        <List>
            {results.map(result => <RaceListItem result={result}/>)}
        </List>
    )
}

const RaceListItem: React.FC<{result: RaceResult}> = ({result}) => (
    <>
        <ListItem>
            <ListItemText
                primary={raceDisplay(result.race)}
                secondary={<>{result.counts.map(c => <Box>{c.candidate}: {c.count}</Box>)}</>}
            />
        </ListItem>
        <Divider/>
    </>
)