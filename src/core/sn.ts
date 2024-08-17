import { DOMParser } from "@xmldom/xmldom";
import * as xmlhelpers from "../util/xmlhelpers";

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
// eslint-disable-next-line @typescript-eslint/consistent-indexed-object-style
export interface SNFieldMap {
  [name: string]: SNField
};

export interface SNTable {
  name: string;
  label?: string;
  parent?: string;
  fields: SNFieldMap;
}
// eslint-disable-next-line @typescript-eslint/consistent-indexed-object-style
export interface SNTableMap {
  [name: string]: SNTable
};

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
  // eslint-disable-next-line id-length
  ID = "-1";
  name = "";
  application = "global";
  action: SNUpdateXMLAction = "INSERT_OR_UPDATE";
  type = "";
  targetName = "";
  updateSetID = "";

  createdOn = "";
  createdBy = "";
  updatedOn = "";
  updatedBy = "";
  updates = 0;

  payload = "";
  payloadHash = 0;

  targetTable = "";
  targetID = "-1";

  constructor(data?: SNUpdateXMLData) {
    if (data != null) {
      this.ID = data.sys_id;
      this.name = data.name;
      this.application = data.application;
      this.action = data.action;
      this.type = data.type;
      this.targetName = data.target_name;
      this.updateSetID = data.update_set;
      this.createdOn = data.sys_created_by;
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
    if (this.targetTable === "") {
      return;
    }
    this.targetID = xmlhelpers.parsePayloadTableFieldValue(this.targetTable, "sys_id", document);
  }
}