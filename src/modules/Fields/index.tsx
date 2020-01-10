import React from 'react';
import { Route, Switch, useRouteMatch } from 'react-router-dom';
import List from './screens/List';
import Create from './screens/Create';
import Edit from './screens/Edit';

const Fields = () => {
  let { path } = useRouteMatch();

  return (
    <Switch>
      <Route exact path={path}>
        <List />
      </Route>
      <Route path={`${path}/create`}>
        <Create />
      </Route>
      <Route path={`${path}/:fieldId/edit`}>
        <Edit />
      </Route>
    </Switch>
  );
};

export default Fields;
