import React from 'react';
import { Button, Grid, Paper, Typography } from '@material-ui/core';
import { useMst } from '../../../../hooks';

const Login =() => {
  const { auth } = useMst();

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
          <Typography variant="subtitle1">Login to App to continue</Typography>
        </Grid>
        <Grid item>
          <Button
            variant="contained"
            color="primary"
            fullWidth
            onClick={() => {
              auth.login();
            }}>
            Login
          </Button>
        </Grid>
      </Grid>
    </Grid>
  );
};

export default Login;
