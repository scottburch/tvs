import React from 'react'
import {Box, Container} from "@mui/material";
import {Link} from "react-router-dom";
import {BubbleConvo} from "../components/bubbles/Bubbles.jsx";
import {YouTube} from "../components/YouTube.jsx";

const convo = [
    "What's the problem?", "Trust in elections are at an all time low",
    "Why?", "The voting system lacks transparency",
    "Why?", "It is plagued by ancient thinking",
    "What can be done about it?", "Blockchain!!",
    "Isn't that insecure, difficult and slow?", "It doesn't have to be",
    "How can it be trusted?", "Same reason there are many trillions of dollars of value stored on blockchains right now",
    "How would blockchain help?", "Blockchains are at the same time, secure and transparent",
    "So everyone would see my vote?", "Yes and no, they would see an anonymized version of your vote",
    "How would that help?", [
        "You would be able to track your vote, and make sure it counts and does not get changed",
        "See instant, up to date, results",
        "Also, voting integrity organizations would be able to look for patterns of misbehaviour and report them",
        "People would be able to vote from home, and even through whatever voting org that matches their politics",
        "Providing trust in the system"
    ],
    "Tell me more", <Link style={{color: 'white'}} to={'/more-info'}>{location.origin}/more-info</Link>,
    "I don't know anything about blockchain", <Link to={'/why-blockchain'} style={{color: 'white'}}>{location.origin}/why-blockchain</Link>,
    "Can I see it?", <Link style={{color: 'white'}} to={'/try-tvs'}>{location.origin}/try-tvs</Link>
];

export const HomePage: React.FC = () => {
    return (
        <Container>
        <Box>
            <Box sx={{height: {xs: '170px', sm: '316px'}, width: {xs: '300px', sm: '560px'}}}>
                <YouTube videoId={'2S40z7EzhieSkrH3'}/>
            </Box>
            <BubbleConvo convo={convo}/>
        </Box>
        </Container>
)
};

