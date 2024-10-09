import React, {useRef} from "react";
import {useKeyMakers} from "../hooks/useKeyMakers.js";
import {Box, Button, ButtonGroup, Container, Stack, TextField} from "@mui/material";
import {useRoles} from "../hooks/useRoles.js";
import {tap} from "rxjs";
import {EncryptedPrivKey, SerializedPubKey} from "@my-blockchain/crypto";
import { DataGrid, GridColDef } from '@mui/x-data-grid';
import {Key} from "../../common/components/Key.jsx";

type CreatedKeyMaker = {pubKey: SerializedPubKey, encPrivKey: EncryptedPrivKey, passwd: string}
type CreatedKeyMakers = Record<SerializedPubKey, CreatedKeyMaker>;

export const KeyMakerPage: React.FC = () => {
    const createdKeyMakers = useRef<CreatedKeyMakers>({});

    return (
        <Container>
            <Stack spacing={2}>
                <AddKeyMaker createdKeyMakers={createdKeyMakers.current}/>
                <KeyMakerList createdKeyMakers={createdKeyMakers.current}/>
            </Stack>
        </Container>
    );
};

const KeyMakerList: React.FC<{createdKeyMakers: CreatedKeyMakers}> = ({createdKeyMakers}) => {
    const [keyMakers] = useKeyMakers();

    const rows = keyMakers.map(({pubKey}) => ({
        id: pubKey,
        pubKey,
        encPrivKey: createdKeyMakers[pubKey]?.encPrivKey,
        passwd: createdKeyMakers[pubKey]?.passwd
    } satisfies CreatedKeyMaker & {id: string} as CreatedKeyMaker & {id: string}))

    return (
        <DataGrid
            rows={rows}
            columns={columns}
        />
    )
}

const AddKeyMaker: React.FC<{createdKeyMakers: CreatedKeyMakers}> = ({createdKeyMakers}) => {
    const passwd = useRef('12345');
    const [_, createKeyMaker] = useKeyMakers();
    const roles = useRoles();

    const doCreateKeyMaker = () => {
        createKeyMaker(passwd.current).pipe(
            tap(({pubKey, encPrivKey}) => createdKeyMakers[pubKey] = {
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
                <Button disabled={!roles.admin && !roles.keyMaker} onClick={doCreateKeyMaker}>Add Keymaker</Button>
            </ButtonGroup>
        </>
    );
};

const columns: GridColDef<(CreatedKeyMaker[])[number]>[] = [
    {
        field: 'pubKey',
        headerName: 'Read-only Key',
        flex: 1,
        renderCell: ({value}) => <Key>{value}</Key>,
        renderHeader: ({field}) => <b>{field}</b>
    },{
        field: 'encPrivKey',
        headerName: 'Read-write Key',
        flex: 1,
        editable: false,
        renderCell: ({value}) => <Key>{value}</Key>,
        renderHeader: ({field}) => <b>{field}</b>
    },{
        field: 'passwd',
        headerName: 'Password',
        width: 100,
        editable: false,
        renderCell: ({value}) =><Key>{value}</Key>
    }
];