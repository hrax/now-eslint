import http, { RequestOptions } from "https";
import { URLSearchParams } from "url";
import HttpsProxyAgent from "https-proxy-agent";
import Assert from "../util/Assert.js";
import { Tab } from "docx";
import OAuthClient from "./OAuthClient";
import { InstanceAuthenticationData, InstanceConfig } from "../@types/instance-extended.js";
import Request, { Response } from "./Request";

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

    if (oauth.token != null) {
      if (this.oauthClient.isTokenExpired()) {
        await this.oauthClient.refreshToken();
        // refresh config instance with a new token
        this.instance = this.oauthClient.getInstanceConfig();
      }
      options.headers!.authorization = `Bearer ${oauth.token.access_token}`;
    }

    const response: Response = await Request.request(url, options)
      .catch<Response>((reason: any) => {

        return new Response(null, "");
      });

    if (response.http != null) {
      // check for error codes and reject with an error message
      //return Promise.reject<boolean>("Reason");
    }
    
    return Promise.reject<boolean>("Reason");
  }

  /*requestUpdateXMLByUpdateSetQuery

  requestUpdateXMLByUpdateSetIds

  requestTable*/

}