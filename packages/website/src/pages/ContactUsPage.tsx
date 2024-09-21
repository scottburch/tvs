import React from "react";
import {Container, Stack, Typography} from "@mui/material";

export const ContactUsPage: React.FC = () => (
    <Container>
        <Stack spacing={3}>
        <Typography variant={'h4'}>Contact Us</Typography>
        <Typography>
            For more information, please write <span dangerouslySetInnerHTML={{__html: m.join('')}}/>
        </Typography>
        </Stack>
    </Container>
)

const m = [
    '<a',' h', 're', 'f="ma','il','to:', 'sco', 'tt', '@b', 'ulld', 'ogin', 'fo.c', 'om">',
    'sco', 'tt', '@b', 'ulld', 'ogin', 'fo.c', 'om',
    '</', 'a>'
]