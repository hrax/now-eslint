import crypto from "crypto";
import { URL, URLSearchParams } from "url";
import { Request, Response } from "./Request.js";
import { RequestOptions } from "https";
import { Package } from "./Package.js";
import { SNOAuthToken } from "./sn.js";
import { InstanceAuthenticationData, InstanceConfig, InstanceOAuthTokenData } from "./ProfileManager.js";

const CLIENT_BASE_URL: string = "/oauth_entity.do";
const CLIENT_LIST_BASE_URL: string = "/oauth_entity_list.do";
const AUTH_BASE_URL: string = "/oauth_auth.do";
const TOKEN_BASE_URL: string = "/oauth_token.do";

// TODO: Allow to configure server port via ENV, just warn that it should be in redirects!
const REDIRECT_URI: string = "http://localhost:696969/oauth_client";

const TOKEN_CONTENT_TYPE: string = "application/x-www-form-urlencoded"

export class OAuthRefreshTokenExpired extends Error {
  constructor (message?: string, options?: ErrorOptions) {
    super(message, options);
  }
};
export class OAuthTokenExpired extends Error {
  constructor (message?: string, options?: ErrorOptions) {
    super(message, options);
  }
};
export class OAuthCodeExpired extends Error {
  constructor (message?: string, options?: ErrorOptions) {
    super(message, options);
  }
};
export class OAuthUsernamePasswordIncorrect extends Error {
  constructor (message?: string, options?: ErrorOptions) {
    super(message, options);
  }
};

export class OAuthClient {
  private config: InstanceConfig;

  // create Server for code?

  static generateRandomState(): string {
    return crypto.randomBytes(16).toString("hex");
  }

  static isTokenExpired(oauth: InstanceOAuthTokenData): boolean {
    if (oauth.token == null) {
      return true;
    }
    const hadTokenFor = Date.now() - oauth.lastRetrieved + 10000;
    const expiresIn = oauth.token.expires_in * 1000;
    return hadTokenFor > expiresIn;
  }

  constructor(config: InstanceConfig) {
    this.config = config;
  }

  private setToken(token: SNOAuthToken) {
    this.config.auth.lastRetrieved = Date.now();
    this.config.auth.token = token;
  }

  getInstanceConfig(): InstanceConfig {
    return this.config;
  }

  getNewClientURL(): URL {
    const query: Array<string> = [
      "type=client",
      `name=${Package.NAME}`,
      `comments=OAuth Client for ${Package.NAME} v${Package.VERSION}`,
      "refresh_token_lifespan=31536000",
      "redirect_url=" + REDIRECT_URI,
      "logo_url="
    ];

    const url: URL = new URL(CLIENT_BASE_URL, this.config.baseUrl);
    url.searchParams.set("sys_id", "-1");
    url.searchParams.set("sysparm_transaction_scope", "global");
    url.searchParams.set("sysparm_query", query.join("^"));
    return url;
  }

  getListClientURL(): URL {
    const query: Array<string> = [
      "type=client",
      "name=" + Package.NAME
    ];
    const url: URL = new URL(CLIENT_LIST_BASE_URL, this.config.baseUrl);
    url.searchParams.set("sys_id", "-1");
    url.searchParams.set("sysparm_transaction_scope", "global");
    url.searchParams.set("sysparm_query", query.join("^"));
    return url;
  }

  getAuthCodeURL(state?: string): URL {
    if (state == null) {
      state = OAuthClient.generateRandomState();
    }
    const url: URL = new URL(AUTH_BASE_URL, this.config.baseUrl);
    url.searchParams.set("response_type", "code");
    url.searchParams.set("redirect_uri", REDIRECT_URI);
    url.searchParams.set("client_id", this.config.auth.clientID);
    url.searchParams.set("state", state);
    return url;
  }

  async requestTokenByCode(code: string): Promise<SNOAuthToken>  {
    const oauth: InstanceAuthenticationData = this.config.auth;
    const url: URL = new URL(TOKEN_BASE_URL, this.config.baseUrl);
    
    const body: URLSearchParams = new URLSearchParams();
    body.set("grant_type", "authorization_code");
    body.set("code", code);
    //body.set("redirect_uri", REDIRECT_URI);
    body.set("client_id", oauth.clientID);
    body.set("client_secret", oauth.clientSecret);

    const options: RequestOptions = {
      method: "POST",
      headers: {
        "content-type": TOKEN_CONTENT_TYPE,
        "content-length": Buffer.byteLength(body.toString())
      }
    };

    const token: SNOAuthToken = await Request.json(url, options, body.toString())
      .catch((reason: any) => {
        if (reason instanceof Response) {
          const response: Response = reason;
          if (!response.isEmpty() && response.isUnauthorized()) {
            return Promise.reject(new OAuthCodeExpired(response.data));
          }
        }
        return Promise.reject(reason);
      });
    
    this.setToken(token);
    return token;
  }

  async requestTokenByUsername(username: string, password: string): Promise<SNOAuthToken> {
    const oauth: InstanceAuthenticationData = this.config.auth;
    const url: URL = new URL(TOKEN_BASE_URL, this.config.baseUrl);

    const body: URLSearchParams = new URLSearchParams();
    body.set("grant_type", "password");
    body.set("username", username);
    body.set("password", password);
    body.set("client_id", oauth.clientID);
    body.set("client_secret", oauth.clientSecret);

    const options: RequestOptions = {
      method: "POST",
      headers: {
        "content-type": TOKEN_CONTENT_TYPE,
        "content-length": Buffer.byteLength(body.toString())
      }
    };

    const token: SNOAuthToken = await Request.json(url, options, body.toString())
      .catch((reason: any) => {
        if (reason instanceof Response) {
          const response: Response = reason;
          if (!response.isEmpty() && response.isUnauthorized()) {
            return Promise.reject(new OAuthUsernamePasswordIncorrect(response.data));
          }
        }
        return Promise.reject(reason);
      });
    
    this.setToken(token);
    return token;
  }

  async refreshToken(): Promise<SNOAuthToken> {
    const oauth: InstanceAuthenticationData = this.config.auth;
    const url: URL = new URL(TOKEN_BASE_URL, this.config.baseUrl);
    
    const body: URLSearchParams = new URLSearchParams();
    body.set("grant_type", "refresh_token");
    body.set("refresh_token", oauth.token!.refresh_token);
    body.set("client_id", oauth.clientID);
    body.set("client_secret", oauth.clientSecret);

    const options: RequestOptions = {
      method: "POST",
      headers: {
        "content-type": TOKEN_CONTENT_TYPE,
        "content-length": Buffer.byteLength(body.toString())
      }
    };

    const token: SNOAuthToken = await Request.json(url, options, body.toString())
      .catch((reason: any) => {
        if (reason instanceof Response) {
          const response: Response = reason;
          if (!response.isEmpty() && response.isUnauthorized()) {
            return Promise.reject(new OAuthRefreshTokenExpired(response.data));
          }
        }
        return Promise.reject(reason);
      });
    
    this.setToken(token);
    return token;
  }

  async handleAuthentication(options: RequestOptions): Promise<void> {
    // If we do not have any token, leave it (for now)
    if (this.config.auth.token == null) {
      return;
    }

    if (OAuthClient.isTokenExpired(this.config.auth)) {
      await this.refreshToken();
    }
    if (options.headers == null) {
      options.headers = {};
    }
    options.headers.authorization = `${this.config.auth.token!.token_type} ${this.config.auth.token!.access_token}`;
  }
}