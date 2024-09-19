import React, {PropsWithChildren} from "react";
import {Box, Stack, Typography} from "@mui/material";

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
    <Box sx={{pl: '2rem', py: '1rem'}}>
        <Stack spacing={1}>
            {children}
        </Stack>
    </Box>
);

