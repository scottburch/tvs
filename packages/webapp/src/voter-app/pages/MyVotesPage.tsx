import React from "react";
import {useMyVotes} from "../hooks/useMyVotes.js";
import {Box, Divider, List, ListItem, ListItemText, Stack, Typography} from "@mui/material";
import {Vote} from "@tvs/vote";
import capitalize from "lodash-es/capitalize.js";
import {CheckVote} from "../components/CheckVote.jsx";

export const MyVotesPage: React.FC = () => {
    const myVotes = useMyVotes();

    return (
        <List>
            {myVotes?.map(vote => <VoteListItem key={vote.race + vote.candidate} vote={vote}/>)}
        </List>
    )
};

const raceDisplay = (race: string) => race.split('-').map(capitalize).join(' ');

const VoteListItem: React.FC<{ vote: Vote }> = ({vote}) => (
    <>
        <ListItem>
            <Stack flexDirection={'row'} sx={{width: '100%'}}>
                <Box sx={{flex: 1}}>
                    <Typography variant={'body1'}>
                        {raceDisplay(vote.race)}:
                    </Typography>
                    <Typography sx={{pl: 1, textDecoration: vote.flags?.invalid ? 'line-through' : 'none'}}>
                        {vote.candidate}
                    </Typography>
                    <List>
                        {(vote.log || []).map(log => (
                            <ListItem key={log.reason}>
                                <ListItemText
                                    primary={log.change}
                                    secondary={log.reason}
                                />
                            </ListItem>
                        ))}
                    </List>
                </Box>
                <CheckVote race={vote.race}/>
            </Stack>
        </ListItem>
        <Divider/>
    </>
);