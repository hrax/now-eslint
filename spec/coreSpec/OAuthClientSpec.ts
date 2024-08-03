import exp from "constants";
import OAuthClient, { OAuthCodeExpired, OAuthRefreshTokenExpired, OAuthUsernamePasswordIncorrect } from "../../modules/core/OAuthClient";
import { Request, Response } from "../../modules/core/Request";
import { IncomingMessage } from "http";
import { Socket } from "net";

describe("OAuthClient", () => {
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

  describe("#isTokenExpired", () => {
    it("token expired if token null", () => {
      const token: InstanceOAuthTokenData = {
        clientID: "clientID",
        clientSecret: "clientSecret",
        lastRetrieved: 0
      };
  
      expect(OAuthClient.isTokenExpired(token)).toBeTrue();
    });
    it("token expired", () => {
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
    it("token valid", () => { 
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

  describe("#requestTokenByUsername", () => {
    it("success", async () => {
      let response = Response.empty(JSON.stringify(config.auth.token!));
      spyOn(response, "isOK").and.returnValue(true);  
      spyOn(Request, "execute").and.resolveTo(response);
      const client = new OAuthClient(config);
      await expectAsync(client.requestTokenByUsername("admin", "admin")).toBeResolvedTo(config.auth.token!);
    });
  
    it("unauthorized", async () => {
      let response = Response.empty(JSON.stringify({}));
      spyOn(response, "isEmpty").and.returnValue(false);  
      spyOn(response, "isUnauthorized").and.returnValue(true);  
      spyOn(Request, "execute").and.rejectWith(response);
      const client = new OAuthClient(config);
      await expectAsync(client.requestTokenByUsername("admin", "admin")).toBeRejectedWith(new OAuthUsernamePasswordIncorrect(response.data));
    });
  });

  describe("#requestTokenByCode", () => {
    const code = "1234";
    it("success", async () => {
      let response = Response.empty(JSON.stringify(config.auth.token!));
      spyOn(response, "isOK").and.returnValue(true);  
      spyOn(Request, "execute").and.resolveTo(response);
      const client = new OAuthClient(config);
      await expectAsync(client.requestTokenByCode(code)).toBeResolvedTo(config.auth.token!);
    });

    it("unauthorized", async () => {
      let response = Response.empty("{}");
      spyOn(response, "isEmpty").and.returnValue(false);  
      spyOn(response, "isUnauthorized").and.returnValue(true);
      spyOn(Request, "execute").and.rejectWith(response);
      const client = new OAuthClient(config);
      await expectAsync(client.requestTokenByCode(code)).toBeRejectedWith(new OAuthCodeExpired(response.data));
    });
  });

  describe("#refreshToken", () => {
    it("success", async () => {
      let response = Response.empty(JSON.stringify(config.auth.token!));
      spyOn(response, "isOK").and.returnValue(true);  
      spyOn(Request, "execute").and.resolveTo(response);
      const client = new OAuthClient(config);
      await expectAsync(client.refreshToken()).toBeResolvedTo(config.auth.token!);
    });

    it("unauthorized", async () => {
      let response = Response.empty("{}");
      spyOn(response, "isEmpty").and.returnValue(false);  
      spyOn(response, "isUnauthorized").and.returnValue(true);
      spyOn(Request, "execute").and.rejectWith(response);
      const client = new OAuthClient(config);
      await expectAsync(client.refreshToken()).toBeRejectedWith(new OAuthRefreshTokenExpired(response.data));
    });
  });
})