/* eslint-disable camelcase */
import { resetAllWhenMocks, when } from "jest-when";
import { jesthelpers } from "../helpers.js";
import { URLSearchParams } from "url";
import { OAuthClient } from "../../src/core/OAuthClient.js";
import { InstanceConfig, Profile, TableConfig } from "../../src/core/ProfileManager.js";
import { Request, Response } from "../../src/core/Request.js";
import * as restclient from "../../src/core/RESTClient.js";
import { RESTClient, JSONRESTResponse, TableFieldData, TableParentData } from "../../src/core/RESTClient.js";
import { SNUpdateSetData, SNUpdateXMLData } from "../../src/core/sn.js";

describe("RESTClientSpec", () => {
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
        expires_in: 60
      }
    }
  };
  const profile: Profile = new Profile(config);
  const oauthClient: OAuthClient = new OAuthClient();

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const _makeRESTResponse = function<T = any>(data?: T | T[]): JSONRESTResponse<T> {
    const response: JSONRESTResponse<T> = {
      result: []
    };
    if (data != null) {
      if (Array.isArray(data)) {
        response.result = data;
        return response;
      }
      response.result.push(data);
    }
    return response;
  };

  beforeEach(() => {
    resetAllWhenMocks();
  });

  describe("loading config from user preference", () => {
    const tablePref: TableConfig = {
      tables: {
        "sys_script_include": {
          name: "sys_script_include",
          fields: {
            "script": {
              name: "script"
            }
          }
        }
      }
    };
  
    const url = {
      origin: config.baseUrl,
      pathname: restclient.PATH_API_TABLE_USER_PREFERENCE,
      search: expect.stringContaining(new URLSearchParams("sysparm_query=name=@hrax/now-eslint/table_config^userISEMPTY^ORuserDYNAMIC90d1921e5f510100a9ad2572f2b477fe^ORDERBYDESCuser").toString())
    };

    it("should succeed if exists", async() => {
      const requestExecuteSpy = jest.spyOn(Request, "execute");
      const response = Response.empty(JSON.stringify(_makeRESTResponse(tablePref)));

      jest.spyOn(response, "isEmpty").mockReturnValue(false);
      jest.spyOn(response, "isOK").mockReturnValue(true);

      when(requestExecuteSpy)
        .defaultImplementation(jesthelpers.defaultWhenImplementationThrow)
        .calledWith(expect.objectContaining(url), expect.anything(), undefined).mockResolvedValue(response);
  
      const client = new RESTClient(oauthClient);
      await expect(client.loadTableConfigurationPreference(profile)).resolves.toStrictEqual(tablePref);
    });

    it("should reject if does not exists", async() => {
      const requestExecuteSpy = jest.spyOn(Request, "execute");
      const response = Response.empty(JSON.stringify(_makeRESTResponse()));

      jest.spyOn(response, "isEmpty").mockReturnValue(false);
      jest.spyOn(response, "isOK").mockReturnValue(true);

      when(requestExecuteSpy)
        .defaultImplementation(jesthelpers.defaultWhenImplementationThrow)
        .calledWith(expect.objectContaining(url), expect.anything(), undefined).mockResolvedValue(response);
  
      const client = new RESTClient(oauthClient);
      await expect(client.loadTableConfigurationPreference(profile)).rejects.toEqual(restclient.NO_TABLE_CONFIG_PREF);
    });
  });

  describe("setting up table config", () => {
    const tpData: TableParentData[] = [
      {
        name: "sys_script_include",
        "super_class.name": ""
      },
      {
        name: "sys_script",
        "super_class.name": "sys_script_client"
      },
      {
        name: "sys_script_client",
        "super_class.name": ""
      },
      {
        name: "incident",
        "super_class.name": "task"
      }
    ];
    const tfData: TableFieldData[] = [
      {
        name: "sys_script_include",
        element: "script"
      },
      {
        name: "sys_script",
        element: "condition"
      },
      {
        name: "sys_script_client",
        element: "script"
      }
    ];
    const data: TableConfig = {
      tables: {
        "sys_script_include": {
          name: "sys_script_include",
          fields: {
            "script": {
              name: "script"
            }
          }
        },
        "sys_script": {
          name: "sys_script",
          parent: "sys_script_client",
          fields: {
            "condition": {
              name: "condition"
            },
            "script": {
              name: "script"
            }
          }
        },
        "sys_script_client": {
          name: "sys_script_client",
          fields: {
            "script": {
              name: "script"
            }
          }
        }
      }
    };

    const tpUrl = {
      origin: config.baseUrl,
      pathname: restclient.PATH_API_TABLE_DB_OBJECT
    };
    const tfUrl = {
      origin: config.baseUrl,
      pathname: restclient.PATH_API_TABLE_DICTIONARY
    };
    const upUrl = {
      origin: config.baseUrl,
      pathname: restclient.PATH_API_TABLE_USER_PREFERENCE
    };
    it("should load, prepare and save the config", async() => {
      const tpResponse = Response.empty(JSON.stringify(_makeRESTResponse(tpData)));
      jest.spyOn(tpResponse, "isEmpty").mockReturnValue(false);
      jest.spyOn(tpResponse, "isOK").mockReturnValue(true);

      const tfResponse = Response.empty(JSON.stringify(_makeRESTResponse(tfData)));
      jest.spyOn(tfResponse, "isEmpty").mockReturnValue(false);
      jest.spyOn(tfResponse, "isOK").mockReturnValue(true);

      const requestExecuteSpy = jest.spyOn(Request, "execute");
      when(requestExecuteSpy)
        .defaultImplementation(jesthelpers.defaultWhenImplementationThrow)
        // Pull table-parent
        .calledWith(expect.objectContaining(tpUrl), expect.anything(), undefined).mockResolvedValue(tpResponse)
        // Pull table-field
        .calledWith(expect.objectContaining(tfUrl), expect.anything(), undefined).mockResolvedValue(tfResponse)
        // Push preference
        .calledWith(expect.objectContaining(upUrl), expect.objectContaining({
          "method": "POST"
        }), expect.anything()).mockResolvedValue(tfResponse);
      const client = new RESTClient(oauthClient);
      
      await expect(client.setupTableConfiguration(profile)).resolves.toStrictEqual(data);
      // 2 pulls + 1 push
      // eslint-disable-next-line no-magic-numbers
      expect(requestExecuteSpy).toHaveBeenCalledTimes(3);
    });
  });

  describe("loading update set changes", () => {
    const responseBody: SNUpdateXMLData[] = [
      {
        action: "INSERT_OR_UPDATE",
        application: "global",
        name: "name1",
        payload: "",
        payloadHash: 0,
        sys_created_by: "admin",
        sys_created_on: "1970-01-01 00:00:00",
        sys_id: "-1",
        sys_mod_count: 2,
        sys_updated_by: "admin",
        sys_updated_on: "1970-01-02 00:00:00",
        target_name: "target1",
        type: "Script Include",
        update_set: "1"
      },
      {
        action: "INSERT_OR_UPDATE",
        application: "global",
        name: "name2",
        payload: "",
        payloadHash: 0,
        sys_created_by: "admin",
        sys_created_on: "1970-01-01 00:00:00",
        sys_id: "-2",
        sys_mod_count: 2,
        sys_updated_by: "admin",
        sys_updated_on: "1970-01-02 00:00:00",
        target_name: "target2",
        type: "Script Include",
        update_set: "2"
      }
    ];

    it("should load by update set ids", async() => {
      const url = {
        origin: profile.getBaseUrl(),
        pathname: restclient.PATH_API_TABLE_UPDATE_XML,
        search: expect.stringContaining(encodeURIComponent("update_setIN1,2,3"))
      };

      const response = Response.empty(JSON.stringify(_makeRESTResponse(responseBody)));
      jest.spyOn(response, "isEmpty").mockReturnValue(false);
      jest.spyOn(response, "isOK").mockReturnValue(true);

      const executeSpy = jest.spyOn(Request, "execute");
      when(executeSpy)
        // .defaultImplementation(jesthelpers.defaultWhenImplementationThrow)
        .expectCalledWith(expect.objectContaining(url), expect.anything(), undefined).mockResolvedValue(response);

      const client = new RESTClient(oauthClient);
      await expect(client.loadUpdateXMLByUpdateSetIds(profile, "1", "2", "3")).resolves.toStrictEqual(responseBody);
    });

    it("should load by update set query", async() => {
      const setResponseBody: SNUpdateSetData[] = [
        {
          sys_id: "1"
        },
        {
          sys_id: "2"
        }
      ];

      const setURL = {
        origin: profile.getBaseUrl(),
        pathname: restclient.PATH_API_TABLE_UPDATE_SET,
        search: expect.stringContaining(encodeURIComponent("sys_idIN1,2"))
      };
      const xmlURL = {
        origin: profile.getBaseUrl(),
        pathname: restclient.PATH_API_TABLE_UPDATE_XML,
        search: expect.stringContaining(encodeURIComponent("update_setIN1,2"))
      };

      const setResponse = Response.empty(JSON.stringify(_makeRESTResponse(setResponseBody)));
      jest.spyOn(setResponse, "isEmpty").mockReturnValue(false);
      jest.spyOn(setResponse, "isOK").mockReturnValue(true);

      const xmlResponse = Response.empty(JSON.stringify(_makeRESTResponse(responseBody)));
      jest.spyOn(xmlResponse, "isEmpty").mockReturnValue(false);
      jest.spyOn(xmlResponse, "isOK").mockReturnValue(true);

      const executeSpy = jest.spyOn(Request, "execute");
      when(executeSpy)
        .defaultImplementation(jesthelpers.defaultWhenImplementationThrow)
        .calledWith(expect.objectContaining(setURL), expect.anything(), undefined).mockResolvedValue(setResponse)
        .calledWith(expect.objectContaining(xmlURL), expect.anything(), undefined).mockResolvedValue(xmlResponse);

      const client = new RESTClient(oauthClient);
      await expect(client.loadUpdateXMLByUpdateSetQuery(profile, "sys_idIN1,2")).resolves.toStrictEqual(responseBody);
    });
  });
});