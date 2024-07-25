
export type InstanceData = {
  name: string,
  base: string,
  auth: {
    type: "oauth-token" | "oauth-password",
    clientID: string,
    clientSecret: string,
    token?: {
      "access_token": string,
      "refresh_token": string,
      "scope": string,
      "token_type": string,
      "expires_in": number,
      "loaded_at": Date
    }
  }
}

export default class InstanceManager {
  #instance: InstanceData;

  constructor(instance: InstanceData) {
    this.#instance = instance;
  }
}