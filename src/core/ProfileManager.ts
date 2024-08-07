import { RESTClient } from "./RESTClient";

import fs from "fs";
import os from "os";
import path from "path";
import { SNOAuthToken, SNTable } from "./sn";

class Constants {
  static readonly PROFILES_FOLDER_NAME = ".now-eslint-profiles";
  static readonly PROFILES_HOME_DIR_PATH = path.normalize(`${os.homedir()}/${Constants.PROFILES_FOLDER_NAME}`);

  static readonly PROFILE_CONFIG_FILE_NAME: ProfileFileName = "profile.json" as const;
  // static readonly PROFILE_TABLES_NAME = "tables.json";
  static readonly PROFILE_ESLINT_FILE_NAME = "eslintrc.js" as const;

  static readonly PROFILE_NAME_REGEXP = /^[a-zA-Z0-9_-]+$/;
}

// Manages everything around profiles - home folder, profile home and additional files
// list, load, save, purgeAll, purge
export class ProfileManager {

  static profilesHomeDirPath() {
    return path.normalize(process.env.NOW_ESLINT_PROFILE_HOME || Constants.PROFILES_HOME_DIR_PATH);
  }

  static profileHomeDirPath(name: string): string {
    return path.normalize(`${ProfileManager.profilesHomeDirPath()}/${name}/`);
  }

  static pathFor(name: string, file: ProfileFileName): string {
    return path.normalize(`${ProfileManager.profileHomeDirPath(name)}/${file}`);
  }

  // Singleton instance
  constructor() {

  }

  listProfiles(): Array<ProfileInfo> {
    const home = ProfileManager.profilesHomeDirPath();
    return fs.readdirSync(home).filter((file) => {
      return fs.statSync(path.normalize(`${home}/${file}`)).isDirectory() && fs.existsSync(ProfileManager.pathFor(file, Constants.PROFILE_CONFIG_FILE_NAME));
    }).map<ProfileInfo>((profile) => {
      const configPath = ProfileManager.pathFor(profile, Constants.PROFILE_CONFIG_FILE_NAME);
      const content = fs.readFileSync(configPath, "utf8");
      const config: ProfileInfo = JSON.parse(content);
      return {
        name: profile,
        baseUrl: config.baseUrl
      }
    });
  }
  
  purgeProfiles(): void {
    const home = ProfileManager.profilesHomeDirPath();
    fs.rmdirSync(home, {recursive: true});
  }

  loadProfile(): any {

  }

  saveProfile(): any {

  }

  purgeProfile(): any {

  }

}

export class Profile {
  private config: InstanceConfig;
  private client: RESTClient;
  private tables: TableConfig | null = null;

  constructor(options: InstanceConfig) {
    this.config = options;
    this.client = new RESTClient(this.config);
  }

  // TODO: better name, load all other profile files/table setup
  async fetch(): Promise<void> {
    this.tables = await this.client.getTableConfiguration();
  }

}

export type ProfileFileName = "profile.json";

export interface ProfileInfo {
  name: string;
  baseUrl: string;
}

export interface InstanceOAuthTokenData {
  clientID: string;
  clientSecret: string;
  lastRetrieved: number;
  token?: SNOAuthToken | null;
}

export interface InstanceUserData {
  username: string;
  password: string;
}

export interface InstanceAuthenticationData extends InstanceOAuthTokenData {
  type: "oauth-password" | "oauth-token";  
}

export interface InstanceConnectionData {
  baseUrl: string;
  proxyUrl?: string
}

export interface InstanceConfig extends InstanceConnectionData, ProfileInfo {
  name: string;
  auth: InstanceAuthenticationData;
}

export interface TableConfig {
  tables: {[key: string]: SNTable};
}