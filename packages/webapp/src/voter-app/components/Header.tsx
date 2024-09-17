import React from "react";
import {AppBar, Box, Stack} from "@mui/material";
import {HeaderTabs} from "./HeaderTabs.jsx";

export const Header: React.FC = () => (
    <AppBar>
        <Stack sx={{pl: 2}} height={40}>
            <HeaderTabs/>
        </Stack>
    </AppBar>
);

