import { RequestOptions } from "https";
import { OAuthClient } from "./OAuthClient.js";
import { Request, Response } from "./Request.js";
import { Package } from "./Package.js";
import { InstanceConfig, Profile, TableConfig } from "./ProfileManager.js";
import { SNUpdateSetData, SNUpdateXMLData } from "./sn.js";

export class RESPONSE_STATUS {
  static readonly OK = 200 as const;
  static readonly NOT_FOUND = 400 as const;
  static readonly UNAUTHORIZED = 401 as const;
  static readonly FORBIDDEN = 403 as const;
  static readonly ERROR = 500 as const;
};

export class TableAPI {
  static readonly UPDATE_XML_PATH = "/api/now/table/sys_update_xml" as const;
  static readonly UPDATE_SET_PATH = "/api/now/table/sys_update_set" as const;
  static readonly DICTIONARY_PATH = "/api/now/table/sys_dictionary" as const;
  static readonly DB_OBJECT_PATH = "/api/now/table/sys_db_object" as const;
  static readonly USER_PREFERENCE_PATH = "/api/now/table/sys_user_preference" as const;
}

export class RESTClient {
  static readonly NO_TABLE_CONFIG_PREF = "No Table Config preference!" as const;
  private oauthClient: OAuthClient;

  constructor(oauthClient: OAuthClient) {
    this.oauthClient = oauthClient;
  }

  /**
   * 
   * @returns true if connection is succesfull; Rejects promise with an error message if connection fails
   */
  async testConnection(profile: Profile): Promise<boolean> {
    const url: URL = new URL(TableAPI.USER_PREFERENCE_PATH, profile.getBaseUrl());
    url.searchParams.set("sysparm_limit", "1");
    url.searchParams.set("sysparm_no_count", "true");
    url.searchParams.set("sysparm_suppress_pagination_header", "true");
    // Do not load anything, just test if we can connect and load empty result
    url.searchParams.set("sysparm_query", "sys_id=-1");

    const options: RequestOptions = {
      method: "GET",
      headers: {
        "content-type": "application/json",
        "accept": "application/json"
      }
    };

    await this.oauthClient.handleAuthentication(profile, options);

    const response: Response = await Request.execute(url, options)
      .catch((reason: any) => {
        if (reason instanceof Response) {
          const response: Response = reason;
          if (!response.isEmpty() && response.isUnauthorized()) {
            return Promise.reject("Unauthorized");
          }
        }
        return Response.empty("");
      });
    
    return !response.isEmpty() && response.isOK() && response.hasData();
  }
  
  private async loadTableParentData(profile: Profile): Promise<Array<TableParentData>> {
    const url: URL = new URL(TableAPI.DB_OBJECT_PATH, profile.getBaseUrl());
    url.searchParams.set("sysparm_no_count", "true");
    url.searchParams.set("sysparm_suppress_pagination_header", "true");
    url.searchParams.set("sysparm_exclude_reference_link", "true");
    url.searchParams.set("sysparm_fields", "name,super_class.name");
    url.searchParams.set("sysparm_query", "nameBETWEEN @varz^ORnameBETWEENvas@wfz^ORnameBETWEENwg@~^super_class.name!=sys_metadata^ORDERBYname");

    const options: RequestOptions = {
      method: "GET",
      headers: {
        "content-type": "application/json",
        "accept": "application/json"
      }
    };

    await this.oauthClient.handleAuthentication(profile, options);

    return (<JSONRESTResponse<TableParentData>>await Request.json(url, options)).result;
  }

  /**
   * Load table field data
   * Skips tables whos name starts with wf_ or var_
   */
  private async loadTableFieldData(profile: Profile): Promise<Array<TableFieldData>> {
    const url: URL = new URL(TableAPI.DICTIONARY_PATH, profile.getBaseUrl());
    url.searchParams.set("sysparm_no_count", "true");
    url.searchParams.set("sysparm_suppress_pagination_header", "true");
    url.searchParams.set("sysparm_exclude_reference_link", "true");
    url.searchParams.set("sysparm_fields", "name,element");
    url.searchParams.set("sysparm_query", "nameBETWEEN @varz^ORnameBETWEENvas@wfz^ORnameBETWEENwg@~^internal_type=script^ORinternal_type=script_plain^ORinternal_type=script_server^GROUPBYname^ORDERBYelement");

    const options: RequestOptions = {
      method: "GET",
      headers: {
        "content-type": "application/json",
        "accept": "application/json"
      }
    };

    await this.oauthClient.handleAuthentication(profile, options);

    return (<JSONRESTResponse<TableFieldData>>await Request.json(url, options)).result;
  }

