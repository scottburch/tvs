import React from 'react';
import {Route, Routes} from "react-router";
import {AdminMain} from "./admin-app/AdminMain.jsx";
import {VoterMain} from "./voter-app/VoterMain.jsx";

export const Main = () => {

    return (
        <Routes>
            <Route path={'/admin/*'} element={<AdminMain/>}/>
            <Route path={'/*'} element={<VoterMain/>}/>
        </Routes>
    );
}

