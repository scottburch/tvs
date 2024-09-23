import React, {useState} from 'react'
import {Box, Button, Container, List, ListItem, Stack, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Typography} from "@mui/material";
import {QRCodeSVG} from "qrcode.react";

export const TryTvsPage: React.FC = () => {
    return (
        <Container sx={{pb: 20}}>
            <Stack spacing={2}>
                <Typography variant={'h4'}>Try TVS</Typography>
                <Typography>
                    You can try TVS two different ways:
                </Typography>
                <Box>
                    <Typography sx={{fontWeight: 'bold'}}>Online demo</Typography>
                    <Typography variant={'body1'} sx={{pl: 2}}>
                        With the online demo, you can register a voter and cast a vote to get the basic voter experience.
                    </Typography>
                </Box>
                <Box>
                    <Typography sx={{fontWeight: 'bold'}}>Docker demo</Typography>
                    <Typography variant={'body1'} sx={{pl: 2}}>
                        With the docker demo, you have full control of TVS. You can do things like add keymakers, auditors and audit votes for the
                        full experience.
                    </Typography>
                </Box>

                <OnlineDemo/>
                <DockerDemo/>
            </Stack>
        </Container>
    )
}

const OnlineDemo: React.FC = () => (
    <Box>
        <Typography variant={'h5'}>Online Demo</Typography>
        <Box sx={{pl: 2}}>
            <Typography>
                The online demo is at <a href={'https://demo.tvsvote.org'}>https://demo.tvsvote.org</a>
            </Typography>
            <Typography>
                To add a voter go to <a href={'https://demo.tvsvote.org/utility-pages/create-voter/'}>https://demo.tvsvote.org/utility-pages/create-voter/</a>
            </Typography>
            <Typography>
                Once you have added a voter, you can use the provided QR code to vote from any device.
            </Typography>
        </Box>
    </Box>
)

const DockerDemo: React.FC = () => (
    <Stack spacing={2}>
        <Typography variant={'h5'}>Docker Demo</Typography>
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
                        <TableCell>QR Code (for mobile)</TableCell>
                    </TableRow>
                </TableHead>
                <TableBody>
                    <TableRow>
                        <TableCell>admin</TableCell>
                        <TableCell>
                            <pre>HGSfOgXUGTpmW/YPu0oQbvRaCsqovnE4nKcoKqt+YQM2UEcAwqGlX/vR4BSpH5A4</pre>
                        </TableCell>
                        <TableCell><QrCode value={'HGSfOgXUGTpmW/YPu0oQbvRaCsqovnE4nKcoKqt+YQM2UEcAwqGlX/vR4BSpH5A4'}/></TableCell>
                    </TableRow>
                    <TableRow>
                        <TableCell>Key Maker</TableCell>
                        <TableCell>
                            <pre>V8Ms9FgO5djpSVULsm1x9C3eyPhsWXc8h6eyNpiHJ1iSNk7FUOD9fbZF/Q13Bzvu</pre>
                        </TableCell>
                        <TableCell><QrCode value={'V8Ms9FgO5djpSVULsm1x9C3eyPhsWXc8h6eyNpiHJ1iSNk7FUOD9fbZF/Q13Bzvu'}/></TableCell>
                    </TableRow>
                    <TableRow>
                        <TableCell>Voter</TableCell>
                        <TableCell>
                            <pre>Ce8XAvLGmd8wS2enQdK1Mj0Y/CBt4MqxpDsccoYpOWTFAWIQRztkFlboFqdoVbgt</pre>
                        </TableCell>
                        <TableCell><QrCode value={'Ce8XAvLGmd8wS2enQdK1Mj0Y/CBt4MqxpDsccoYpOWTFAWIQRztkFlboFqdoVbgt'}/></TableCell>
                    </TableRow>
                    <TableRow>
                        <TableCell>Auditor</TableCell>
                        <TableCell>
                            <pre>341P5EtiWu6YmiBHCLFCZwL+yPYW+3YmZYX8WHJmkCfYQ1ITdohyEyDuH/gWLHZU</pre>
                        </TableCell>
                        <TableCell><QrCode value={'341P5EtiWu6YmiBHCLFCZwL+yPYW+3YmZYX8WHJmkCfYQ1ITdohyEyDuH/gWLHZU'}/></TableCell>
                    </TableRow>
                    <TableRow>
                        <TableCell>Vote Counter</TableCell>
                        <TableCell>
                            <pre>/lHJBv+JPLao0ZAtaHwcSFTzJT6Ib+xYl1TKGoPgfPnNy6nQO2qH8RaIAVxxDAtP</pre>
                        </TableCell>
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

        <List sx={{listStyleType: 'disc', listStylePosition: 'inside'}}>
            <ListItem sx={{display: 'list-item'}}>
                If you do not have it already, install docker. <a href={'https://docs.docker.com/engine/install'}>https://docs.docker.com/engine/install</a>
            </ListItem>
            <ListItem sx={{display: 'list-item'}}>
                Unpack the tvs-docker.tgz file
            </ListItem>
            <ListItem sx={{display: 'list-item'}}>
                In a terminal type: <Typography component={'code'}>docker compose build --build-arg ARCH=amd64</Typography>
                <Typography variant={'subtitle2'}>If you are on a ARM based system (like the Mac M series), replace "amd64" with "arm64"</Typography>
            </ListItem>
            <ListItem sx={{display: 'list-item'}}>
                When that completes (which might take a while), type: <Typography component={'code'}>docker compose up</Typography>
            </ListItem>
            <ListItem sx={{display: 'list-item'}}>
                Go to url: <a href={'http://localhost:1515'}>http://localhost:1515</a>
            </ListItem>
        </List>

        <Typography>You should now have a running TVS blockchain. Have fun!</Typography>

        <Typography variant={'h5'}>How to test from mobile platforms using Chrome/Brave</Typography>
        <Typography variant={'body1'}>
            Since TVS uses encryption, the application will not run in a non-secure context (http vs https).
            In order to connect to your computer from a mobile or tablet you must add your computers ip as
            a secure address.
        </Typography>
        <List sx={{listStyleType: 'disc', listStylePosition: 'inside'}}>
            <ListItem sx={{display: 'list-item'}}>
                Figure out what your ip address of your computer
            </ListItem>
            <ListItem sx={{display: 'list-item'}}>
                Open Chrome and go to <Typography component={'code'}>chrome://flags</Typography>
            </ListItem>
            <ListItem sx={{display: 'list-item'}}>
                Search for the flag "Insecure origins treated as secure"
            </ListItem>
            <ListItem sx={{display: 'list-item'}}>
                Enter <Typography component={'code'}>http://[your ip]:1515</Typography>
            </ListItem>
        </List>
    </Stack>
)

const QrCode: React.FC<{ value: string }> = ({value}) => {
    const [open, setOpen] = useState(false);

    return open ? (
        <Button onClick={() => setOpen(false)}>
            <QRCodeSVG value={value}/>
        </Button>
    ) : (
        <Button variant={'outlined'} onClick={() => setOpen(true)}>Show QR</Button>
    )
}