declare interface InstanceOAuthTokenData {
  clientID: string;
  clientSecret: string;
  lastRetrieved: number;
  token?: SNOAuthToken | null;
}

declare interface InstanceUserData {
  username: string;
  password: string;
}

declare interface InstanceAuthenticationData extends InstanceOAuthTokenData {
  type: "oauth-password" | "oauth-token";  
}

declare interface InstanceConnectionData {
  baseUrl: string;
  proxyUrl?: string
}

declare interface InstanceConfig extends InstanceConnectionData {
  name: string;
  auth: InstanceAuthenticationData;
}

declare interface TableConfig {
  tables: {[key: string]: SNTable};
}

declare enum UpdateXMLAction {
  INSERT_OR_UPDATE = "INSERT_OR_UPDATE",
  DELETE = "DELETE"
}

declare interface UpdateSetData {
  readonly name: string;
  readonly id: string;
}

declare interface UpdateXMLData {
  readonly name: string;
  readonly id: string;
  readonly action: UpdateXMLAction;
  readonly type: string;
  readonly targetName: string;
  readonly updateSet: string;
  readonly payload: string;
  readonly createdBy: string;
  readonly createdOn: string;
  readonly updatedBy: string;
  readonly updatedOn: string;

  // These 2 properties should be scanned from the payload, if not provided set null
  readonly targetTable: string | null;
  readonly targetId: string | null;
}