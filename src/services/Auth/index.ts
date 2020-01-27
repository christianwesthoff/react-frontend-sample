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
  BaseTokenRequestHandler,
  FetchRequestor,
  RevokeTokenRequest,
  GRANT_TYPE_REFRESH_TOKEN,
} from '@openid/appauth';


const GRANT_TYPE_PASSWORD = 'password';

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
    this.tokenHandler = new CustomTokenRequestHandler(new FetchRequestor());
    this.config = new AuthorizationServiceConfiguration({
      authorization_endpoint: `https://localhost:5001/connect/authorize`,
      token_endpoint: `https://localhost:5001/connect/token`,
      revocation_endpoint: `https://localhost:5001/connect/revocation `,
    });

    this.handler.setAuthorizationNotifier(this.notifier);
  }

  // makeAuthorizationRequest() {
  //   const request = new AuthorizationRequest({
  //     client_id: `${process.env.REACT_APP_CLIENT_ID}`,
  //     redirect_uri: `${process.env.REACT_APP_REDIRECT_URL}`,
  //     scope: '*',
  //     response_type: AuthorizationRequest.RESPONSE_TYPE_CODE,
  //     state: undefined,
  //     extras: {},
  //   });

  //   this.handler.performAuthorizationRequest(this.config, request);
  // }

  makeTokenRequest(userName: string, password: string, scope?: string) {
    if (!userName) {
      return Promise.reject(new Error('Missing userName'));
    }

    if (!password) {
      return Promise.reject(new Error('Missing password'));
    }

    const request = new TokenRequest({
      client_id: `resourceownerclient`,
      redirect_uri: ``,
      grant_type: GRANT_TYPE_PASSWORD,
      code: undefined,
      refresh_token: undefined,
      extras: Object.assign({}, { "username": userName }, { "password": password }, { "scope": "email openid dataEventRecords offline_access" }, { "client_secret": "dataEventRecordsSecret" }),
    });

    return this.tokenHandler.performTokenRequest(this.config, request);
  }

  makeRefreshTokenRequest(refreshToken: string) {
    const request = new TokenRequest({
      client_id: `resourceownerclient`,
      redirect_uri: ``,
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
