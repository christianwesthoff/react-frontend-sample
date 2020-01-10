import { Route, Redirect } from 'react-router-dom';
import React from 'react';
import { useMst } from '../../hooks';

const PrivateRoute = ({ children, ...rest }: any) => {
  const { auth } = useMst();

  return (
    <Route
      {...rest}
      render={() =>
        auth.isLoggedIn() ? (
          children
        ) : (
          <Redirect
            to={{
              pathname: '/login',
            }}
          />
        )
      }
    />
  );
};

export default PrivateRoute;
