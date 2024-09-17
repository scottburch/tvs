import React, {useRef} from "react";
import {Box, Button, ButtonGroup, Container, Stack, TextField} from "@mui/material";
import {useRoles} from "../hooks/useRoles.js";
import {tap} from "rxjs";
import {EncryptedPrivKey, SerializedPubKey} from "@tvs/crypto";
import { DataGrid, GridColDef } from '@mui/x-data-grid';
import {useVoters} from "../hooks/useVoters.js";
import {Key} from "../../common/components/Key.jsx";

type CreatedVoter = {pubKey: SerializedPubKey, encPrivKey: EncryptedPrivKey, passwd: string}
type CreatedVoters = Record<SerializedPubKey, CreatedVoter>;

export const VoterPage: React.FC = () => {
    const createdVoters = useRef<CreatedVoters>({});

    return (
        <Container>
            <Stack spacing={2}>
                <AddVoter createdVoters={createdVoters.current}/>
                <VoterList createdVoters={createdVoters.current}/>
            </Stack>
        </Container>
    );
};

const VoterList: React.FC<{createdVoters: CreatedVoters}> = ({createdVoters}) => {
    const [voters] = useVoters();

    const rows = voters.map(({pubKey}) => ({
        id: pubKey,
        pubKey,
        encPrivKey: createdVoters[pubKey]?.encPrivKey,
        passwd: createdVoters[pubKey]?.passwd
    } satisfies CreatedVoter & {id: string} as CreatedVoter & {id: string}))

    return (
        <DataGrid
            rows={rows}
            columns={columns}
        />
    )
}

const AddVoter: React.FC<{createdVoters: CreatedVoters}> = ({createdVoters}) => {
    const passwd = useRef('12345');
    const [_, createVoter] = useVoters();
    const roles = useRoles();

    const doCreateVoter = () => {
        createVoter(passwd.current).pipe(
            tap(({pubKey, encPrivKey}) => createdVoters[pubKey] = {
                pubKey,
                encPrivKey,
                passwd: passwd.current
            }),
        ).subscribe()
    };

    return (
        <>
            <TextField defaultValue={passwd.current} onChange={ev => passwd.current = ev.target.value} label="Password" slotProps={{inputLabel: {shrink: true}}} />
            <ButtonGroup>
                <Button disabled={!roles.admin && !roles.keyMaker} onClick={doCreateVoter}>Add Voter</Button>
            </ButtonGroup>
        </>
    );
};

const columns: GridColDef<(CreatedVoter[])[number]>[] = [
    {
        field: 'pubKey',
        headerName: 'Public Key',
        flex: 1,
        renderCell: ({value}) => <pre>{value}</pre>,
        renderHeader: ({field}) => <b>{field}</b>
    },{
        field: 'encPrivKey',
        headerName: 'Enc Priv Key',
        flex: 1,
        editable: false,
        renderCell: ({value}) => <Key>{value}</Key>,
        renderHeader: ({field}) => <b>{field}</b>
    },{
        field: 'passwd',
        headerName: 'Password',
        width: 100,
        editable: false,
        renderCell: ({value}) => <Key>{value}</Key>,
        renderHeader: ({field}) => <b>{field}</b>
    }
];