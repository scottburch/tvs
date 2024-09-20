import React, {PropsWithChildren} from "react";
import {Box, Stack, Typography} from "@mui/material";

export const ItemWithTitle: React.FC<PropsWithChildren<{title: string}>> = ({title, children}) => (
    <Stack spacing={1}>
        <Title>{title}</Title>
        <Body>{children}</Body>
    </Stack>
)

const Title: React.FC<PropsWithChildren> = ({children}) => (
    <Typography variant={'h5'}  sx={{borderBottom: 1}} gutterBottom >
        {children}
    </Typography>
);

const Body: React.FC<PropsWithChildren> = ({children}) => (
    <Box sx={{pl: '2rem'}}>
            <Typography variant={'body1'} sx={{mb: 2}}>
                <Stack spacing={2}>
                {children}
                </Stack>
            </Typography>
    </Box>
);

