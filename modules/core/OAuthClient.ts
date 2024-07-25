import crypto from "crypto";
import { URL, URLSearchParams } from "url";
import { InstanceData } from "./InstanceManager";
import Request, { RESPONSE_STATUS } from "./Request";
import pkg from "../../package.json";
import { RequestOptions } from "https";

const CLIENT_BASE_URL: string = "/oauth_entity.do";
const CLIENT_LIST_BASE_URL: string = "/oauth_entity.do";
const AUTH_BASE_URL: string = "/oauth_auth.do";
const TOKEN_BASE_URL: string = "/oauth_token.do";

const REDIRECT_URI: string = "http://localhost:696969/oauth_client";

const TOKEN_CONTENT_TYPE: string = "application/x-www-form-urlencoded"

export type OAuthTokenResponse = {
  "access_token": string,
  "refresh_token": string,
  "scope": string,
  "token_type": string,
  "expires_in": number
};

export default class OAuthClient {
  #instance: InstanceData;

  // create Server?

  static generateRandomState(): string {
    return crypto.randomBytes(16).toString("hex");
  }

  constructor(instance: InstanceData) {
    this.#instance = instance;
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

    const url: URL = new URL(CLIENT_BASE_URL, this.#instance.base);
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
    const url: URL = new URL(CLIENT_LIST_BASE_URL, this.#instance.base);
    url.searchParams.set("sys_id", "-1");
    url.searchParams.set("sysparm_transaction_scope", "global");
    url.searchParams.set("sysparm_query", query.join("^"));
    return url.toString();
  }

  getAuthCodeURL(state: string): string {
    const url: URL = new URL(AUTH_BASE_URL, this.#instance.base);
    url.searchParams.set("response_type", "code");
    url.searchParams.set("redirect_uri", REDIRECT_URI);
    url.searchParams.set("client_id", this.#instance.auth.clientID);
    url.searchParams.set("state", state);
    return url.toString();
  }

  async requestTokenByCode(authCode: string): Promise<OAuthTokenResponse>  {
    const url: URL = new URL(TOKEN_BASE_URL, this.#instance.base);
    
    const body: URLSearchParams = new URLSearchParams();
    body.set("grant_type", "authorization_code");
    body.set("code", authCode);
    //body.set("redirect_uri", REDIRECT_URI);
    body.set("client_id", this.#instance.auth.clientID);
    body.set("client_secret", this.#instance.auth.clientSecret);

    const options: RequestOptions = {
      method: "POST",
      headers: {
        "content-type": TOKEN_CONTENT_TYPE,
        "content-length": Buffer.byteLength(body.toString())
      }
    };

    return await Request.json(url, options, body.toString());
  }

  async requestTokenByUsername(username: string, password: string): Promise<OAuthTokenResponse> {
    const url: URL = new URL(TOKEN_BASE_URL, this.#instance.base);

    const body: URLSearchParams = new URLSearchParams();
    body.set("grant_type", "password");
    body.set("username", username);
    body.set("password", password);
    body.set("client_id", this.#instance.auth.clientID);
    body.set("client_secret", this.#instance.auth.clientSecret);

    const options: RequestOptions = {
      method: "POST",
      headers: {
        "content-type": TOKEN_CONTENT_TYPE,
        "content-length": Buffer.byteLength(body.toString())
      }
    };

    return await Request.json(url, options, body.toString());
  }

  async refreshToken(): Promise<OAuthTokenResponse> {
    const url: URL = new URL(TOKEN_BASE_URL, this.#instance.base);
    
    const body: URLSearchParams = new URLSearchParams();
    body.set("grant_type", "refresh_token");
    body.set("refresh_token", this.#instance.auth.token?.refresh_token!);
    body.set("client_id", this.#instance.auth.clientID);
    body.set("client_secret", this.#instance.auth.clientSecret);

    const options: RequestOptions = {
      method: "POST",
      headers: {
        "content-type": TOKEN_CONTENT_TYPE,
        "content-length": Buffer.byteLength(body.toString())
      }
    };

    return await Request.json(url, options, body.toString());
  }
}