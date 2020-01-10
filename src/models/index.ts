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
    code: types.optional(types.string, ''),
    verifier: types.optional(types.string, ''),
  })
  .actions(self => ({
    login() {
      getEnv(self).authService.makeAuthorizationRequest();
    },
    logout: flow(function*() {
      const res = yield getEnv(self).authService.makeRevokeTokenRequest(self.credentials.accessToken);
      self.credentials.reset();

      return res;
    }),
    getCredentials: flow(function*() {
      yield getEnv(self).authService.checkForAuthorizationResponse();

      const res = yield getEnv(self).authService.makeTokenRequest(self.code, self.verifier);

      self.code = '';
      self.verifier = '';
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
    afterCreate: flow(function*() {
      const res = yield getEnv(self).authService.getAuthorizationResponse();

      self.verifier = res.verifier;
      self.code = res.code;
    })
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
