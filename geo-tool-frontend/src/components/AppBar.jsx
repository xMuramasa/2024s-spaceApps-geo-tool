import * as React from 'react';

import AppBar from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';

import logo from '../static/logo192.png';

function ElevationScroll(props) {
  const { children, window } = props;
  return children
    ? React.cloneElement(children, {
      elevation: window ? 4 : 0,
    })
    : null;
}

export default function RRAppBar(props) {
  return (
    <React.Fragment>

      <ElevationScroll {...props}>
        <AppBar>
          <Toolbar>
            <IconButton edge="start" color="inherit" aria-label="logo">
              <img src={logo} alt="App Logo" style={{ width: '60px', height: '60px', borderRadius: '50%', objectFit: 'cover' }} />
            </IconButton>

            <Typography variant="h4" component="div" m={2}>
              Geo Adverse
            </Typography>
          </Toolbar>
        </AppBar>
      </ElevationScroll>
      <Toolbar />

    </React.Fragment>
  )
}