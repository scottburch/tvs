import React from "react";
import {AppBar, Box, Container, Stack, Typography} from "@mui/material";

export const IndexPage: React.FC = () => (
    <>
        <AppBar sx={{lineHeight: 3, pl: 2, fontSize: '1.5rem'}}>
            TVS-Transparent Voting
        </AppBar>
        <Box sx={{paddingTop: 10}}>
        <Container>
            <Stack spacing={2}>
                <Typography>
                    Choose from one of the following:
                </Typography>
                <a href={'/utility-pages/create-voter'}>Register a new voter</a>
                <a href={'/vote/auth'}>Run the Voting App</a>
                <a href={'/admin'}>TVS Admin App</a>
            </Stack>
        </Container>
        </Box>
    </>
)