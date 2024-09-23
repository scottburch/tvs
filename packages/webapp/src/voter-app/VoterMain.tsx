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


    return (
        <WithClient url={`${location.protocol}//${location.host}/api`}>
            <AuthCheck/>
            <Header/>
            <Container sx={{pt: '50px'}}>
                <Routes>
                    <Route path="/auth/*" element={<VoterAuthPage/>}/>
                    <Route path="/menu" element={<MenuPage/>}/>
                    <Route path="/my-votes" element={<MyVotesPage/>}/>
                    <Route path="/item/:itemNo" element={<VoteItemPage/>}/>
                    <Route path="/results" element={<RaceResultsPage/>}/>
                </Routes>
            </Container>
        </WithClient>
    );
};

const AuthCheck = () => {
    const [client] = useClient();
    const loc = useLocation();
    const nav = useNavigate();

    useEffect(() => {
        !client?.pubKey && loc.pathname !== '/vote/auth' && nav('/vote/auth');
    }, [client, loc.pathname])
    return null
};


