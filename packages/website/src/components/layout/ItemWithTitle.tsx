import React, {PropsWithChildren} from "react";
import {Box, Typography} from "@mui/material";

export const ItemWithTitle: React.FC<PropsWithChildren<{title: string}>> = ({title, children}) => (
    <Box>
        <Title>{title}</Title>
        <Body>{children}</Body>
    </Box>
)

const Title: React.FC<PropsWithChildren> = ({children}) => (
    <Typography variant={'h5'}  sx={{borderBottom: 1, display: 'inline'}} gutterBottom >
        {children}
    </Typography>
);

const Body: React.FC<PropsWithChildren> = ({children}) => (
    <Typography variant={'body1'} sx={{mb: '1.5rem', pl: '2rem', py: '1rem'}}>{children}</Typography>
);

