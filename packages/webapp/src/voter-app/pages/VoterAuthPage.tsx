import React, {useRef} from "react";
import {Box, Button, ButtonGroup, Container, Stack, TextField, Typography} from "@mui/material";
import {useNavigate} from "react-router-dom";
import {useClient} from "@my-blockchain/react";
import {decryptPrivKey} from "@my-blockchain/crypto";
import {switchMap, tap} from "rxjs";
import {QrTextField} from "../../common/components/QrTextField.jsx";


export const VoterAuthPage: React.FC = () => {
    const [_, login] = useClient();
    const navigate = useNavigate();
    const inputtedKey = useRef('');
    const passwd = useRef('');

    const doLogin = (key: string) => {
            decryptPrivKey(passwd.current, key).pipe(
                switchMap(privKey => login(privKey)),
                tap(() => navigate('/vote/menu'))
            ).subscribe()
    }


    return (
        <Container>
            <Stack spacing={2}>
                <Box>
                    <Typography>
                        Scan your voter Id, or enter it in the text box below.
                    </Typography>
                </Box>
                <QrTextField id="voterId" onChange={ev => inputtedKey.current = ev.target.value}/>
                <TextField id="password" label={'Password'} onChange={ev => passwd.current = ev.target.value}/>
                <ButtonGroup>
                    <Button onClick={() => doLogin(inputtedKey.current)}>Authenticate</Button>
                </ButtonGroup>
            </Stack>
        </Container>
    )
};