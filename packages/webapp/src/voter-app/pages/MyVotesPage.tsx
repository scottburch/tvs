import React from "react";
import {useMyVotes} from "../hooks/useMyVotes.js";
import {Divider, List, ListItem, ListItemText, Typography} from "@mui/material";
import {Vote} from "@tvs/vote";
import capitalize from "lodash-es/capitalize.js";

export const MyVotesPage: React.FC = () => {
    const myVotes = useMyVotes();

    return (
        <List>
            {myVotes?.map(vote => <VoteListItem vote={vote}/>)}
        </List>
    )
};

const raceDisplay = (race: string) => race.split('-').map(capitalize).join(' ');

const VoteListItem: React.FC<{ vote: Vote }> = ({vote}) => (
    <>
        <ListItem>
            <ListItemText
                primary={raceDisplay(vote.race)}
                secondary={(
                    <>
                        <Typography sx={{textDecoration: vote.flags?.invalid ? 'line-through' : 'none'}}>
                            {vote.candidate}
                        </Typography>
                        <List>
                            {(vote.log || []).map(log => (
                                <ListItem>
                                    <ListItemText
                                        primary={log.change}
                                        secondary={log.reason}
                                    />
                                </ListItem>
                            ))}
                        </List>
                        <Typography>
                        </Typography>
                    </>
                )}
            />
        </ListItem>
        <Divider/>
    </>
);