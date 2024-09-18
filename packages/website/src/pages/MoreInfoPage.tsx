import React from "react";
import {Box, Container, Stack, Typography} from "@mui/material";
import {ItemWithTitle} from "../components/layout/ItemWithTitle.jsx";

export const MoreInfoPage: React.FC = () => (
    <Container sx={{pb: '5rem'}}>
        <Stack spacing={3}>
            <Stack spacing={2}>
                <Typography variant={'body1'} sx={{fontSize: '1.2rem', mb: '2rem'}}>
                    Current voting systems rely on physical security to ensure integrity of elections. However, distrust
                    in
                    these centralized systems is growing. This is no way to run an election. Distrust in the integrity
                    is
                    driving a lot of the division seen in societies around the world.
                </Typography>
                <Typography variant={'body1'} sx={{fontSize: '1.2rem'}}>
                    Blockchain has been regarded as too difficult to setup, run or operate in the past, for both the
                    administrators
                    and the end users. However, we have developed a new blockchain framework that makes it easy by
                    providing
                    the same interface users are familiar with already. With a simple name and password, or QR code and
                    password,
                    people can securely vote on the phone, computer or tablet. They can obviously vote by mail or in a
                    polling place
                    just as they do now as well.
                </Typography>
            </Stack>


            <ItemWithTitle title={'What makes this system different?'}>
                <Stack spacing={2}>
                    <Typography variant={'body1'} sx={{mb: '1.5'}}>
                        Voting will be conducted on a public blockchain. This means that votes are public and can be
                        verified by anyone.
                        There is even an option for people to vote through their favorite voting organization that
                        aligns with their political beliefs. This way, the accusation of cheating is minimized.
                    </Typography>
                    <Typography variant={'body1'}>
                        People can also go to different organizations and check their vote, to ensure that the
                        entire network has recorded their vote correctly.
                    </Typography>
                </Stack>
            </ItemWithTitle>

            <ItemWithTitle title={'What happens if there is a problem?'}>
                <Stack spacing={2}>
                    <Typography>
                        The system has built in ways to trace who issued keys to voters or vote counters so
                        investigations can
                        be carried out immediately. Automated systems could be built to raise alarms by voting
                        integrity
                        organizations.
                        They can even do some preliminary investigation themselves.
                    </Typography>
                    <Typography>
                        Of course, the system will not store names or identifying information. That will be the
                        responsibility
                        of a private database. This is only a companion to existing systems to provide transparent
                        voting.
                    </Typography>
                </Stack>
            </ItemWithTitle>
            <Typography variant={'h4'}>How does it work?</Typography>
            <Typography>
                The system is defined by some basic roles:
                <ul>
                    <li>Administrator</li>
                    <li>Key Maker</li>
                    <li>Voter</li>
                    <li>Vote counter</li>
                    <li>Auditor</li>
                </ul>
            </Typography>

            <Box>
                <Typography variant={'h5'}>Administrator</Typography>
                <Typography variant={'body1'}>
                    The administrator can create key makers and auditors. Nobody else in the system is allowed to do
                    this.
                </Typography>
            </Box>
            <Typography variant={'h5'}>Key Maker</Typography>
            <Typography variant={'body1'}>
                Key makers can create encrypted keys for voters and vote counters in the form of a string of
                characters
                and a password.
                The password provides an encryption layer to the actual key for security. If the voter or vote
                counter
                provides
                the password, then the key maker does not know what the key is, and can not use it.
            </Typography>
            <Typography>
                The encryption employed by the system is the same encryption methods used by the most popular
                password managers.
            </Typography>
        </Stack>
    </Container>
);
