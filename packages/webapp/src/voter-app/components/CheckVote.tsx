import React, {useRef, useState} from "react";
import {Box, Button, MenuItem, Modal, Select, Typography} from "@mui/material";
import {useCheckVote} from "../hooks/useCheckVote.js";
import {useClient} from "@tvs/react";
import {tap} from "rxjs";
import {Vote} from "@tvs/vote";

export const CheckVote: React.FC<{ race: string}> = ({race}) => {
    const nodeUrl = useRef<string>(Object.values(orgs)[0]);
    const checkVote = useCheckVote();
    const [client] = useClient();
    const [checkVoteInfo, setCheckVoteInfo] = useState<Vote & {nodeUrl: string}>()

    const doCheckVote = () =>
        checkVote(nodeUrl.current, race, client.pubKey).pipe(
            tap(info => setCheckVoteInfo({...info, nodeUrl: nodeUrl.current})),
            tap(console.log)
        ).subscribe()

    return (
        <>
        <Box style={{display: 'flex', gap: 10, alignItems: 'center'}}>
            <Box>
                <Select defaultValue={Object.values(orgs)[0]} onChange={ev => nodeUrl.current = ev.target.value}>
                    {Object.entries(orgs).map(org => (
                        <MenuItem key={org[0]} value={org[1]}>{org[0]}</MenuItem>
                    ))}
                </Select>
            </Box>
            <Box>
                <Button variant={'contained'} onClick={doCheckVote}>Check</Button>
            </Box>
        </Box>
            <Modal open={!!checkVoteInfo}>
                <Box sx={modalStyle}>
                    <Typography sx={{overflow: 'auto'}}><pre>{JSON.stringify(checkVoteInfo, null, '    ')}</pre></Typography>
                    <Button onClick={() => setCheckVoteInfo(undefined)}>close</Button>
                </Box>
            </Modal>
        </>
    )
};

const orgs: Record<string, string> = {
    'gov.org':  `${window.location.origin}/api`,
    'right-wing.org':  `${window.location.origin}/api-1235`,
    'left-wing.org':  `${window.location.origin}/api-1236`,
    'other.org':  `${window.location.origin}/api-1237`
};

const modalStyle = {
    position: 'absolute' as 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    width: {xs: '95%', sm: 500},
    bgcolor: 'background.paper',
    border: '2px solid #000',
    boxShadow: 24,
    pt: 2,
    px: 4,
    pb: 3,
};