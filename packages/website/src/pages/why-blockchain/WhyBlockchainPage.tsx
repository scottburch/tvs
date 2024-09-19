import React from "react";
import {Box, Container, Stack, Typography} from "@mui/material";
import blockchainImg from './blockchain.png'

export const WhyBlockchainPage: React.FC = () => {
    return (
        <Container sx={{pb: '4rem'}}>
            <Stack spacing={2}>
                <Typography variant={'h4'}>Why Blockchain?</Typography>
                <Typography variant={'body1'}>
                    Blockchain was designed to solve the problem of allowing people to store and update data in a
                    distributed system securely.
                    Traditional systems for storing value and data use centralized control as well as network and
                    physical security to prevent
                    theft or accidental loss or corruption of data.
                </Typography>
                <Typography>
                    This has worked well as long as the actors are honest, and don't make any mistakes.
                    Centralized systems have
                    proven to be unreliable as evidenced by the large number of failures to store or secure private
                    information and value.
                </Typography>
                <Typography>
                    Centralized systems are also not transparent.  This is a requirement for security, not a choice.
                    If you provide access to your central data store from the outside, you open up an avenue for attack.
                </Typography>
                <Typography>
                    Blockchains, on the other hand, have not suffered the same problems. They provide a high degree of
                    reliability and security while remaining open and transparent.  The tradeoff is speed.  Blockchains
                    are slower and less performant than centralized databases, and therefore, are not suited for the
                    same applications.
                </Typography>
                <Typography>
                    This is why a blockchain is the natual choice for a voting system, security and transparency.
                </Typography>
                <Box sx={{width: {xs: '90%', sm: '50%'}}}>
                    <img src={blockchainImg}/>
                </Box>


                <Typography variant={'h5'}>What are transactions and blocks?</Typography>
                <Typography>
                    A <b>transaction</b> is a list of instructions to the blockchain nodes on what data needs to be updated.
                    Before any transactions are processed, they are assembled into blocks.  A block can contain anywhere from
                    one to hundreds or thousands of transactions.
                </Typography>
                <Typography>
                    All nodes in the network are required to process the same transactions in the same order.
                    A blockchain network achieves this through a process known as <b>consensus</b>.
                </Typography>
                <Typography>
                    Consensus ensures that all nodes process the exact same transactions in exactly the same order, and
                    that the results are also identical.  Not all nodes on the network participate in consensus.
                    Even if a node does not participate in consensus, it will still processes the transactions in aa block
                    and ensure that it's state matches the rest of the network.
                </Typography>
                <Typography>
                    The two major types of consensus mechanisms are called <b>Proof-of-work</b> and <b>Proof-of-stake</b>.
                </Typography>
                <Typography>
                    The consensus used by TVS is <b>Proof-of-stake</b>.  Nodes that participate
                    in consensus are called <b>Validators</b>. Unlike in a normal blockchain, organizations that
                    run validators will be chosen by a centralized body.
                </Typography>
                <Typography>
                    This is to ensure integrity in the voting network.  Validators are a very important part of the system.
                    If anyone was allowed to run a validator, then the system could be flooded with consensus requests, which
                    could slow down the network and cause performance issues (known as a Denial of Service Attack).
                </Typography>
                <Typography>
                    Validators, while centrally authorized, should be distributed between organizations of various politics.
                    This would ensure that no "party" could have control of the network.  And, since anyone anyone can
                    run a node to verify the proper processing of transactions, any attempt to control the network would
                    be spotted by node operators.
                </Typography>

                <Typography variant={'h5'}>How do blockchains identify participants?</Typography>
                <Typography>
                    Blockchains identify participants by using encryption.  Each transaction on a blockchain requires a digital signature.
                    Everyone who transacts on the network has a digital key.  The key is broken up into two parts, a <b>private key</b>
                     and a <b>public key</b>.
                </Typography>
                <Typography>
                    These two keys are related to each other.  Any piece of data signed by the private key can be verified by the
                    public key.  This <b>key pair</b> identifies you on the system, since you are the only one who can
                    sign data with your private key.
                </Typography>


                <Typography variant={'h5'}>How do blockchains make sure the data is secure and valid?</Typography>
                <Typography>
                    While keys provide reliable identification, it does not explain how the stored data can be trusted.
                </Typography>
                <Typography>
                    The stored data can be trusted because <b>ALL</b> nodes in the network are running the same code to
                    process transactions.  All nodes on the network have the same set of rules.
                    When a transaction is placed on the network, all nodes run the updates and verify
                    with other nodes that the transaction is valid by comparing the results.
                </Typography>
                <Typography>
                    A node that gets out of sync with the other nodes in the network, will recognize it and shut down.
                    Since all transactions are stored on all of the nodes, there is always backup of the transactions.
                    If someone has a node that is corrupted and shuts down, they can simply rebuild that node from the
                    transactions stored on other nodes.
                </Typography>


                <Typography variant={'h5'}>
                    How do we know there is not a back-door or hidden cheat in the code?
                </Typography>
                <Typography>
                    This is another feature of using a blockchain.  Since blockchains do not rely on secrecy for security,
                    the code will be published and freely available.  Also, TVS is written in Typescript, which is a
                    language where the running code is human readable.  So, anyone can easily verify that the
                    code running on the node is the code that is published.
                </Typography>

                <Typography variant={'h5'}>
                    How do people keep their keys secure, doesn't all of this key stuff make it too hard to use for "normal" people?
                </Typography>
                <Typography>
                    The keys used by voters and other users of the system are encrypted using a password.
                    TVS uses the same encryption method used by the most popular password management applications
                    that people already use and rely on for security.
                </Typography>
                <Typography>
                    A key is simply a string of characters that, since it is encrypted, can be placed in an email or printed as a QR code.
                    For people who would not use computers, polling places would simply transmit your key to a voting
                    machine or place it on a USB or other storage device you can plug into the machine.
                </Typography>
                <Typography>
                    The way the system is designed, once a key has been used to vote in a race, it is not allowed to be
                    used to vote again in that race.
                </Typography>

            </Stack>
        </Container>
    )
}