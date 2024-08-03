import { RequestOptions } from "https";
import { Request, Response } from "../../modules/core/Request";
import { RESTClient, RESTResponse, TableAPI, TableFieldData, TableParentData } from "../../modules/core/RESTClient";
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

  const _makeRESTResponse = function<T = any>(data?: T | Array<T>): RESTResponse<T> {
    const response: RESTResponse<T> = {
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
      await expectAsync(client.getTableConfigurationPreference()).toBeResolvedTo(tablePref);
    });

    it("should reject if does not exists", async() => {
      const requestExecuteSpy = spyOn(Request, "execute");  
      const response = Response.empty(JSON.stringify(_makeRESTResponse()));

      spyOn(response, "isEmpty").and.returnValue(false);
      spyOn(response, "isOK").and.returnValue(true);

      requestExecuteSpy.withArgs(jasmine.objectContaining(url), jasmine.anything(), undefined).and.resolveTo(response);
  
      const client = new RESTClient(config);
      await expectAsync(client.getTableConfigurationPreference()).toBeRejectedWith(RESTClient.NO_TABLE_CONFIG_PREF);
    });
  });

  describe("loading table-parent data", () => {
    const data: Array<TableParentData> = [
      {
        name: "sys_script_include",
        "super_class.name": ""
      },
      {
        name: "incident",
        "super_class.name": "task"
      }
    ];

    const url = {
      origin: config.baseUrl,
      pathname: TableAPI.DB_OBJECT_PATH,
      search: jasmine.stringContaining(new URLSearchParams("sysparm_query=nameBETWEEN @varz^ORnameBETWEENvas@wfz^ORnameBETWEENwg@~^super_class.name!=sys_metadata^ORDERBYname").toString())
    };

    it("should resolve", async() => {
      const response = Response.empty(JSON.stringify(_makeRESTResponse(data)));
      spyOn(response, "isEmpty").and.returnValue(false);
      spyOn(response, "isOK").and.returnValue(true);

      spyOn(Request, "execute")
        .withArgs(jasmine.objectContaining(url), jasmine.anything(), undefined).and.resolveTo(response);

      const client = new RESTClient(config);
      await expectAsync(client.getTableParentData()).toBeResolvedTo(data);
    });
  });

  describe("loading table-field data", () => {
    const data: Array<TableFieldData> = [{
      name: "sys_script_include",
      element: "script"
    }];

    const url = {
      origin: config.baseUrl,
      pathname: TableAPI.DICTIONARY_PATH,
      search: jasmine.stringContaining(new URLSearchParams("sysparm_query=nameBETWEEN @varz^ORnameBETWEENvas@wfz^ORnameBETWEENwg@~^internal_type=script^ORinternal_type=script_plain^ORinternal_type=script_server^GROUPBYname^ORDERBYelement").toString())
    };

    it("should resolve", async() => {
      const response = Response.empty(JSON.stringify(_makeRESTResponse(data)));
      spyOn(response, "isEmpty").and.returnValue(false);
      spyOn(response, "isOK").and.returnValue(true);

      spyOn(Request, "execute")
        .withArgs(jasmine.objectContaining(url), jasmine.anything(), undefined).and.resolveTo(response);

      const client = new RESTClient(config);
      await expectAsync(client.getTableFieldData()).toBeResolvedTo(data);
    });
  });
});