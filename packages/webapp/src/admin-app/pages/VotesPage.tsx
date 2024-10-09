import React, {useEffect, useState} from "react";
import {useRaces} from "../../common/hooks/useRaces.js";
import {Box, Button, Container, FormControl, InputLabel, Modal, Select, Stack} from "@mui/material";
import {MenuItem} from "@mui/material";
import {raceDisplayName} from "../../common/utils/raceDisplayName.js";
import {flagVote, readVotesByRace, Vote} from "@tvs/vote";
import {useClient} from "@my-blockchain/react";
import {from, map, switchMap, tap, toArray} from "rxjs";
import {DataGrid, GridColDef} from "@mui/x-data-grid";
import {Key} from "../../common/components/Key.jsx";

export const VotesPage: React.FC = () => {
    const [client] = useClient();
    const races = useRaces();
    const [raceName, setRaceName] = useState('');
    const [votes, setVotes] = useState<(Vote & { id: string })[]>([]);
    const [invalidVoteModal, setInvalidVoteModal] = useState<Vote>()

    const doReadVotes = () => readVotesByRace(client, raceName).pipe(
        switchMap(votes => from(votes)),
        map((vote) => ({...vote, id: `${vote.race}-${vote.time}`})),
        toArray(),
        tap(votes => setVotes(votes))
    )

    useEffect(() => {
        raceName && doReadVotes().subscribe()
    }, [raceName]);

    const onInvalidateVote = () => {
        doReadVotes().pipe(
            tap(() => setInvalidVoteModal(undefined))
        ).subscribe();
    }

    return (
        <>
            <Container>
                <FormControl fullWidth>
                    <InputLabel id={'race-select-label'}>Race</InputLabel>
                    <Select id="race-select" labelId={'race-select-label'} label={'Race Name'} value={raceName}
                            onChange={ev => setRaceName(ev.target.value)}>
                        {races.map(race => <MenuItem key={race.name}
                                                     value={race.name}>{raceDisplayName(race.name)}</MenuItem>)}
                    </Select>
                </FormControl>
                <Box>
                    <DataGrid key={raceName} columns={getColumns()} checkboxSelection rows={votes}/>
                </Box>
            </Container>
            {invalidVoteModal ? <InvalidateModal vote={invalidVoteModal as Vote} onDone={onInvalidateVote}/> : null}
        </>
    );

    function getColumns(): GridColDef<(Vote[])[number]>[] {
        return [{
            field: 'voter',
            headerName: 'Voter',
            flex: 1,
            editable: false,
            renderCell: ({value}) => <Key>{value}</Key>,
            renderHeader: ({field}) => <b>{field}</b>
        }, {
            field: 'candidate',
            headerName: 'Candidate',
            flex: 1,
            editable: false,
            renderHeader: ({field}) => <b>{field}</b>
        }, {
            field: 'flags',
            headerName: 'Flags',
            editable: false,
            renderHeader: ({field}) => <b>{field}</b>,
            renderCell: ({value}) => (value as Vote['flags']).invalid ? 'invalid' : ''
        }, {
            field: '',
            renderCell: ({row}) => <Button variant={'outlined'} onClick={() => setInvalidVoteModal(row)}>Flag</Button>
        }]
    }
}

const InvalidateModal: React.FC<{ vote: Vote, onDone: () => void }> = ({onDone, vote}) => {
    const [reason, setReason] = useState('');
    const [client] = useClient();

    const doFlagVote = () => flagVote(client, {flag: 'invalid', value: true, reason, vote}).pipe(
        tap(() => onDone())
    ).subscribe();


    return (
        <Modal open={true}>
            <Box sx={modalStyle}>
                <Stack spacing={2}>
                    <FormControl fullWidth>
                        <InputLabel id={'invalid-select-label'}>Reason</InputLabel>
                        <Select id="reason-select" labelId={'invalid-select-label'} label={'Reason'} value={reason}
                                onChange={ev => setReason(ev.target.value)}>
                            <MenuItem value={'Invalid voter registration'}>Invalid Voter Registration</MenuItem>)
                        </Select>
                    </FormControl>
                    <Button variant={'outlined'} onClick={() => doFlagVote()}>Invalidate</Button>
                </Stack>
            </Box>
        </Modal>
    )
}

const modalStyle = {
    position: 'absolute' as 'absolute',
    top: '50%',
    left: '50%',
    width: '50%',
    transform: 'translate(-50%, -50%)',
    bgcolor: 'background.paper',
    border: '2px solid #000',
    boxShadow: 24,
    p: 4,
};


