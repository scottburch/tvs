import React from "react";
import {useReadAdmin} from "../hooks/useReadAdmin.js";
import {Box, Button, ButtonGroup, Container, Stack} from "@mui/material";
import {useSetAdmin} from "../hooks/useSetAdmin.js";
import {useClient} from "@my-blockchain/react";

export const AdminPage: React.FC = () => {
    const [client] = useClient();
    const admin = useReadAdmin();
    const setAdmin = useSetAdmin();

    return (
        <Container sx={{pt: 1}}>
            <Stack spacing={2}>
            <ButtonGroup>
                <Button disabled={!!admin || !client} onClick={() => setAdmin(client)}>Set Admin</Button>
            </ButtonGroup>
            <hr/>
            <Box>
                Admin: {admin?.pubKey} (Read-only id)
            </Box>
            </Stack>
        </Container>
    )


}