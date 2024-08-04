import { RequestOptions } from "https";
import { URLSearchParams } from "url";
import { OAuthClient } from "./OAuthClient";
import { Request, Response } from "./Request";
import pkg from "../../package.json";

export enum RESPONSE_STATUS {
  OK = 200,
  NOT_FOUND = 400,
  UNAUTHORIZED = 401,
  FORBIDDEN = 403,
  ERROR = 500
};

export enum TableAPI {
  UPDATE_XML_PATH = "/api/now/table/sys_update_xml",
  UPDATE_SET_PATH = "/api/now/table/sys_update_set",
  DICTIONARY_PATH = "/api/now/table/sys_dictionary",
  DB_OBJECT_PATH = "/api/now/table/sys_db_object",
  USER_PREFERENCE_PATH = "/api/now/table/sys_user_preference"
}

export interface TableFieldData {
  name: string;
  element: string;
}

export interface TableParentData {
  name: string;
  "super_class.name": string;
}

export interface RESTResponse<T = any> {
  result: Array<T>
}

export class RESTClient {
  static readonly NO_TABLE_CONFIG_PREF = "No Table Config preference!";
  private instance: InstanceConfig;
  private oauthClient: OAuthClient;

  constructor(instance: InstanceConfig) {
    this.instance = instance;
    this.oauthClient = new OAuthClient(instance);
  }

  /**
   * 
   * @returns true if connection is succesfull; Rejects promise with an error message if connection fails
   */
  async testConnection(): Promise<boolean> {
    const url: URL = new URL(TableAPI.USER_PREFERENCE_PATH, this.instance.baseUrl);
    url.searchParams.set("sysparm_fields", "sys_id");
    url.searchParams.set("sysparm_limit", "1");
    url.searchParams.set("sysparm_no_count", "true");
    url.searchParams.set("sysparm_suppress_pagination_header", "true");

    const options: RequestOptions = {
      method: "GET",
      headers: {
        "content-type": "application/json",
        "accept": "application/json"
      }
    };

    await this.oauthClient.handleAuthentication(options);

    const response: Response = await Request.execute(url, options)
      .catch((reason: any) => {
        if (reason instanceof Response) {
          const response: Response = reason;
          if (!response.isEmpty() && response.isUnauthorized()) {
            return Promise.reject("Unauthorized");
          }
        }
        return Promise.reject(reason);
      });
    
    return Promise.resolve(!response.isEmpty() && response.isOK() && response.hasData());
  }

  

  /*requestUpdateXMLByUpdateSetQuery

  requestUpdateXMLByUpdateSetIds
  */
  
  async loadTableParentData(): Promise<Array<TableParentData>> {
    const url: URL = new URL(TableAPI.DB_OBJECT_PATH, this.instance.baseUrl);
    url.searchParams.set("sysparm_no_count", "true");
    url.searchParams.set("sysparm_suppress_pagination_header", "true");
    url.searchParams.set("sysparm_fields", "name,super_class.name");
    url.searchParams.set("sysparm_query", "nameBETWEEN @varz^ORnameBETWEENvas@wfz^ORnameBETWEENwg@~^super_class.name!=sys_metadata^ORDERBYname");

    const options: RequestOptions = {
      method: "GET",
      headers: {
        "content-type": "application/json",
        "accept": "application/json"
      }
    };

    await this.oauthClient.handleAuthentication(options);

    return (<RESTResponse<TableParentData>>await Request.json(url, options)).result;
  }

  /**
   * Load table field data
   * Skips tables whos name starts with wf_ or var_
   */
  async loadTableFieldData(): Promise<Array<TableFieldData>> {
    const url: URL = new URL(TableAPI.DICTIONARY_PATH, this.instance.baseUrl);
    url.searchParams.set("sysparm_no_count", "true");
    url.searchParams.set("sysparm_suppress_pagination_header", "true");
    url.searchParams.set("sysparm_fields", "name,element");
    url.searchParams.set("sysparm_query", "nameBETWEEN @varz^ORnameBETWEENvas@wfz^ORnameBETWEENwg@~^internal_type=script^ORinternal_type=script_plain^ORinternal_type=script_server^GROUPBYname^ORDERBYelement");

    const options: RequestOptions = {
      method: "GET",
      headers: {
        "content-type": "application/json",
        "accept": "application/json"
      }
    };

    await this.oauthClient.handleAuthentication(options);

    return (<RESTResponse<TableFieldData>>await Request.json(url, options)).result;
  }

