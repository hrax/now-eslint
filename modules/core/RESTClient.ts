import { RequestOptions } from "https";
import { URLSearchParams } from "url";
import OAuthClient from "./OAuthClient";
import { Request, Response } from "./Request";

export enum RESPONSE_STATUS {
  OK = 200,
  NOT_FOUND = 400,
  UNAUTHORIZED = 401,
  FORBIDDEN = 403,
  ERROR = 500
};

enum TableAPI {
  UPDATE_XML_PATH = "/api/now/table/sys_update_xml",
  UPDATE_SET_PATH = "/api/now/table/sys_update_set",
  DICTIONARY_PATH = "/api/now/table/sys_dictionary",
  DB_OBJECT_PATH = "/api/now/table/sys_db_object",
  USER_PREFERENCE_PATH = "/api/now/table/sys_user_preference"
}

export class RESTTableData {

}

export default class RESTClient {
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
    const oauth: InstanceAuthenticationData = this.instance.auth;
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
      .catch<Response>((reason: any) => {
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

  requestTable*/

  async setupTableConfiguration(): Promise<TableConfig> {
    return Promise.reject("To be implemented!");
  }

  async getTableConfiguration(): Promise<TableConfig> {
    return Promise.reject("To be implemented!");
  }

}