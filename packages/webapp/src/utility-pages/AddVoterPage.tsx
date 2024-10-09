import React, {useState} from "react";
import {Alert, Button, Container, Paper, Stack, Table, TableBody, TableCell, TableRow, Typography} from "@mui/material";
import {EncryptedPrivKey, encryptPrivKey, generateNewKeyPair, SerializedPrivKey, serializeKey} from "@my-blockchain/crypto";
import {combineLatest, of, switchMap, tap} from "rxjs";
import {addVoter} from "@tvs/vote";
import {newApiClient} from "@my-blockchain/blockchain";
import {QRCodeSVG} from "qrcode.react";
import {Link} from "react-router-dom";

type VoterDef = {
    login: EncryptedPrivKey
}

export const AddVoterPage: React.FC = () => {
    const [voter, setVoter] = useState<VoterDef>();
    const [creatingVoter, setCreatingVoter] = useState(false);

    const doAddVoter = () => {
        generateNewKeyPair().pipe(
            tap(() => setCreatingVoter(true)),
            switchMap(keys => combineLatest([
                newApiClient({url: `${window.location.origin}/api`, privKey: 'YuBn9GAKAQPHoiKya21gr6SK1i3060kNlO8+M6QUlUo=' as SerializedPrivKey}),
                serializeKey(keys.pubKey),
                serializeKey(keys.privKey).pipe(
                    switchMap(privKey => encryptPrivKey('12345', privKey))
                )])),
            switchMap(([keyMakerClient, voterPubKey, voterLogin]) =>
                of(undefined).pipe(
                    switchMap(() => addVoter(keyMakerClient, voterPubKey)),
                    tap(() => setVoter({
                        login: voterLogin
                    }))
                )
            ),
            tap(() => setCreatingVoter(false))
        ).subscribe()
    }

    return (
        <Container>
            <Stack spacing={4}>
                <Typography variant={'body1'}>
                    Here you can register a new voter to participate in a mock vote. Just press 'Add Voter'.
                </Typography>
                <Button variant={'contained'} onClick={doAddVoter}>Add Voter</Button>
                {creatingVoter ? (
                    <Alert severity={'info'}>Adding Voter...</Alert>
                ) : null}
                {!!voter ? (
                    <Paper>
                        <Table>
                            <TableBody>
                                <TableRow>
                                    <TableCell>Voter Login Id:</TableCell>
                                    <TableCell>{voter?.login}</TableCell>
                                </TableRow>
                                <TableRow>
                                    <TableCell>Voter Password:</TableCell>
                                    <TableCell>12345</TableCell>
                                </TableRow>
                                <TableRow>
                                    <TableCell>Voter QR Code</TableCell>
                                    <TableCell><QRCodeSVG value={voter?.login}/></TableCell>
                                </TableRow>
                                <TableRow>
                                    <TableCell>
                                        <Typography variant={'button'}>
                                            <Link to={'/vote'}>Go To Vote App</Link>
                                        </Typography>
                                    </TableCell>
                                </TableRow>
                            </TableBody>
                        </Table>
                    </Paper>
                ) : null}
            </Stack>

        </Container>
    )
}