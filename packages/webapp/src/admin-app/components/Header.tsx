import React from "react";
import {AppBar, Box} from "@mui/material";
import {MainTabsPanel} from "./MainTabsPanel.jsx";
import {useRoles} from "../hooks/useRoles.js";

export const Header: React.FC = () => (
    <AppBar>
        <Box sx={{display: 'flex', flexDirection: 'row', lineHeight: '40px'}}>
            <Box sx={{flex: 1, padding: '10px'}}>
                <MainTabsPanel/>
            </Box>
            <Box sx={{p:1}}>
                <Roles/>
            </Box>
        </Box>
    </AppBar>
);

const Roles: React.FC = () => {
    const roles = useRoles();

    const rolesDisplay = () => [
        roles.admin ? 'Admin' : '',
        roles.keyMaker ? 'Key Maker' : '',
        roles.voter ? 'Voter' : '',
        roles.auditor ? 'Auditor' : '',
        !roles.admin && !roles.keyMaker && !roles.voter && !roles.auditor ? 'No Role' : ''
    ].filter(role => !!role).join(' | ');


    return (
        <Box>
            {rolesDisplay()}
            {rolesDisplay().length === 0 ? 'No Roles' : ''}
        </Box>
    )
}