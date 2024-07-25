import { InstanceData } from "./InstanceManager";

import http from "https";
import HttpsProxyAgent from "https-proxy-agent";
import Assert from "../util/Assert.js";

export enum RESPONSE_STATUS {
  OK = 200,
  NOT_FOUND = 400,
  UNAUTHORIZED = 401,
  FORBIDDEN = 403,
  ERROR = 500
};

export default class RESTRequest {
  #instance;

  constructor(instance: InstanceData) {
    this.#instance = instance;
  }

  #requestOAuthToken() {

  }

  #refreshOAuthToken() {

  }
}