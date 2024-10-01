import React, {useRef} from "react";
import {Box, Button, MenuItem, Select} from "@mui/material";
import {useCheckVote} from "../hooks/useCheckVote.js";
import {useClient} from "@tvs/react";
import {tap} from "rxjs";

export const CheckVote: React.FC<{ race: string}> = ({race}) => {
    const value = useRef<string>(Object.keys(orgs)[0]);
    const checkVote = useCheckVote();
    const [client] = useClient();

    const doCheckVote = () =>
        checkVote(value.current, race, client.pubKey).pipe(
            tap(console.log)
        ).subscribe()

    return (
        <Box style={{display: 'flex', gap: 10, alignItems: 'center'}}>
            <Box>
                <Select defaultValue={Object.entries(orgs)[0][1]} onChange={ev => value.current = ev.target.value}>
                    {Object.entries(orgs).map(org => (
                        <MenuItem key={org[0]} value={org[1]}>{org[0]}</MenuItem>
                    ))}
                </Select>
            </Box>
            <Box>
                <Button variant={'contained'} onClick={doCheckVote}>Check</Button>
            </Box>
        </Box>
    )
};

const orgs: Record<string, string> = {
    'gov.org':  `${window.location.origin}/api`,
    'right-wing.org':  `${window.location.origin}/api-1235`,
    'left-wing.org':  `${window.location.origin}/api-1236`,
    'other.org':  `${window.location.origin}/api-1237`
}