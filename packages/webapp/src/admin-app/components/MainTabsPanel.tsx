import React, {PropsWithChildren, useEffect, useState} from "react";
import {Box, Drawer, IconButton} from "@mui/material";
import {useClient} from "@tvs/react";
import {Menu, ArrowBack} from '@mui/icons-material';
import {Link, useLocation, useNavigate} from "react-router-dom";

export const MainTabsPanel: React.FC = () => {
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
        <Box>
            <Box sx={{display: {xs: 'none', md: 'flex'}, flex: 1, gap: 5, fontSize: '16px'}}>
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
        </Box>
    );
};


const MenuOptions: React.FC = () => {
    const [client] = useClient();
    const loc = useLocation();
    const nav = useNavigate();

    useEffect(() => {
        !client?.pubKey && (loc.pathname !== '/admin/auth' && !loc.pathname.startsWith('/vote')) && nav('/admin/auth');
    }, [])


    return (
        <>
            <MenuOption to={'/admin/auth'}>Auth</MenuOption>
            <MenuOption to={'/admin/admin'} disabled={!client?.pubKey}>Admin</MenuOption>
            <MenuOption to={'/admin/key-makers'} disabled={!client?.pubKey}>KeyMakers</MenuOption>
            <MenuOption to={'/admin/voters'} disabled={!client?.pubKey}>Voters</MenuOption>
            <MenuOption to={'/admin/auditors'} disabled={!client.pubKey}>Auditors</MenuOption>
            <MenuOption to={'/admin/votes'} disabled={!client.pubKey}>Votes</MenuOption>
        </>
    );
};

const MenuOption: React.FC<PropsWithChildren<{ disabled?: boolean, to: string }>> = ({to, disabled, children}) => {
    return disabled ? (
        <Box style={{color: '#ccc', fontSize: '16px'}}>{children}</Box>
    ) : (
        <Link to={to} style={{color: 'white', textDecoration: 'none', fontSize: '16px'}}>{children}</Link>
    )
}