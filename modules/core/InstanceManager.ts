import { InstanceConfig } from "../@types/instance-extended";

export default class InstanceManager {
  private instance: InstanceConfig = {
    name: "",
    baseUrl: "",
    auth: {
      type: "oauth-token",
      clientID: "",
      clientSecret: "",
      lastRetrieved: 0,
      token: {
        access_token: "",
        refresh_token: "",
        scope: "",
        token_type: "",
        expires_in: 0
      }
    }
  };

  static load(path: string): InstanceManager | null {
    return null;
  }

  static save(instance: InstanceManager): void {

  }

  constructor(instance: InstanceConfig) {
    this.setInstanceData(instance);
  }

  setInstanceData(instance: InstanceConfig): void {
    this.instance = instance;
  }
}