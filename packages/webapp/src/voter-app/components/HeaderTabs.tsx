import React, {PropsWithChildren, useEffect, useState} from "react";
import {Box, Drawer, IconButton} from "@mui/material";
import {ArrowBack, Menu} from '@mui/icons-material';
import {Link} from "react-router-dom";
import {useClient} from "@my-blockchain/react";



export const HeaderTabs: React.FC = () => {
    const [drawerOpen, setDrawerOpen] = useState(false);

    useEffect(() => {
        const docClickHandler = () => setDrawerOpen(false);
        document.body.addEventListener('click', docClickHandler);
        return () => document.body.removeEventListener('click', docClickHandler);
    });

    const toggleDrawer = (ev: React.MouseEvent<HTMLButtonElement>) => {
        setDrawerOpen(!drawerOpen);
        ev.stopPropagation();
    }

    return (
        <>
            <Box sx={{display: {xs: 'none', md: 'flex'}, gap: 5, lineHeight: '40px'}} >
                <MenuOptions/>
            </Box>
            <Box sx={{display: {md: 'none'}, flex: 1}}>
                <IconButton onClick={toggleDrawer}>
                    <Menu sx={{color: 'white'}}/>
                </IconButton>
            </Box>
            <Drawer open={drawerOpen}>
                <Box sx={{
                    display: 'flex',
                    gap: 4,
                    fontSize: '20px',
                    flexDirection: 'column',
                    bgcolor: '#1876d2',
                    height: '100%',
                    padding: 3,
                    color: 'white',
                    minWidth: '200px'
                }}>
                    <ArrowBack/>
                    <MenuOptions/>
                </Box>
            </Drawer>
        </>
    );
};


const MenuOptions: React.FC = () => {
    const [client] = useClient();
    return (
        <>
            <MenuOption to={'/vote/menu'}>Main Menu</MenuOption>
        </>
    );
};


const MenuOption: React.FC<PropsWithChildren<{ disabled?: boolean, to: string }>> = ({to, disabled, children}) => {
    return disabled ? (
        <Box style={{color: '#ccc', fontSize: '16px'}}>{children}</Box>
    ) : (
        <Box><Link to={to} style={{color: 'white', textDecoration: 'none', fontSize: '16px'}}>{children}</Link></Box>
    )
}