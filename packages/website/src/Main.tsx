import React from 'react';
import {Route, Routes} from "react-router";
import {Header} from "./components/Header.jsx";
import {HomePage} from "./pages/HomePage.jsx";
import {Box} from "@mui/material";
import {MoreInfoPage} from "./pages/MoreInfoPage.jsx";
import {WhyBlockchainPage} from "./pages/why-blockchain/WhyBlockchainPage.jsx";

export const Main = () => {
    return (
        <>
            <Header/>
            <Box sx={{pt: '6rem'}}>
            <Routes>
                <Route path={'/'} element={<HomePage/>}/>
                <Route path={'/more-info'} element={<MoreInfoPage/>}/>
                <Route path={'/why-blockchain'} element={<WhyBlockchainPage/>}/>
            </Routes>
            </Box>
        </>
    );
}

