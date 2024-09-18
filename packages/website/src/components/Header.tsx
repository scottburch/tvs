import React from "react";
import {AppBar, Box, Typography} from "@mui/material";

export const Header: React.FC = () => {
    return (

        <AppBar>
            <Typography fontSize={'20px'} lineHeight={'40px'} px={1}>
                Transparent Voting
            </Typography>

        </AppBar>
    )
}