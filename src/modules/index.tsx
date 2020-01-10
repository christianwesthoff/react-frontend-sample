import React, { useEffect, useState } from 'react';
import {
  BrowserRouter as Router,
  Switch,
  Route,
  Redirect,
} from 'react-router-dom';
import Auth from './Auth';
import Subscribers from './Subscribers';
import Fields from './Fields';
import { SnackbarProvider } from 'notistack';
import { rootStore, RootStoreContext } from '../models';
import App from '../containers/App';
import PrivateRoute from '../containers/PrivateRoute';
import { persist } from 'mst-persist';

const Root = () => {
  const [bootstrapped, setBootstrapped] = useState(false);

  useEffect(() => {
    const hydrateStore = async () => {
      await persist('@appStoreKey', rootStore);
      setBootstrapped(true);
    };

    hydrateStore();
  }, []);

  return (
    <Router>
      <RootStoreContext.Provider value={rootStore}>
        {bootstrapped ? (
          <SnackbarProvider
            maxSnack={4}
            anchorOrigin={{
              vertical: 'bottom',
              horizontal: 'right',
            }}>
            <App>
              <Switch>
                <Route path="/login">
                  <Auth />
                </Route>
                <PrivateRoute path="/subscribers">
                  <Subscribers />
                </PrivateRoute>
                <PrivateRoute path="/fields">
                  <Fields />
                </PrivateRoute>
                <Route path="/">
                  <Redirect
                    to={{
                      pathname: '/subscribers',
                    }}
                  />
                </Route>
              </Switch>
            </App>
          </SnackbarProvider>
        ) : null}
      </RootStoreContext.Provider>
    </Router>
  );
};

export default Root;
