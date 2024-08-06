import { InstanceConfig, TableConfig } from "../../core/Profile";
import { Request, Response } from "../../core/Request";
import { RESTClient, JSONRESTResponse, TableAPI, TableFieldData, TableParentData } from "../../core/RESTClient";
import { URLSearchParams } from "url";

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
      search: jasmine.stringContaining(new URLSearchParams("sysparm_query=name=@hrax/now-eslint/table_config^userISEMPTY^ORuserDYNAMIC90d1921e5f510100a9ad2572f2b477fe^ORDERBYDESCuser").toString())
    };

    it("should succeed if exists", async() => {
      const requestExecuteSpy = spyOn(Request, "execute");  
      const response = Response.empty(JSON.stringify(_makeRESTResponse(tablePref)));

      spyOn(response, "isEmpty").and.returnValue(false);
      spyOn(response, "isOK").and.returnValue(true);

      requestExecuteSpy.withArgs(jasmine.objectContaining(url), jasmine.anything(), undefined).and.resolveTo(response);
  
      const client = new RESTClient(config);
      await expectAsync(client.loadTableConfigurationPreference()).toBeResolvedTo(tablePref);
    });

    it("should reject if does not exists", async() => {
      const requestExecuteSpy = spyOn(Request, "execute");  
      const response = Response.empty(JSON.stringify(_makeRESTResponse()));

      spyOn(response, "isEmpty").and.returnValue(false);
      spyOn(response, "isOK").and.returnValue(true);

      requestExecuteSpy.withArgs(jasmine.objectContaining(url), jasmine.anything(), undefined).and.resolveTo(response);
  
      const client = new RESTClient(config);
      await expectAsync(client.loadTableConfigurationPreference()).toBeRejectedWith(RESTClient.NO_TABLE_CONFIG_PREF);
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
      spyOn(tpResponse, "isEmpty").and.returnValue(false);
      spyOn(tpResponse, "isOK").and.returnValue(true);

      const tfResponse = Response.empty(JSON.stringify(_makeRESTResponse(tfData)));
      spyOn(tfResponse, "isEmpty").and.returnValue(false);
      spyOn(tfResponse, "isOK").and.returnValue(true);

      const requestExecuteSpy = spyOn(Request, "execute")
        // pull table-parent
        .withArgs(jasmine.objectContaining(tpUrl), jasmine.anything(), undefined).and.resolveTo(tpResponse)
        // pull table-field
        .withArgs(jasmine.objectContaining(tfUrl), jasmine.anything(), undefined).and.resolveTo(tfResponse)
        // push preference
        .withArgs(jasmine.objectContaining(upUrl), jasmine.objectContaining({
          "method": "POST"
        }), jasmine.anything()).and.resolveTo(tfResponse);
      const client = new RESTClient(config);
      await expectAsync(client.setupTableConfiguration()).toBeResolvedTo(data);
      // 2 pulls + 1 push
      expect(requestExecuteSpy).toHaveBeenCalledTimes(3);
    });
  });
});