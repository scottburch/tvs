import React from 'react';
import {Route, Routes} from "react-router";
import {AdminMain} from "./admin-app/AdminMain.jsx";
import {VoterMain} from "./voter-app/VoterMain.jsx";
import {AddVoterPage} from "./utility-pages/AddVoterPage.jsx";

export const Main = () => {

    return (
        <Routes>
            <Route path={'/admin/*'} element={<AdminMain/>}/>
            <Route path={'/utility-pages/create-voter'} element={<AddVoterPage/>}/>
            <Route path={'/*'} element={<VoterMain/>}/>
        </Routes>
    );
}

