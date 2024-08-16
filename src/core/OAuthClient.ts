import crypto from "crypto";
import { URL, URLSearchParams } from "url";
import { Request, Response } from "./Request.js";
import { RequestOptions } from "https";
import { PACKAGE_NAME, PACKAGE_VERSION } from "./Package.js";
import { SNOAuthTokenData } from "./sn.js";
import { InstanceOAuthTokenData, Profile, ProfileManager } from "./ProfileManager.js";

const CLIENT_BASE_URL = "/oauth_entity.do" as const;
const CLIENT_LIST_BASE_URL = "/oauth_entity_list.do" as const;
const AUTH_BASE_URL = "/oauth_auth.do" as const;
const TOKEN_BASE_URL = "/oauth_token.do" as const;

// TODO: Allow to configure server port via ENV, just warn that it should be in redirects!
const REDIRECT_URI = "http://localhost:696969/oauth_client" as const;
const TOKEN_CONTENT_TYPE = "application/x-www-form-urlencoded" as const;

export class OAuthRefreshTokenExpired extends Error {};
export class OAuthTokenExpired extends Error {};
export class OAuthCodeExpired extends Error {};
export class OAuthUsernamePasswordIncorrect extends Error {};

const OAUTH_STATE_RND_BYTES = 16;
const HAD_TOKEN_FOR_MARGIN = 10000;
const SEC_IN_MS = 1000;
const NO_TOKEN = "#NOTOKEN";

export class OAuthClient {
  // TODO: Create Server for code?

  static generateRandomState(): string {
    return crypto.randomBytes(OAUTH_STATE_RND_BYTES).toString("hex");
  }

  static isTokenExpired(oauth: InstanceOAuthTokenData): boolean {
    if (oauth.token == null) {
      return true;
    }
    const hadTokenFor = Date.now() - oauth.lastRetrieved + HAD_TOKEN_FOR_MARGIN;
    const expiresIn = oauth.token.expires_in * SEC_IN_MS;
    return hadTokenFor > expiresIn;
  }

  getNewClientURL(profile: Profile): URL {
    const query = [
      "type=client",
      `name=${PACKAGE_NAME}`,
      `comments=OAuth Client for ${PACKAGE_NAME} v${PACKAGE_VERSION}`,
      "refresh_token_lifespan=31536000",
      "redirect_url=" + REDIRECT_URI,
      "logo_url="
    ];

    const url = new URL(CLIENT_BASE_URL, profile.getBaseUrl());
    url.searchParams.set("sys_id", "-1");
    url.searchParams.set("sysparm_transaction_scope", "global");
    url.searchParams.set("sysparm_query", query.join("^"));
    return url;
  }

  getListClientURL(profile: Profile): URL {
    const query: string[] = [
      "type=client",
      "name=" + PACKAGE_NAME
    ];
    const url = new URL(CLIENT_LIST_BASE_URL, profile.getBaseUrl());
    url.searchParams.set("sys_id", "-1");
    url.searchParams.set("sysparm_transaction_scope", "global");
    url.searchParams.set("sysparm_query", query.join("^"));
    return url;
  }

  getAuthCodeURL(profile: Profile, state?: string): URL {
    if (state == null) {
      state = OAuthClient.generateRandomState();
    }
    const url: URL = new URL(AUTH_BASE_URL, profile.getBaseUrl());
    url.searchParams.set("response_type", "code");
    url.searchParams.set("redirect_uri", REDIRECT_URI);
    url.searchParams.set("client_id", profile.getClientID());
    url.searchParams.set("state", state);
    return url;
  }

  async requestTokenByCode(profile: Profile, code: string): Promise<SNOAuthTokenData>  {
    const url = new URL(TOKEN_BASE_URL, profile.getBaseUrl());
    
    const body = new URLSearchParams();
    body.set("grant_type", "authorization_code");
    body.set("code", code);
    // FIXME: body.set("redirect_uri", REDIRECT_URI);
    body.set("client_id", profile.getClientID());
    body.set("client_secret", profile.getClientSecret());

    const options: RequestOptions = {
      method: "POST",
      headers: {
        "content-type": TOKEN_CONTENT_TYPE,
        "content-length": Buffer.byteLength(body.toString())
      }
    };

    const token = await Request.json(url, options, body.toString())
      .catch((reason: unknown) => {
        if (reason instanceof Response) {
          const response: Response = reason;
          if (!response.isEmpty() && response.isUnauthorized()) {
            return Promise.reject(new OAuthCodeExpired(response.data));
          }
        }
        return Promise.reject(reason);
      }) as SNOAuthTokenData;
    
    profile.refreshToken(token);
    return token;
  }

  async requestTokenByUsername(profile: Profile, username: string, password: string): Promise<SNOAuthTokenData> {
    const url = new URL(TOKEN_BASE_URL, profile.getBaseUrl());

    const body = new URLSearchParams();
    body.set("grant_type", "password");
    body.set("username", username);
    body.set("password", password);
    body.set("client_id", profile.getClientID());
    body.set("client_secret", profile.getClientSecret());

    const options: RequestOptions = {
      method: "POST",
      headers: {
        "content-type": TOKEN_CONTENT_TYPE,
        "content-length": Buffer.byteLength(body.toString())
      }
    };

    const token = await Request.json(url, options, body.toString())
      .catch((reason: unknown) => {
        if (reason instanceof Response) {
          const response: Response = reason;
          if (!response.isEmpty() && response.isUnauthorized()) {
            return Promise.reject(new OAuthUsernamePasswordIncorrect(response.data));
          }
        }
        return Promise.reject(reason);
      }) as SNOAuthTokenData;
    
    profile.refreshToken(token);
    return token;
  }

  async refreshToken(profile: Profile): Promise<SNOAuthTokenData> {
    const url = new URL(TOKEN_BASE_URL, profile.getBaseUrl());
    
    const body = new URLSearchParams();
    body.set("grant_type", "refresh_token");
    body.set("refresh_token", profile.getInstanceOAuthTokenData().token?.refresh_token ?? NO_TOKEN);
    body.set("client_id", profile.getClientID());
    body.set("client_secret", profile.getClientSecret());

    const options: RequestOptions = {
      method: "POST",
      headers: {
        "content-type": TOKEN_CONTENT_TYPE,
        "content-length": Buffer.byteLength(body.toString())
      }
    };

    const token = await Request.json(url, options, body.toString())
      .catch((reason: unknown) => {
        if (reason instanceof Response) {
          const response: Response = reason;
          if (!response.isEmpty() && response.isUnauthorized()) {
            return Promise.reject(new OAuthRefreshTokenExpired(response.data));
          }
        }
        return Promise.reject(reason);
      }) as SNOAuthTokenData;
    
    profile.refreshToken(token);
    return token;
  }

  async handleAuthentication(profile: Profile, options: RequestOptions): Promise<void> {
    // If we do not have any token, leave it (for now)
    if (profile.getInstanceOAuthTokenData().token == null) {
      return;
    }

    if (OAuthClient.isTokenExpired(profile.getInstanceOAuthTokenData())) {
      await this.refreshToken(profile);
      // Update profile file with new token
      ProfileManager.updateProfileConfig(profile);
    }
    if (options.headers == null) {
      options.headers = {};
    }
    options.headers.authorization = `${profile.getInstanceOAuthTokenData().token?.token_type} ${profile.getInstanceOAuthTokenData().token?.access_token}`;
  }
}