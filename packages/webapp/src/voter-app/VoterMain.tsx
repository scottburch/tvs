import React, {useEffect} from 'react';
import {useClient, WithClient} from "@tvs/react";
import {Header} from "./components/Header.jsx";
import {Box, Container} from "@mui/material";
import {useLocation, useNavigate} from "react-router-dom";
import {Route, Routes} from "react-router";
import {MyVotesPage} from "./pages/MyVotesPage.jsx";
import {VoterAuthPage} from "./pages/VoterAuthPage.jsx";
import {MenuPage} from "./pages/MenuPage.jsx";
import {VoteItemPage} from "./pages/VoteItemPage.jsx";
import {RaceResultsPage} from "./pages/RaceResultsPage.jsx";

export const VoterMain = () => {
    const [client] = useClient();
    const loc = useLocation();
    const nav = useNavigate();

    useEffect(() => {
        !client?.pubKey && loc.pathname !== '/vote/auth' && nav('/vote/auth');
    }, [client])


    return (
        <Box>
            <WithClient url={`${location.protocol}//${location.host}/api`}>
                <Header/>
                <Container sx={{pt: '50px'}}>
                    <Routes>
                        <Route path="/vote/auth/*" element={<VoterAuthPage/>}/>
                        <Route path="/vote/menu" element={<MenuPage/>}/>
                        <Route path="/vote/my-votes" element={<MyVotesPage/>}/>
                        <Route path="/vote/item/:itemNo" element={<VoteItemPage/>}/>
                        <Route path="/vote/results" element={<RaceResultsPage/>}/>
                    </Routes>
                </Container>
            </WithClient>
        </Box>
    );
}


