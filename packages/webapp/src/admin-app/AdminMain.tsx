import React from 'react';
import {WithClient} from "@tvs/react";
import {Header} from "./components/Header.jsx";
import {Box} from "@mui/material";
import {Route, Routes} from "react-router";
import {AuthPage} from "./pages/AuthPage.jsx";
import {AdminPage} from "./pages/AdminPage.jsx";
import {KeyMakerPage} from "./pages/KeyMakerPage.jsx";
import {VoterPage} from "./pages/VoterPage.jsx";
import {AuditorPage} from "./pages/AuditorPage.jsx";
import {VotesPage} from "./pages/VotesPage.jsx";

export const AdminMain = () => {

    return (
        <Box>
            <WithClient url={`${location.protocol}//${location.host}/api`}>
                <Header/>
                <Box sx={{pt: '70px'}}>
                    <Routes>
                        <Route path={'/auth'} element={<AuthPage/>}/>
                        <Route path={'/admin'} element={<AdminPage/>}/>
                        <Route path={'/key-makers'} element={<KeyMakerPage/>}/>
                        <Route path={'/voters'} element={<VoterPage/>}/>
                        <Route path={'/auditors'} element={<AuditorPage/>}/>
                        <Route path={'/votes'} element={<VotesPage/>}/>
                    </Routes>
                </Box>
            </WithClient>
        </Box>
    );
}


