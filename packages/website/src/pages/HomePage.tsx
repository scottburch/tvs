import React from 'react'
import {Container, Typography} from "@mui/material";

export const HomePage: React.FC = () => {
    return (
        <Container>
            <Typography variant={'h4'}  sx={{borderBottom: 1, display: 'inline'}} gutterBottom >
                The problem?
            </Typography>
            <Typography pl={5} py={3}>Trust in elections are at an all time low.</Typography>
        </Container>
    )
};
