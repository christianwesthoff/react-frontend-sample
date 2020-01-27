import { createContext } from 'react';
import { types, Instance, getEnv, flow } from 'mobx-state-tree';
import AuthService from '../services/Auth';

export const Credentials = types
  .model({
    accessToken: types.optional(types.string, ''),
    refreshToken: types.optional(types.string, ''),
  })
  .actions(self => ({
    setAccessToken(accessToken: string) {
      self.accessToken = accessToken;
    },
    setRefreshToken(refreshToken: string) {
      self.refreshToken = refreshToken;
    },
    reset() {
      self.accessToken = '';
      self.refreshToken = '';
    }
  }));

export const Auth = types
  .model({
    credentials: types.optional(Credentials, {}),
  })
  .actions(self => ({
    // login(userName: string, password: string) {
    //   getEnv(self).authService.makeAuthorizationRequest(userName, password);
    // },
    logout: flow(function*() {
      const res = yield getEnv(self).authService.makeRevokeTokenRequest(self.credentials.accessToken);
      self.credentials.reset();

      return res;
    }),
    getCredentials: flow(function*(userName: string, password: string) {
      yield getEnv(self).authService.checkForAuthorizationResponse();

      const res = yield getEnv(self).authService.makeTokenRequest(userName, password);

      // self.userName = '';
      // self.password = '';
      self.credentials.setAccessToken(res.accessToken);
      self.credentials.setRefreshToken(res.refreshToken);

      return res;
    }),
    refreshCredentials: flow(function*() {
      const res = yield getEnv(self).authService.makeRefreshTokenRequest(self.credentials.refreshToken);

      self.credentials.setAccessToken(res.accessToken);
      self.credentials.setRefreshToken(res.refreshToken);

      return res;
    }),
    resetCredentials() {
      self.credentials.reset();
    },
    // afterCreate: flow(function*() {
    //   const res = yield getEnv(self).authService.getAuthorizationResponse();

    //   self.userName = res.userName;
    //   self.password = res.password;
    // })
  }))
  .views(self => ({
    isLoggedIn() {
      return Boolean(self.credentials.accessToken) && Boolean(self.credentials.refreshToken);
    },
  }));

export const RootModel = types.model({
  auth: types.optional(Auth, {}),
});

export const rootStore = RootModel.create({}, {
  authService: new AuthService(),
});

export type RootInstance = Instance<typeof RootModel>;
export type CredentialsInstance = Instance<typeof Credentials>;
export type AuthInstance = Instance<typeof Auth>;

export const RootStoreContext = createContext<null | RootInstance>(null);
