import React, {useEffect, useState} from "react";
import {useParams} from "react-router";
import {useRaces} from "../../common/hooks/useRaces.js";
import {Race} from "@tvs/vote";
import {Vote} from "../components/Vote.jsx";
import {Box, Button, Container, Stack} from "@mui/material";
import {ArrowBack, ArrowForward} from '@mui/icons-material';
import {useLocation, useNavigate} from "react-router-dom";

export const VoteItemPage: React.FC = () => {
    const params = useParams<{ itemNo: string }>();
    const races = useRaces();
    const [race, setRace] = useState<Race>()
    const navigate = useNavigate();
    const location = useLocation();

    useEffect(() => {
        races.length && setRace(races[getItemNo()])
    }, [races.length, params])

    const getItemNo = () => parseInt(params.itemNo || '0');

    const back = () => {
        navigate(location.pathname.replace(/(.*)\/.*/, `$1/${getItemNo() - 1}`))
    };
    const next = () => {
        (getItemNo() < races.length - 1) && navigate(location.pathname.replace(/(.*)\/.*/, `$1/${getItemNo() + 1}`))
    };

    return (
        <Container>
            <Stack flexDirection={'row'}>
                <Box flex={1}/>
                <Stack spacing={2}>
                    <Stack flexDirection={'row'}>
                        <Button variant={'outlined'} disabled={getItemNo() === 0} onClick={back}><ArrowBack/></Button>
                        <Button variant={'outlined'} disabled={getItemNo() === races.length - 1}
                                onClick={next}><ArrowForward/></Button>
                    </Stack>
                    <Vote race={race?.name || ''} candidates={race?.candidates || []} voteDone={next}/>
                </Stack>
                <Box flex={1}/>
            </Stack>
        </Container>
    )
};

