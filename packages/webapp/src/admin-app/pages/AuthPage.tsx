import React, {useRef, useState} from "react";
import {useClient} from "@tvs/react";
import {Alert, Box, Button, ButtonGroup, Container, Paper, Stack, TextField, Typography} from "@mui/material";
import {decryptPrivKey, EncryptedPrivKey} from "@tvs/crypto";
import {catchError, of, switchMap, tap} from "rxjs";
import {useKeyGenerator} from "../../common/hooks/useKeyGenerator.js";
import {QRCodeSVG} from "qrcode.react";
import {Key} from "../../common/components/Key.jsx";
import {QrTextField} from "../../common/components/QrTextField.jsx";

export const AuthPage: React.FC = () => {
    const generateKeys = useKeyGenerator();
    const [client, login, logout] = useClient();
    const [privKey, setPrivKey] = useState<EncryptedPrivKey>('' as EncryptedPrivKey)
    const password = useRef<string>('12345');
    const [error, setError] = useState('');
    const [showPubKey, setShowPubKey] = useState(false);
    const [showPrivKey, setShowPrivKey] = useState(false)

    const generateKey = () => generateKeys(password.current).pipe(
        tap(({encPrivKey}) => setPrivKey(encPrivKey)),
        tap(() => setError(''))
    ).subscribe();

    const doLogin = () => {
        setError('');
        decryptPrivKey(password.current, privKey).pipe(
            switchMap(privKey => login(privKey)),
            catchError(err => of(err).pipe(tap(() => setError(err.toString()))))
        ).subscribe();
    }

    return (
        <Container sx={{px: {xs: '2px', sm: 1}}}>
            {client.pubKey ? (
                <Stack spacing={2}>
                    {showPubKey ? (
                        <Paper sx={{py: 1}}>
                            <Stack spacing={1}>
                                <Typography>Your Read-only Id: <Key>{client.pubKey}</Key></Typography>
                                <QRCodeSVG value={client.pubKey}/>
                                <ButtonGroup>
                                    <Button onClick={() => setShowPubKey(false)}>Hide Read-only Id</Button>
                                </ButtonGroup>
                            </Stack>
                        </Paper>
                    ) : (
                        <ButtonGroup>
                            <Button onClick={() => setShowPubKey(true)}>Show Read-only Id</Button>
                        </ButtonGroup>
                    )}
                    {showPrivKey ? (
                        <Paper sx={{py: 1}}>
                            <Stack spacing={1}>
                                <Typography>Your Read-write Id: <Key>{privKey}</Key></Typography>
                                <QRCodeSVG value={privKey}/>
                                <ButtonGroup>
                                    <Button onClick={() => setShowPrivKey(false)}>Hide Read-write Id</Button>
                                </ButtonGroup>
                            </Stack>
                        </Paper>
                    ) : (
                        <ButtonGroup>
                            <Button onClick={() => setShowPrivKey(true)}>Show Read-write Id</Button>
                        </ButtonGroup>
                    )}


                    <Box>
                        <ButtonGroup>
                            <Button onClick={() => logout().subscribe()}>Logout</Button>
                        </ButtonGroup>
                    </Box>
                </Stack>
            ) : null}

            {client.pubKey ? null : (
                <Stack spacing={2}>
                    <Box>
                        {error ? <Alert severity="error">Invalid key or password</Alert> : null}
                    </Box>

                    <QrTextField label="Your ID" value={privKey} id={'loginId'}
                                 onChange={ev => setPrivKey(ev.target.value as EncryptedPrivKey)}/>
                    <TextField label={"Password"} defaultValue={password.current} id={'password'}
                               onChange={ev => password.current = ev.target.value}/>
                    <ButtonGroup>
                        <Button onClick={doLogin}>Login</Button>
                        <Button onClick={generateKey}>Generate Key</Button>
                    </ButtonGroup>
                </Stack>
            )}
        </Container>

    )
}