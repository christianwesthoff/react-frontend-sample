import React from 'react';
import { Redirect, Route, Switch, useRouteMatch } from 'react-router-dom';
import Login from './screens/Login';
import Callback from './screens/Callback';
import { useMst } from '../../hooks';

const Auth = () => {
  const { auth } = useMst();
  const { path } = useRouteMatch();

  return !auth.isLoggedIn() ? (
    <Switch>
      <Route exact path={path}>
        <Login />
      </Route>
      <Route path={`${path}/callback`}>
        <Callback />
      </Route>
    </Switch>
  ) : (
    <Redirect
      to={{
        pathname: '/subscribers',
      }}
    />
  );
};

export default Auth;
