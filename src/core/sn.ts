import { DOMParser } from "@xmldom/xmldom";
import * as xpath from "xpath";
import { xmlhelpers } from "../util/helpers";

export interface SNOAuthTokenData {
  access_token: string;
  refresh_token: string;
  scope: string;
  token_type: string;
  expires_in: number;
}

export interface SNAuth {
  username: string;
  password: string;
}

export interface SNField {
  name: string;
  label?: string;
  default?: string;
}

export interface SNTable {
  name: string;
  label?: string;
  parent?: string;
  fields: {[key: string]: SNField}
}

export type SNUpdateXMLAction = "INSERT_OR_UPDATE" | "DELETE";

// JSON Data loaded via REST API
export interface SNUpdateXMLData {
  sys_id: string;
  name: string;
  application: string;
  action: SNUpdateXMLAction;
  type: string;
  target_name: string;
  update_set: string;

  sys_created_on: string;
  sys_created_by: string;
  sys_updated_on: string;
  sys_updated_by: string;
  sys_mod_count: number;
  payload: string;
  payloadHash: number;
}

export interface SNUpdateSetData {
  sys_id: string;
}

export class SNUpdateXML {
  ID: string = "-1";
  name: string = "";
  application: string = "global";
  action: SNUpdateXMLAction = "INSERT_OR_UPDATE";
  type: string = "";
  targetName: string = "";
  updateSetID: string = "";

  createdOn: string = "";
  createdBy: string = "";
  updatedOn: string = "";
  updatedBy: string = "";
  updates: number = 0;

  payload: string = "";
  payloadHash: number = 0;

  targetTable: string = "";
  targetID: string = "-1";

  constructor(data?: SNUpdateXMLData) {
    if (data != null) {
      this.ID = data.sys_id;
      this.name = data.name;
      this.application = data.application;
      this.action = data.action;
      this.type = data.type;
      this.targetName = data.target_name;
      this.updateSetID = data.update_set;
      this.createdOn = data.sys_created_by
      this.createdBy = data.sys_created_by;
      this.updatedOn = data.sys_updated_on;
      this.updatedBy = data.sys_updated_by;
      this.updates = this.updates + data.sys_mod_count;
      
      this.payload = data.payload;
      this.payloadHash = data.payloadHash;
    }
  }

  parsePayload(): void {
    if (this.payload == null || this.payload === "") {
      return;
    }

    const document = new DOMParser().parseFromString(this.payload);
    this.targetTable = xmlhelpers.parsePayloadTableName(document);
    if (this.targetTable !== "") {
      this.targetID = xmlhelpers.parsePayloadTableFieldValue(this.targetTable, "sys_id", document);
    }
  }
}