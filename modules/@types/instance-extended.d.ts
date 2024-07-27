export interface SNOAuthToken {
  access_token: string;
  refresh_token: string;
  scope: string;
  token_type: string;
  expires_in: number;
}

export interface InstanceOAuthData {
  lastRetrieved: number;
  token?: SNOAuthToken | null;
}

export interface InstanceAuthenticationData extends InstanceOAuthData {
  type: "oauth-token" | "oauth-password";
  clientID: string;
  clientSecret: string;
}

export interface InstanceConnectionData {
  baseUrl: string;
}

export interface InstanceConfig extends InstanceConnectionData {
  name: string;
  auth: InstanceAuthenticationData;
}