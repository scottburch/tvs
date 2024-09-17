import React from "react";
import {Button, Stack} from "@mui/material";
import {useNavigate} from "react-router-dom";

export const MenuPage: React.FC = () => {
    const navigate = useNavigate();

    return (
        <Stack spacing={2}>
            <Button variant={'outlined'} onClick={() => navigate('/vote/item/0')}>vote</Button>
            <Button variant={'outlined'} onClick={() => navigate('/vote/my-votes')}>my votes</Button>
            <Button variant={'outlined'} onClick={() => navigate('/vote/results')}>vote results</Button>
        </Stack>
    )
}