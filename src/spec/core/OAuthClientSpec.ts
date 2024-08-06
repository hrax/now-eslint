import { OAuthClient, OAuthCodeExpired, OAuthRefreshTokenExpired, OAuthUsernamePasswordIncorrect } from "../../core/OAuthClient";
import { InstanceConfig, InstanceOAuthTokenData } from "../../core/Profile";
import { Request, Response } from "../../core/Request";
import { RequestOptions } from "https";
import { SNOAuthToken } from "../../core/sn";

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

  describe("token validation", () => {
    it("should expire if token is null", () => {
      const token: InstanceOAuthTokenData = {
        clientID: "clientID",
        clientSecret: "clientSecret",
        lastRetrieved: 0
      };
  
      expect(OAuthClient.isTokenExpired(token)).toBeTrue();
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

      expect(OAuthClient.isTokenExpired(token)).toBeTrue();
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

      expect(OAuthClient.isTokenExpired(tokenValid)).toBeFalse();
    });
  });

  describe("request token by username", () => {
    it("should resolve on 200", async () => {
      let response = Response.empty(JSON.stringify(config.auth.token!));
      spyOn(response, "isOK").and.returnValue(true);  
      spyOn(Request, "execute").and.resolveTo(response);
      const client = new OAuthClient(config);
      await expectAsync(client.requestTokenByUsername("admin", "admin")).toBeResolvedTo(config.auth.token!);
    });
  
    it("should reject on 401", async () => {
      let response = Response.empty(JSON.stringify({}));
      spyOn(response, "isEmpty").and.returnValue(false);  
      spyOn(response, "isUnauthorized").and.returnValue(true);  
      spyOn(Request, "execute").and.rejectWith(response);
      const client = new OAuthClient(config);
      await expectAsync(client.requestTokenByUsername("admin", "admin")).toBeRejectedWith(new OAuthUsernamePasswordIncorrect(response.data));
    });
  });

  describe("request token by code", () => {
    const code = "1234";
    it("should resolve on 200", async () => {
      let response = Response.empty(JSON.stringify(config.auth.token!));
      spyOn(response, "isOK").and.returnValue(true);  
      spyOn(Request, "execute").and.resolveTo(response);
      const client = new OAuthClient(config);
      await expectAsync(client.requestTokenByCode(code)).toBeResolvedTo(config.auth.token!);
    });

    it("should reject on 401", async () => {
      let response = Response.empty("{}");
      spyOn(response, "isEmpty").and.returnValue(false);  
      spyOn(response, "isUnauthorized").and.returnValue(true);
      spyOn(Request, "execute").and.rejectWith(response);
      const client = new OAuthClient(config);
      await expectAsync(client.requestTokenByCode(code)).toBeRejectedWith(new OAuthCodeExpired(response.data));
    });
  });

  describe("refresh token", () => {
    it("should resolve on 200", async () => {
      let response = Response.empty(JSON.stringify(config.auth.token!));
      spyOn(response, "isOK").and.returnValue(true);
      spyOn(Request, "execute").and.resolveTo(response);
      const client = new OAuthClient(config);
      await expectAsync(client.refreshToken()).toBeResolvedTo(config.auth.token!);
    });

    it("should reject on 401", async () => {
      let response = Response.empty("{}");
      spyOn(response, "isEmpty").and.returnValue(false);  
      spyOn(response, "isUnauthorized").and.returnValue(true);
      spyOn(Request, "execute").and.rejectWith(response);
      const client = new OAuthClient(config);
      await expectAsync(client.refreshToken()).toBeRejectedWith(new OAuthRefreshTokenExpired(response.data));
    });
  });

  it("should extend headers with authentication", async() => {
    const token: SNOAuthToken = config.auth.token!;
    const options: RequestOptions = {
      method: "GET"
    };

    const client = new OAuthClient(config);
    await client.handleAuthentication(options);

    expect(options.headers).not.toBeUndefined();
    expect(options.headers!.authorization).toBe(`${token.token_type} ${token.access_token}`);
  });
})