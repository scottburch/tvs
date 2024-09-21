import React from "react";
import {AppBar, Box, Typography} from "@mui/material";
import {Link} from "react-router-dom";
import githubLogo from './github-mark-white.png'

export const Header: React.FC = () => {

    return (

        <AppBar>
            <Box sx={{display: 'flex', height: '4rem', px: 2}}>
                <Typography sx={{flex: 1, fontSize: '2rem', lineHeight:'4rem'}}>
                    TVS - Transparent Voting System (POC)
                </Typography>
                <Box sx={{display: 'flex', flexDirection: 'row', gap: 3}}>
                    <Typography variant={'button'}><Link style={{lineHeight: '4rem', color: 'white', textDecoration: 'none'}} to={'/why-blockchain'}>why blockchain</Link></Typography>
                    <Typography variant={'button'}><Link style={{lineHeight: '4rem', color: 'white', textDecoration: 'none'}} to={'/try-tvs'}>Try TVS</Link></Typography>
                    <Typography variant={'button'}><Link style={{lineHeight: '4rem', color: 'white', textDecoration: 'none'}} to={'/more-info'}>more info</Link></Typography>
                    <Typography variant={'button'}><Link style={{lineHeight: '4rem', color: 'white', textDecoration: 'none'}} to={'/'}>home</Link></Typography>
                    <Typography variant={'button'}><Link style={{lineHeight: '4rem', color: 'white', textDecoration: 'none'}} to={'/contact-us'}>contact us</Link></Typography>
                </Box>
                <Box sx={{pl: 2}}>
                    <a href={'https://github.com/scottburch/tvs'} target={'_blank'}><img src={githubLogo} style={{height: '60%', position: 'relative', top: '20%'}}/></a>
                </Box>
            </Box>
        </AppBar>
    )
}