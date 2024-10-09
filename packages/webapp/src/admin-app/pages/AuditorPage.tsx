import React, {useRef} from "react";
import {useAuditors} from "../hooks/useAuditors.js";
import {Button, ButtonGroup, Container, Stack, TextField} from "@mui/material";
import {useRoles} from "../hooks/useRoles.js";
import {tap} from "rxjs";
import {EncryptedPrivKey, SerializedPubKey} from "@my-blockchain/crypto";
import { DataGrid, GridColDef } from '@mui/x-data-grid';
import {Key} from "../../common/components/Key.jsx";

type CreatedAuditor = {pubKey: SerializedPubKey, encPrivKey: EncryptedPrivKey, passwd: string}
type CreatedAuditors = Record<SerializedPubKey, CreatedAuditor>;

export const AuditorPage: React.FC = () => {
    const createdAuditors = useRef<CreatedAuditors>({});

    return (
        <Container>
            <Stack spacing={2}>
                <AddAuditor createdAuditors={createdAuditors.current}/>
                <AuditorList createdAuditors={createdAuditors.current}/>
            </Stack>
        </Container>
    );
};

const AuditorList: React.FC<{createdAuditors: CreatedAuditors}> = ({createdAuditors}) => {
    const [auditors] = useAuditors();

    const rows = auditors.map(({pubKey}) => ({
        id: pubKey,
        pubKey,
        encPrivKey: createdAuditors[pubKey]?.encPrivKey,
        passwd: createdAuditors[pubKey]?.passwd
    } satisfies CreatedAuditor & {id: string} as CreatedAuditor & {id: string}))

    return (
        <DataGrid
            rows={rows}
            columns={columns}
        />
    )
}

const AddAuditor: React.FC<{createdAuditors: CreatedAuditors}> = ({createdAuditors}) => {
    const passwd = useRef('12345');
    const [_, createAuditor] = useAuditors();
    const roles = useRoles();

    const doCreateAuditor = () => {
        createAuditor(passwd.current).pipe(
            tap(({pubKey, encPrivKey}) => createdAuditors[pubKey] = {
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
                <Button disabled={!roles.admin && !roles.auditor} onClick={doCreateAuditor}>Add Auditor</Button>
            </ButtonGroup>
        </>
    );
};

const columns: GridColDef<(CreatedAuditor[])[number]>[] = [
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