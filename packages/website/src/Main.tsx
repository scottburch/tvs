import React from 'react';
import {Route, Routes, useLocation} from "react-router";
import {Header} from "./components/Header.jsx";
import {HomePage} from "./pages/HomePage.jsx";
import {Box} from "@mui/material";

export const Main = () => {
    return (
        <>
            <Header/>
            <Box sx={{pt: '50px'}}>
            <Routes>
                <Route path={'/'} element={<HomePage/>}/>
            </Routes>
            </Box>
        </>
    );
}

