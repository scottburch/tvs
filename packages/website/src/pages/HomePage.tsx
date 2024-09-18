import React from 'react'
import {Container} from "@mui/material";
import {Link} from "react-router-dom";
import {ItemWithTitle} from '../components/layout/ItemWithTitle.jsx'

export const HomePage: React.FC = () => {
    return (
        <Container>
            <ItemWithTitle title={'The problem?'}>Trust in elections are at an all time low.</ItemWithTitle>
            <ItemWithTitle title={'Why?'}>The voting system lacks transparency.</ItemWithTitle>
            <ItemWithTitle title={'Why?'}>It is plagued by ancient thinking.</ItemWithTitle>
            <ItemWithTitle title={'What can be done about it?'}>
                We can deploy the technologies that we already have and are using in very large systems that
                have earned enough trust to store trillions of dollars in value while providing transparency.
            </ItemWithTitle>
            <ItemWithTitle title={'What does that mean?'}>Blockchain</ItemWithTitle>
            <ItemWithTitle title={'Blockchain?'}>Yes, blockchain, what more needs to be said?</ItemWithTitle>
            <ItemWithTitle title={'A lot!'}>Ok, here is the <Link to={'/more-info'}>link to more</Link></ItemWithTitle>
        </Container>
    )
};

