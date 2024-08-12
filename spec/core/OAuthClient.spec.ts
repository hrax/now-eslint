import { OAuthClient, OAuthCodeExpired, OAuthRefreshTokenExpired, OAuthUsernamePasswordIncorrect } from "../../src/core/OAuthClient";
import { InstanceConfig, InstanceOAuthTokenData, Profile } from "../../src/core/ProfileManager";
import { Request, Response } from "../../src/core/Request";
import { RequestOptions } from "https";
import { SNOAuthTokenData } from "../../src/core/sn";

describe("OAuthClientSpec", () => {
  const config: InstanceConfig = {
    name: "test",
    baseUrl: "https://example.com",
    auth: {
      type: "oauth-token",
      clientID: "clientID",
      clientSecret: "clientSecret",
      lastRetrieved: Date.now(),
      token: {
        access_token: "aaa",
        refresh_token: "bbb",
        scope: "",
        token_type: "Bearer",
        // seconds
        expires_in: 60
      }
    }
  };
  const profile: Profile = new Profile(config);

  describe("token validation", () => {
    it("should expire if token is null", () => {
      const token: InstanceOAuthTokenData = {
        clientID: "clientID",
        clientSecret: "clientSecret",
        lastRetrieved: 0
      };
  
      expect(OAuthClient.isTokenExpired(token)).toBeTruthy();
    });
    it("should expire", () => {
      const token: InstanceOAuthTokenData = {
        clientID: "clientID",
        clientSecret: "clientSecret",
        // current time -1 hour
        lastRetrieved: Date.now() - (60 * 60 * 1000),
        token: {
          access_token: "aaa",
          refresh_token: "bbb",
          scope: "",
          token_type: "Bearer",
          // seconds
          expires_in: 60
        }
      };

      expect(OAuthClient.isTokenExpired(token)).toBe(true);
    });
    it("should be valid", () => { 
      const tokenValid: InstanceOAuthTokenData = {
        clientID: "clientID",
        clientSecret: "clientSecret",
        // current time - 10 sec
        lastRetrieved: Date.now() - 10000,
        token: {
          access_token: "aaa",
          refresh_token: "bbb",
          scope: "",
          token_type: "Bearer",
          // seconds
          expires_in: 60
        }
      };

      expect(OAuthClient.isTokenExpired(tokenValid)).toBe(false);;
    });
  });

  describe("request token by username", () => {
    it("should resolve on 200", async () => {
      let response = Response.empty(JSON.stringify(config.auth.token!));
      jest.spyOn(response, "isOK").mockReturnValue(true);
      jest.spyOn(Request, "execute").mockResolvedValue(response);
      
      const client = new OAuthClient();
      await expect(client.requestTokenByUsername(profile, "admin", "admin")).resolves.toStrictEqual(config.auth.token!);
    });
  
    it("should reject on 401", async () => {
      let response = Response.empty(JSON.stringify({}));
      jest.spyOn(response, "isEmpty").mockReturnValue(false);  
      jest.spyOn(response, "isUnauthorized").mockReturnValue(true);  
      jest.spyOn(Request, "execute").mockRejectedValue(response);

      const client = new OAuthClient();
      await expect(client.requestTokenByUsername(profile, "admin", "admin")).rejects.toStrictEqual(new OAuthUsernamePasswordIncorrect(response.data));
    });
  });

  describe("request token by code", () => {
    const code = "1234";
    it("should resolve on 200", async () => {
      let response = Response.empty(JSON.stringify(config.auth.token!));
      jest.spyOn(response, "isOK").mockReturnValue(true);  
      jest.spyOn(Request, "execute").mockResolvedValue(response);

      const client = new OAuthClient();
      await expect(client.requestTokenByCode(profile, code)).resolves.toStrictEqual(config.auth.token!);
    });

    it("should reject on 401", async () => {
      let response = Response.empty("{}");
      jest.spyOn(response, "isEmpty").mockReturnValue(false);  
      jest.spyOn(response, "isUnauthorized").mockReturnValue(true);
      jest.spyOn(Request, "execute").mockRejectedValue(response);

      const client = new OAuthClient();
      await expect(client.requestTokenByCode(profile, code)).rejects.toStrictEqual(new OAuthCodeExpired(response.data));
    });
  });

  describe("refresh token", () => {
    it("should resolve on 200", async () => {
      let response = Response.empty(JSON.stringify(config.auth.token!));
      jest.spyOn(response, "isOK").mockReturnValue(true);
      jest.spyOn(Request, "execute").mockResolvedValue(response);
      const client = new OAuthClient();
      await expect(client.refreshToken(profile)).resolves.toStrictEqual(config.auth.token!);
    });

    it("should reject on 401", async () => {
      let response = Response.empty("{}");
      jest.spyOn(response, "isEmpty").mockReturnValue(false);  
      jest.spyOn(response, "isUnauthorized").mockReturnValue(true);
      jest.spyOn(Request, "execute").mockRejectedValue(response);
      const client = new OAuthClient();
      await expect(client.refreshToken(profile)).rejects.toStrictEqual(new OAuthRefreshTokenExpired(response.data));
    });
  });

  it("should extend headers with authentication", async() => {
    const token: SNOAuthTokenData = config.auth.token!;
    const options: RequestOptions = {
      method: "GET"
    };

    const client = new OAuthClient();
    await client.handleAuthentication(profile, options);

    expect(options.headers).not.toBeUndefined();
    expect(options.headers!.authorization).toBe(`${token.token_type} ${token.access_token}`);
  });
})