import React, {useEffect, useState} from "react";
import {AppBar, Box, Drawer, IconButton, Typography} from "@mui/material";
import {Link} from "react-router-dom";
import githubLogo from './github-mark-white.png'
import {ArrowBack, Menu} from "@mui/icons-material";

export const Header: React.FC = () => {
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

        <AppBar>
            <Box sx={{display: 'flex', height: '4rem', px: 2}}>
                <Typography sx={{flex: 1, fontSize: '2rem', lineHeight:'4rem'}}>
                    TVS <Box component={'span'} sx={{display: {xs: 'none', lg: 'inline'}}}> - Transparent Voting System (POC)</Box>
                </Typography>
                <Box sx={{display: {xs: 'none', lg: 'flex'}, flexDirection: 'row', gap: 3}}>
                    <Options/>
                </Box>
                <Box sx={{display: {lg: 'none'}}}>
                    <IconButton onClick={toggleDrawer}>
                        <Menu sx={{color: 'white', height: '50px'}}/>
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
                        <Options/>
                    </Box>
                </Drawer>

                <Box sx={{pl: 2}}>
                    <a href={'https://github.com/scottburch/tvs'} target={'_blank'}><img src={githubLogo} style={{height: '60%', position: 'relative', top: '20%'}}/></a>
                </Box>
            </Box>
        </AppBar>
    )
}

const Options: React.FC = () => (
    <>
        <Typography variant={'button'}><Link style={{lineHeight: '4rem', color: 'white', textDecoration: 'none'}} to={'/why-blockchain'}>why blockchain</Link></Typography>
        <Typography variant={'button'}><Link style={{lineHeight: '4rem', color: 'white', textDecoration: 'none'}} to={'/try-tvs'}>Try TVS</Link></Typography>
        <Typography variant={'button'}><Link style={{lineHeight: '4rem', color: 'white', textDecoration: 'none'}} to={'/more-info'}>more info</Link></Typography>
        <Typography variant={'button'}><Link style={{lineHeight: '4rem', color: 'white', textDecoration: 'none'}} to={'/'}>home</Link></Typography>
        <Typography variant={'button'}><Link style={{lineHeight: '4rem', color: 'white', textDecoration: 'none'}} to={'/contact-us'}>contact us</Link></Typography>
    </>
)