  async loadTableConfigurationPreference(profile: Profile): Promise<TableConfig> {
    const prefName = `${Package.NAME}/table_config`;
    const url: URL = new URL(TableAPI.USER_PREFERENCE_PATH, profile.getBaseUrl());
    url.searchParams.set("sysparm_no_count", "true");
    url.searchParams.set("sysparm_suppress_pagination_header", "true");
    url.searchParams.set("sysparm_exclude_reference_link", "true");
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

    await this.oauthClient.handleAuthentication(profile, options);

    const response: JSONRESTResponse<TableConfig> = await Request.json(url, options);

    if (response.result.length === 0) {
      return Promise.reject(RESTClient.NO_TABLE_CONFIG_PREF);
    }

    // There should be always at least 1, since we are loading 2
    return response.result[0];
  }

  private async saveTableConfigurationPreference(profile: Profile, config: TableConfig): Promise<void> {
    const prefName = `${Package.NAME}/table_config`;
    const url: URL = new URL(TableAPI.USER_PREFERENCE_PATH, profile.getBaseUrl());

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

    await this.oauthClient.handleAuthentication(profile, options);

    await Request.execute(url, options, JSON.stringify(body));
  }

  async setupTableConfiguration(profile: Profile): Promise<TableConfig> {
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
    const tables = (await this.loadTableParentData(profile)).reduce((accumulator, value) => {
      accumulator[value.name] = value;
      return accumulator;
    }, <{[ key: string]: TableParentData}>{});
    // Load Table + Table field data
    const fields: Array<TableFieldData> = await this.loadTableFieldData(profile);

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

    // remove wf_workflow configuration
    delete config.tables["wf_workflow"];
    await this.saveTableConfigurationPreference(profile, config);
    return config;
  }

  async getTableConfiguration(profile: Profile): Promise<TableConfig> {
    // Load table configuration from user preference
    let pref: TableConfig = await this.loadTableConfigurationPreference(profile)
      .catch((async (reason) => {
        if (reason === RESTClient.NO_TABLE_CONFIG_PREF) {
          return await this.setupTableConfiguration(profile);
        }
        return Promise.reject(reason);
      }));

    return pref;
  }

  async loadUpdateXMLByUpdateSetIds(profile: Profile, ...ids: string[]): Promise<Array<SNUpdateXMLData>> {
    if (ids.length === 0) {
      ids.push("-1");
    }

    const url: URL = new URL(TableAPI.UPDATE_XML_PATH, profile.getBaseUrl());
    url.searchParams.set("sysparm_no_count", "true");
    url.searchParams.set("sysparm_suppress_pagination_header", "true");
    url.searchParams.set("sysparm_exclude_reference_link", "true");
    url.searchParams.set("sysparm_fields", "name,sys_id,action,sys_created_by,sys_created_on,sys_updated_by,sys_updated_on,type,target_name,update_set,payload");
    url.searchParams.set("sysparm_query", `ORDERBYDESCsys_updated_on^GROUPBYname^update_setIN${ids.join(",")}`);

    const options: RequestOptions = {
      method: "GET",
      headers: {
        "content-type": "application/json",
        "accept": "application/json"
      }
    };

    await this.oauthClient.handleAuthentication(profile, options);

    return (<JSONRESTResponse<SNUpdateXMLData>> await Request.json(url, options)).result;
  }

  async loadUpdateXMLByUpdateSetQuery(profile: Profile, query: string): Promise<Array<SNUpdateXMLData>> {
    if (query == null || query === "") {
      query = "sys_id=-1";
    }

    const url: URL = new URL(TableAPI.UPDATE_SET_PATH, profile.getBaseUrl());
    url.searchParams.set("sysparm_no_count", "true");
    url.searchParams.set("sysparm_suppress_pagination_header", "true");
    url.searchParams.set("sysparm_exclude_reference_link", "true");
    url.searchParams.set("sysparm_fields", "sys_id");
    url.searchParams.set("sysparm_query", `ORDERBYDESCsys_updated_on^GROUPBYname^${query}`);

    const options: RequestOptions = {
      method: "GET",
      headers: {
        "content-type": "application/json",
        "accept": "application/json"
      }
    };

    await this.oauthClient.handleAuthentication(profile, options);

    const ids = (<JSONRESTResponse<SNUpdateSetData>> await Request.json(url, options)).result.map((item) => item.sys_id);
    return await this.loadUpdateXMLByUpdateSetIds(profile, ...ids);
  }
}

export interface TableFieldData {
  name: string;
  element: string;
}

export interface TableParentData {
  name: string;
  "super_class.name": string;
}

export interface JSONRESTResponse<T = any> {
  result: Array<T>
}