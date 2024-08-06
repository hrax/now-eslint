export interface SNOAuthToken {
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