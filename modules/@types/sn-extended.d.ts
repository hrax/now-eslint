declare interface SNOAuthToken {
  access_token: string;
  refresh_token: string;
  scope: string;
  token_type: string;
  expires_in: number;
}

declare interface SNAuth {
  username: string;
  password: string;
}

declare interface SNField {
  name: string;
  label?: string;
  default?: string;
}

declare interface SNTable {
  name: string;
  label?: string;
  parent?: string;
  fields: {[key: string]: SNField}
}