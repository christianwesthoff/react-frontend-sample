import React, { useState } from 'react';
import {
  AppBar,
  Button,
  Container,
  Drawer,
  IconButton,
  List,
  ListItem,
  ListItemText,
  Toolbar,
} from '@material-ui/core';
import { Menu as MenuIcon } from '@material-ui/icons';
import { Link as RouterLink, useHistory } from 'react-router-dom';
import { useMst } from '../../hooks';

const App = ({ children }: any) => {
  const { auth } = useMst();
  const history = useHistory();
  const [drawerVisible, setDrawerVisible] = useState(false);

  return (
    <>
      {auth.isLoggedIn() ? (
        <>
          <AppBar position="static">
            <Toolbar>
              <IconButton
                edge="start"
                color="inherit"
                onClick={() => {
                  setDrawerVisible(true);
                }}>
                <MenuIcon />
              </IconButton>
              <Button
                color="inherit"
                onClick={async () => {
                  await auth.logout();
                  history.push('/login');
                }}>
                Logout
              </Button>
            </Toolbar>
          </AppBar>
          <Drawer
            open={drawerVisible}
            onClose={() => {
              setDrawerVisible(false);
            }}>
            <div
              style={{ width: '250px' }}
              onClick={() => {
                setDrawerVisible(false);
              }}>
              <List>
                <ListItem button to="/subscribers" component={RouterLink}>
                  <ListItemText primary="Subscribers" />
                </ListItem>
                <ListItem button to="/fields" component={RouterLink}>
                  <ListItemText primary="Fields" />
                </ListItem>
              </List>
            </div>
          </Drawer>
        </>
      ) : null}
      <Container maxWidth="lg" style={{ padding: '20px 0' }}>
        {children}
      </Container>
    </>
  );
};

export default App;
