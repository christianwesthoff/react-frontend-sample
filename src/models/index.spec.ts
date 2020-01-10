import * as mobxStateTree from 'mobx-state-tree';
import { Credentials, CredentialsInstance, AuthInstance, Auth } from './index';
import AuthService from '../services/Auth';
import { TokenResponse } from '@openid/appauth';

jest.mock('../services/Auth');

describe('RootStore', () => {
  describe('Auth', () => {
    let auth: AuthInstance;
    let authServiceMock: AuthService;
    let authInitialState = {
      credentials: {
        accessToken: 'accessToken',
        refreshToken: 'refreshToken',
      },
    };
    let authorizationResponseParams = {
      code: '1',
      verifier: '1',
    };

    beforeEach(() => {
      authServiceMock = new AuthService();

      jest
        .spyOn(authServiceMock, 'getAuthorizationResponse')
        .mockReturnValue(Promise.resolve(authorizationResponseParams));

      jest.spyOn(mobxStateTree, 'getEnv').mockReturnValue({
        authService: authServiceMock,
      });

      auth = Auth.create(authInitialState);
    });

    describe('Credentials', () => {
      let credentials: CredentialsInstance;

      beforeEach(() => {
        credentials = Credentials.create();
      });

      it('should create with default values.', () => {
        expect(credentials).toBeDefined();
        expect(credentials.accessToken).toEqual('');
        expect(credentials.refreshToken).toEqual('');
      });

      it('should reset credentials.', () => {
        credentials = Credentials.create({
          accessToken: 'accessToken',
          refreshToken: 'refreshToken',
        });

        credentials.reset();

        expect(credentials.accessToken).toEqual('');
        expect(credentials.refreshToken).toEqual('');
      });

      it('should set the refresh token', () => {
        const token = 'token';

        credentials.setRefreshToken(token);

        expect(credentials.refreshToken).toEqual(token);
      });

      it('should set the access token', () => {
        const token = 'token';

        credentials.setAccessToken(token);

        expect(credentials.accessToken).toEqual(token);
      });
    });

    it('should create', () => {
      expect(auth).toBeDefined();
      expect(auth.isLoggedIn()).toBeTruthy();
    });

    it('should make an authorization request on login', () => {
      jest
        .spyOn(authServiceMock, 'makeAuthorizationRequest')
        .mockReturnValue(null);

      auth.login();

      expect(authServiceMock.makeAuthorizationRequest).toHaveBeenCalledTimes(1);
    });

    it('should reset credentials', () => {
      jest.spyOn(auth.credentials, 'reset');

      auth.resetCredentials();

      expect(auth.credentials.reset).toHaveBeenCalledTimes(1);
    });

    it('should make a token revoke request on logout', async () => {
      jest.spyOn(auth.credentials, 'reset');
      jest
        .spyOn(authServiceMock, 'makeRevokeTokenRequest')
        .mockReturnValue(Promise.resolve(true));

      await auth.logout();

      expect(auth.credentials.reset).toHaveBeenCalledTimes(1);
      expect(authServiceMock.makeRevokeTokenRequest).toHaveBeenCalledWith(
        authInitialState.credentials.accessToken
      );
      expect(auth.isLoggedIn()).toBeFalsy();
    });

    it('should make a token request when getting credentials', async () => {
      const tokenResponse = {
        accessToken: 'newAccessToken',
        refreshToken: 'newRefreshToken',
      } as TokenResponse;

      jest
        .spyOn(authServiceMock, 'checkForAuthorizationResponse')
        .mockReturnValue(Promise.resolve());
      jest
        .spyOn(authServiceMock, 'makeTokenRequest')
        .mockReturnValue(Promise.resolve(tokenResponse));

      await auth.getCredentials();

      expect(
        authServiceMock.checkForAuthorizationResponse
      ).toHaveBeenCalledTimes(1);
      expect(authServiceMock.makeTokenRequest).toHaveBeenCalledWith(
        authorizationResponseParams.code,
        authorizationResponseParams.verifier
      );
      expect(auth.code).toEqual('');
      expect(auth.verifier).toEqual('');
      expect(auth.credentials.accessToken).toEqual(tokenResponse.accessToken);
      expect(auth.credentials.refreshToken).toEqual(tokenResponse.refreshToken);
      expect(auth.isLoggedIn()).toBeTruthy();
    });

    it('should make a token refresh request when refreshing credentials', async () => {
      const tokenResponse = {
        accessToken: 'newAccessToken',
        refreshToken: 'newRefreshToken',
      } as TokenResponse;

      jest
        .spyOn(authServiceMock, 'makeRefreshTokenRequest')
        .mockReturnValue(Promise.resolve(tokenResponse));

      await auth.refreshCredentials();

      expect(authServiceMock.makeRefreshTokenRequest).toHaveBeenCalledWith(
        authInitialState.credentials.refreshToken
      );
      expect(auth.credentials.accessToken).toEqual(tokenResponse.accessToken);
      expect(auth.credentials.refreshToken).toEqual(tokenResponse.refreshToken);
      expect(auth.isLoggedIn()).toBeTruthy();
    });
  });
});
