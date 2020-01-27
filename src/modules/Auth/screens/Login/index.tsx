import React, { useState } from 'react';
import { Button, Grid, Paper, Typography, TextField } from '@material-ui/core';
import { useMst } from '../../../../hooks';

const Login =() => {
  const { auth } = useMst();
  const [state, setState] = useState({ email: '', password: '' })
  return (
    <Grid container alignItems="center" direction="column">
      <Grid
        container
        item
        xs={4}
        component={Paper}
        spacing={2}
        direction="column">
        <Grid item>
          <Typography variant="h6">Login</Typography>
        </Grid>
        <Grid item>
          <TextField
              autoFocus
              margin="dense"
              id="email"
              label="Email Address"
              type="email"
              onChange={(event) => setState(Object.assign(state, { email: event.target.value }))}
              fullWidth
            />
          <TextField
            autoFocus
            margin="dense"
            id="password"
            label="Password"
            type="password"
            onChange={(event) => setState(Object.assign(state, { password: event.target.value }))}
            fullWidth
          />
        </Grid>
        <Grid item>
          <Button
            variant="contained"
            color="primary"
            fullWidth
            onClick={() => {
              auth.getCredentials(state.email, state.password);
            }}>
            Login
          </Button>
        </Grid>
      </Grid>
    </Grid>
  );
};

export default Login;
