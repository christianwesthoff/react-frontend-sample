import {
  AuthorizationNotifier,
  AuthorizationRequest,
  AuthorizationServiceConfiguration,
  LocalStorageBackend,
  LocationLike,
  RedirectRequestHandler,
  BasicQueryStringUtils,
  StringMap,
  TokenRequest,
  GRANT_TYPE_AUTHORIZATION_CODE,
  BaseTokenRequestHandler,
  // FetchRequestor,
  TestRequestor,
  RevokeTokenRequest,
  GRANT_TYPE_REFRESH_TOKEN,
} from '@openid/appauth';

class StringUtils extends BasicQueryStringUtils {
  parse(input: LocationLike, useHash?: boolean): StringMap {
    return super.parse(input, false);
  }
}

class CustomTokenRequestHandler extends BaseTokenRequestHandler {
  performRevokeTokenRequest(
    configuration: AuthorizationServiceConfiguration,
    request: RevokeTokenRequest
  ): Promise<boolean> {
    return this.requestor
      .xhr<boolean>({
        url: configuration.revocationEndpoint,
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          Authorization: `Bearer ${request.token}`,
          Accept: 'application/json',
        },
        data: this.utils.stringify(request.toStringMap()),
      })
      .then(() => true)
      .catch(() => true);
  }
}

export default class Auth {
  notifier: AuthorizationNotifier;
  handler: RedirectRequestHandler;
  config: AuthorizationServiceConfiguration;
  tokenHandler: CustomTokenRequestHandler;

  constructor() {
    this.notifier = new AuthorizationNotifier();
    this.handler = new RedirectRequestHandler(
      new LocalStorageBackend(),
      new StringUtils()
    );
    this.tokenHandler = new CustomTokenRequestHandler(new TestRequestor(new Promise<any>((resolve, reject)  => { return resolve(0); } )));
    // this.tokenHandler = new CustomTokenRequestHandler(new FetchRequestor());
    this.config = new AuthorizationServiceConfiguration({
      authorization_endpoint: `${process.env.REACT_APP_OAUTH_AUTHORIZATION_ENDPOINT}`,
      token_endpoint: `${process.env.REACT_APP_OAUTH_TOKEN_ENDPOINT}`,
      revocation_endpoint: `${process.env.REACT_APP_OAUTH_REVOCATION_ENDPOINT}`,
    });

    this.handler.setAuthorizationNotifier(this.notifier);
  }

  makeAuthorizationRequest() {
    const request = new AuthorizationRequest({
      client_id: `${process.env.REACT_APP_CLIENT_ID}`,
      redirect_uri: `${process.env.REACT_APP_REDIRECT_URL}`,
      scope: '*',
      response_type: AuthorizationRequest.RESPONSE_TYPE_CODE,
      state: undefined,
      extras: {},
    });

    this.handler.performAuthorizationRequest(this.config, request);
  }

  makeTokenRequest(code: string, verifier?: string) {
    if (!code) {
      return Promise.reject(new Error('Missing code'));
    }

    const request = new TokenRequest({
      client_id: `${process.env.REACT_APP_CLIENT_ID}`,
      redirect_uri: `${process.env.REACT_APP_REDIRECT_URL}`,
      grant_type: GRANT_TYPE_AUTHORIZATION_CODE,
      code,
      refresh_token: undefined,
      extras: verifier ? { code_verifier: verifier } : {},
    });

    return this.tokenHandler.performTokenRequest(this.config, request);
  }

  makeRefreshTokenRequest(refreshToken: string) {
    const request = new TokenRequest({
      client_id: `${process.env.REACT_APP_CLIENT_ID}`,
      redirect_uri: `${process.env.REACT_APP_REDIRECT_URL}`,
      grant_type: GRANT_TYPE_REFRESH_TOKEN,
      code: undefined,
      refresh_token: refreshToken,
      extras: undefined,
    });

    return this.tokenHandler.performTokenRequest(this.config, request);
  }

  makeRevokeTokenRequest(token: string) {
    const request = new RevokeTokenRequest({
      token,
    });

    return this.tokenHandler.performRevokeTokenRequest(this.config, request);
  }

  checkForAuthorizationResponse() {
    return this.handler.completeAuthorizationRequestIfPossible();
  }

  getAuthorizationResponse() {
    return new Promise((resolve, reject) => {
      this.notifier.setAuthorizationListener((request, response, error) => {
        if (error) {
          reject(error);
        }

        if (response && response.code) {
          resolve({
            code: response.code,
            verifier: request?.internal?.code_verifier || '',
          });
        }

        reject(null);
      });
    });
  }
}
