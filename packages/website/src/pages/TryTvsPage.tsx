import React, {useState} from 'react'
import {
    Box,
    Button,
    Container,
    Stack,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Typography
} from "@mui/material";
import {QRCodeSVG} from "qrcode.react";

export const TryTvsPage: React.FC = () => {
    return (
        <Container>
            <Stack spacing={2}>
                <Typography variant={'h4'}>Try TVS</Typography>
                <Typography variant={'body1'}>
                    You can use docker to try TVS for yourself. This allows you to setup a clean system with some basic
                    setup.
                </Typography>

                <Typography variant={'h5'}>
                    Login IDs
                </Typography>
                <Typography variant={'overline'}>The password for all logins is "12345"</Typography>
                <TableContainer>
                    <Table>
                        <TableHead>
                            <TableRow>
                                <TableCell>Role</TableCell>
                                <TableCell>Login ID</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            <TableRow>
                                <TableCell>admin</TableCell>
                                <TableCell><pre>HGSfOgXUGTpmW/YPu0oQbvRaCsqovnE4nKcoKqt+YQM2UEcAwqGlX/vR4BSpH5A4</pre></TableCell>
                                <TableCell><QrCode value={'HGSfOgXUGTpmW/YPu0oQbvRaCsqovnE4nKcoKqt+YQM2UEcAwqGlX/vR4BSpH5A4'}/></TableCell>
                            </TableRow>
                            <TableRow>
                                <TableCell>Key Maker</TableCell>
                                <TableCell><pre>V8Ms9FgO5djpSVULsm1x9C3eyPhsWXc8h6eyNpiHJ1iSNk7FUOD9fbZF/Q13Bzvu</pre></TableCell>
                                <TableCell><QrCode value={'V8Ms9FgO5djpSVULsm1x9C3eyPhsWXc8h6eyNpiHJ1iSNk7FUOD9fbZF/Q13Bzvu'}/></TableCell>
                            </TableRow>
                            <TableRow>
                                <TableCell>Voter</TableCell>
                                <TableCell><pre>Ce8XAvLGmd8wS2enQdK1Mj0Y/CBt4MqxpDsccoYpOWTFAWIQRztkFlboFqdoVbgt</pre></TableCell>
                                <TableCell><QrCode value={'Ce8XAvLGmd8wS2enQdK1Mj0Y/CBt4MqxpDsccoYpOWTFAWIQRztkFlboFqdoVbgt'}/></TableCell>
                            </TableRow>
                            <TableRow>
                                <TableCell>Auditor</TableCell>
                                <TableCell><pre>341P5EtiWu6YmiBHCLFCZwL+yPYW+3YmZYX8WHJmkCfYQ1ITdohyEyDuH/gWLHZU</pre></TableCell>
                                <TableCell><QrCode value={'341P5EtiWu6YmiBHCLFCZwL+yPYW+3YmZYX8WHJmkCfYQ1ITdohyEyDuH/gWLHZU'}/></TableCell>
                            </TableRow>
                            <TableRow>
                                <TableCell>Vote Counter</TableCell>
                                <TableCell><pre>/lHJBv+JPLao0ZAtaHwcSFTzJT6Ib+xYl1TKGoPgfPnNy6nQO2qH8RaIAVxxDAtP</pre></TableCell>
                                <TableCell><QrCode value={'/lHJBv+JPLao0ZAtaHwcSFTzJT6Ib+xYl1TKGoPgfPnNy6nQO2qH8RaIAVxxDAtP'}/></TableCell>
                            </TableRow>
                        </TableBody>
                    </Table>
                </TableContainer>

                <Typography variant={'h5'}>
                    Get the docker compose and supporting files
                </Typography>
                <Typography><a href={`${location.origin}/tvs-docker.tgz`}>{location.origin}/tvs-docker.tgz</a></Typography>

                <Typography variant={'h5'}>
                    To run
                </Typography>
                <ul>
                    <li>If you do not have it already, install docker. <a href={'https://docs.docker.com/engine/install'}>https://docs.docker.com/engine/install</a> </li>
                    <li>Unpack the tvs-docker.tgz file</li>
                    <li>
                        In a terminal type: <code>docker compose build --build-arg ARCH=amd64</code>
                        <Typography variant={'subtitle1'}>If you are on a ARM based system (like the Mac M series), replace "amd64" with "arm64"</Typography>
                    </li>
                    <li>
                        When that completes (which might take a while), type: <code>docker compose up</code>
                    </li>
                </ul>
                <Typography>You should now have a running TVS blockchain.  Have fun!</Typography>
            </Stack>
        </Container>


    )
}

const QrCode: React.FC<{value: string}> = ({value}) => {
    const [open, setOpen] = useState(false);

    return open ? (
        <Button onClick={() => setOpen(false)}>
            <QRCodeSVG value={value} />
        </Button>
    ) : (
        <Button variant={'outlined'} onClick={() => setOpen(true)}>Show QR</Button>
    )
}