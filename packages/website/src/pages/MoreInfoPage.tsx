import React from "react";
import {Box, Container, Stack, Typography} from "@mui/material";
import {ItemWithTitle} from "../components/layout/ItemWithTitle.jsx";

export const MoreInfoPage: React.FC = () => (
    <Container sx={{pb: '5rem'}}>
        <Stack spacing={2}>
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
            </ItemWithTitle>

            <ItemWithTitle title={'What happens if there is a problem?'}>
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
            </ItemWithTitle>

            <Typography variant={'h4'}>How does it work?</Typography>
            <Box>
                The system is defined by some basic roles:
                <ul>
                    <li>Administrator</li>
                    <li>Key Maker</li>
                    <li>Voter</li>
                    <li>Vote counter</li>
                    <li>Auditor</li>
                </ul>
            </Box>

            <ItemWithTitle title={'Administrator'}>
                The administrator can create key makers and auditors. Nobody else in the system is allowed to do
                this.
            </ItemWithTitle>

            <ItemWithTitle title={'Key Maker'}>
                <Typography>
                    Key makers can create encrypted keys for voters and vote counters in the form of a string of
                    characters
                    and a password.
                    The password provides an encryption layer to the actual key for security. If the voter or vote
                    counter
                    provides
                    the password, then the key maker does not know what the key is, and can not use it.
                </Typography>
                <Typography>
                    When a keymaker creates a key for a voter or vote counter, their public id is recorded in a
                    table with the id of the voter or vote counter they created.  This is what provides
                    accountability in the system.  Again, no actual identifying information is stored here, only an
                    anonymous, automatically generated id.
                </Typography>
                <Typography>
                    The encryption employed by the system is the same encryption methods used by the most popular
                    password managers.
                </Typography>
            </ItemWithTitle>

            <ItemWithTitle title={'Voter'}>
                <Box>
                    While pretty self explanatory, a voter is defined by a key that is created by a key maker.
                    A voter can only use their key to vote once per race.
                </Box>
                <Box>
                    A voter can use their key and password to log into a separate voting app to vote or check on
                    the status of their vote.
                </Box>
            </ItemWithTitle>

            <ItemWithTitle title={'Vote Counter'}>
                A vote counter is exactly the same as a voter, except, they can register more than one vote
                for a race on behalf of a voter.
            </ItemWithTitle>

            <ItemWithTitle title={'Auditor'}>
                <Box>
                An auditor can change the current status of a vote.  For example, they can invalidate votes if
                a vote is found to be fraudulent.
                </Box>
                <Box>
                    Voters can use their keys to authenticate with the system and see the status of their vote.
                    It is even possible that they can register email or chat address to be notified if the
                    status of their vote changes.
                </Box>
                <Box>
                    This, of course, would add identifying information to a voter.  However, it is their choice
                    if they would want to do this.  If they do, they would be relying on the security of whoever
                    they provided their identifying information.
                </Box>
            </ItemWithTitle>
        </Stack>
    </Container>
);
