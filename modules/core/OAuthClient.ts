import crypto from "crypto";
import { URL, URLSearchParams } from "url";
import Request, { ResponseStatus, ResponseError, Response } from "./Request";
import pkg from "../../package.json";
import { RequestOptions } from "https";
import { IncomingMessage } from "http";
import { InstanceAuthenticationData, InstanceConfig, InstanceOAuthData, SNOAuthToken } from "../@types/instance-extended";

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

export default class OAuthClient {
  private instance: InstanceConfig;

  // create Server for code?

  static generateRandomState(): string {
    return crypto.randomBytes(16).toString("hex");
  }

  constructor(instance: InstanceConfig) {
    this.instance = instance;
  }

  private setToken(token: SNOAuthToken) {
    this.instance.auth.lastRetrieved = Date.now();
    this.instance.auth.token = token;
  }

  getInstanceConfig(): InstanceConfig {
    return this.instance;
  }

  getNewClientURL(): string {
    const query: Array<string> = [
      "type=client",
      `name=${pkg.name}`,
      `comments=OAuth Client for ${pkg.name} v${pkg.version}`,
      "refresh_token_lifespan=31536000",
      "redirect_url=" + REDIRECT_URI,
      "logo_url="
    ];

    const url: URL = new URL(CLIENT_BASE_URL, this.instance.baseUrl);
    url.searchParams.set("sys_id", "-1");
    url.searchParams.set("sysparm_transaction_scope", "global");
    url.searchParams.set("sysparm_query", query.join("^"));
    return url.toString();
  }

  getListClientURL(): string {
    const query: Array<string> = [
      "type=client",
      "name=" + pkg.name
    ];
    const url: URL = new URL(CLIENT_LIST_BASE_URL, this.instance.baseUrl);
    url.searchParams.set("sys_id", "-1");
    url.searchParams.set("sysparm_transaction_scope", "global");
    url.searchParams.set("sysparm_query", query.join("^"));
    return url.toString();
  }

  getAuthCodeURL(state: string): string {
    const url: URL = new URL(AUTH_BASE_URL, this.instance.baseUrl);
    url.searchParams.set("response_type", "code");
    url.searchParams.set("redirect_uri", REDIRECT_URI);
    url.searchParams.set("client_id", this.instance.auth.clientID);
    url.searchParams.set("state", state);
    return url.toString();
  }

  isTokenExpired(): boolean {
    const oauth: InstanceOAuthData = this.instance.auth;
    if (oauth.token == null) {
      return true;
    }
    const hadTokenFor = Date.now() - oauth.lastRetrieved + 10000;
    const expiresIn = oauth.token.expires_in * 1000;
    return hadTokenFor < expiresIn;
  }

  async requestTokenByCode(code: string): Promise<SNOAuthToken>  {
    const oauth: InstanceAuthenticationData = this.instance.auth;
    const url: URL = new URL(TOKEN_BASE_URL, this.instance.baseUrl);
    
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

    const token: SNOAuthToken = await Request.json<SNOAuthToken>(url, options, body.toString())
      .catch<SNOAuthToken>((reason: any) => {
        if (reason instanceof ResponseError) {
          const response: IncomingMessage | null = (<ResponseError>reason).response.http;
          if (response != null && response.statusCode == ResponseStatus.UNAUTHORIZED) {
            throw new OAuthCodeExpired(<any>reason);
          }
        }
        throw Error(reason);
      });
    
    this.setToken(token);
    return token;
  }

  async requestTokenByUsername(username: string, password: string): Promise<SNOAuthToken> {
    const oauth: InstanceAuthenticationData = this.instance.auth;
    const url: URL = new URL(TOKEN_BASE_URL, this.instance.baseUrl);

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

    const token: SNOAuthToken = await Request.json<SNOAuthToken>(url, options, body.toString())
      .catch<SNOAuthToken>((reason: any) => {
        if (reason instanceof ResponseError) {
          // 401: username/password incorrect
          const response: IncomingMessage | null = (<ResponseError>reason).response.http;
          if (response != null && response.statusCode == ResponseStatus.UNAUTHORIZED) {
            throw new OAuthUsernamePasswordIncorrect(<any>reason);
          }
        }
        throw Error(reason);
      });
    
    this.setToken(token);
    return token;
  }

  async refreshToken(): Promise<SNOAuthToken> {
    const oauth: InstanceAuthenticationData = this.instance.auth;
    const url: URL = new URL(TOKEN_BASE_URL, this.instance.baseUrl);
    
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

    const token: SNOAuthToken = await Request.json<SNOAuthToken>(url, options, body.toString())
      .catch<SNOAuthToken>((reason: any) => {
        if (reason instanceof ResponseError) {
          const response: Response = (<ResponseError>reason).response;
          if (Response.isUnauthorized(response)) {
            throw new OAuthRefreshTokenExpired(<any>reason);
          }
        }
        throw Error(reason);
      });
    
    this.setToken(token);
    return token;
  }
}