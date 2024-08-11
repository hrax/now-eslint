import { when } from "jest-when";
import { jesthelpers } from "../helpers.js";
import { URLSearchParams } from "url";
import { OAuthClient } from "../../core/OAuthClient.js";
import { InstanceConfig, Profile, TableConfig } from "../../core/ProfileManager.js";
import { Request, Response } from "../../core/Request.js";
import { RESTClient, JSONRESTResponse, TableAPI, TableFieldData, TableParentData } from "../../core/RESTClient.js";
import { SNUpdateXMLData } from "../../core/sn.js";

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
        // seconds
        expires_in: 60
      }
    }
  };
  const profile: Profile = new Profile(config);
  const oauthClient: OAuthClient = new OAuthClient();

  const _makeRESTResponse = function<T = any>(data?: T | Array<T>): JSONRESTResponse<T> {
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
  }

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
      pathname: TableAPI.USER_PREFERENCE_PATH,
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
      await expect(client.loadTableConfigurationPreference(profile)).rejects.toEqual(RESTClient.NO_TABLE_CONFIG_PREF);
    });
  });

  describe("setting up table config", () => {
    const tpData: Array<TableParentData> = [
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
    const tfData: Array<TableFieldData> = [{
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
    }];
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
    }

    const tpUrl = {
      origin: config.baseUrl,
      pathname: TableAPI.DB_OBJECT_PATH
    };
    const tfUrl = {
      origin: config.baseUrl,
      pathname: TableAPI.DICTIONARY_PATH
    };
    const upUrl = {
      origin: config.baseUrl,
      pathname: TableAPI.USER_PREFERENCE_PATH
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
        // pull table-parent
        .calledWith(expect.objectContaining(tpUrl), expect.anything(), undefined).mockResolvedValue(tpResponse)
        // pull table-field
        .calledWith(expect.objectContaining(tfUrl), expect.anything(), undefined).mockResolvedValue(tfResponse)
        // push preference
        .calledWith(expect.objectContaining(upUrl), expect.objectContaining({
          "method": "POST"
        }), expect.anything()).mockResolvedValue(tfResponse);
      const client = new RESTClient(oauthClient);
      
      await expect(client.setupTableConfiguration(profile)).resolves.toStrictEqual(data);
      // 2 pulls + 1 push
      expect(requestExecuteSpy).toHaveBeenCalledTimes(3);
    });
  });

  describe("loading update set changes", () => {
    it("should load by update set ids", async() => {
      const responseBody: Array<SNUpdateXMLData> = [
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
      const url = {
        origin: profile.getBaseUrl(),
        pathname: TableAPI.UPDATE_XML_PATH,
        search: expect.stringContaining(encodeURIComponent("update_setIN1,2,3"))
      };

      const response = Response.empty(JSON.stringify(_makeRESTResponse(responseBody)));
      jest.spyOn(response, "isEmpty").mockReturnValue(false);
      jest.spyOn(response, "isOK").mockReturnValue(true);

      const executeSpy = jest.spyOn(Request, "execute");
      when(executeSpy)
        .defaultImplementation(jesthelpers.defaultWhenImplementationThrow)
        .calledWith(expect.objectContaining(url), expect.anything(), undefined).mockResolvedValue(response);

      const client = new RESTClient(oauthClient);
      await expect(client.loadUpdateXMLByUpdateSetIds(profile, "1","2","3")).resolves.toStrictEqual(responseBody);
    });

    it.todo("should load by update set query");
  });
  
});