  async loadTableConfigurationPreference(): Promise<TableConfig> {
    const prefName = `${pkg.name}/table_config`;
    const url: URL = new URL(TableAPI.USER_PREFERENCE_PATH, this.instance.baseUrl);
    url.searchParams.set("sysparm_no_count", "true");
    url.searchParams.set("sysparm_suppress_pagination_header", "true");
    url.searchParams.set("sysparm_limit", "2");
    url.searchParams.set("sysparm_fields", "name,value");
    url.searchParams.set("sysparm_query", `name=${prefName}^userISEMPTY^ORuserDYNAMIC90d1921e5f510100a9ad2572f2b477fe^ORDERBYDESCuser`);

    const options: RequestOptions = {
      method: "GET",
      headers: {
        "content-type": "application/json",
        "accept": "application/json"
      }
    };

    await this.oauthClient.handleAuthentication(options);

    const response: RESTResponse<TableConfig> = await Request.json(url, options);

    if (response.result.length === 0) {
      return Promise.reject(RESTClient.NO_TABLE_CONFIG_PREF);
    }

    // There should be always at least 1, since we are loading 2
    return response.result[0];
  }

  async saveTableConfigurationPreference(config: TableConfig): Promise<any> {
    const prefName = `${pkg.name}/table_config`;
    const url: URL = new URL(TableAPI.USER_PREFERENCE_PATH, this.instance.baseUrl);

    const options: RequestOptions = {
      method: "POST",
      headers: {
        "content-type": "application/json",
        "accept": "application/json"
      }
    };

    const body = {
      "name": prefName,
      "value": config
    }

    await this.oauthClient.handleAuthentication(options);

    await Request.execute(url, options, JSON.stringify(body));
  }

  async setupTableConfiguration(): Promise<TableConfig> {
    const config: TableConfig = {
      tables: {}
    }
    const getParentTree = (table: string, tables: {[ key: string]: TableParentData}, tree: Array<string>) => {
      if (tables[table] == null) {
        return tree;
      }
      const parent = tables[table]["super_class.name"];
      tree.push(parent);
      return getParentTree(parent, tables, tree);
    };

    // Load Table + Table Parent data
    const tables = (await this.loadTableParentData()).reduce((accumulator, value) => {
      accumulator[value.name] = value;
      return accumulator;
    }, <{[ key: string]: TableParentData}>{});
    // Load Table + Table field data
    const fields: Array<TableFieldData> = await this.loadTableFieldData();

    // Process all loaded fields
    fields.forEach((data) => {
      // If table has not been processed yet
      if (config.tables[data.name] == null) {
        config.tables[data.name] = {
          name: data.name,
          fields: {}
        }
      }
      config.tables[data.name].fields[data.element] = {
        name: data.element
      }
    });

    // For each configured table, find all its parents and merge fields
    Object.keys(config.tables).forEach((table) => {
      if (tables[table] != null && tables[table]["super_class.name"] !== "") {
        config.tables[table].parent = tables[table]["super_class.name"];
      }
      getParentTree(table, tables, []).forEach((parent) => {
        if (config.tables[parent] == null) {
          return;
        }
        config.tables[table].fields = Object.assign({}, config.tables[table].fields, config.tables[parent].fields);
      });
    })

    await this.saveTableConfigurationPreference(config);
    return config;
  }

  async getTableConfiguration(): Promise<TableConfig> {
    // Load table configuration from user preference
    let pref: TableConfig = await this.loadTableConfigurationPreference()
      .catch((async (reason) => {
        if (reason === RESTClient.NO_TABLE_CONFIG_PREF) {
          return await this.setupTableConfiguration();
        }
        return Promise.reject(reason);
      }));

    return pref;
  }

}