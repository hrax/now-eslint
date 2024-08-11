import fs from "fs";
import os from "os";
import path from "path";

import { RESTClient } from "./RESTClient.js";
import { SNOAuthTokenData, SNTable } from "./sn.js";

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

  static listProfiles(): Array<ProfileInfo> {
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

  private static createFolderIfNotExists(path: string): void {
    if (!fs.existsSync(path)) {
      fs.mkdirSync(path, {
        recursive: true
      });
    }
  }
  
  static purgeProfiles(): void {
    const home = ProfileManager.profilesHomeDirPath();
    fs.rmdirSync(home, {recursive: true});
  }

  static fromData(data: InstanceConfig): Profile {
    return new Profile(data);
  }

  static async loadProfile(name: string, client: RESTClient): Promise<Profile | null> {
    const home = ProfileManager.profileHomeDirPath(name);
    if (!fs.existsSync(home)) {
      return null;
    }
    const configFilePath = ProfileManager.pathFor(name, Constants.PROFILE_CONFIG_FILE_NAME);
    if (!fs.existsSync(configFilePath)) {
      return null;
    }
    const configFileData = fs.readFileSync(configFilePath, "utf8");

    const profile = ProfileManager.fromData(JSON.parse(configFileData));
    profile.setRESTClient(client);
    await profile.fetchTableConfiguration();
    return profile;
  }

  static saveProfile(profile: Profile): void {
    const home = ProfileManager.profileHomeDirPath(profile.getName())
    ProfileManager.createFolderIfNotExists(home);
    const config = profile.getConfig();
    const configPath = ProfileManager.pathFor(profile.getName(), Constants.PROFILE_CONFIG_FILE_NAME);
    fs.writeFileSync(configPath, JSON.stringify(config, null, 2), "utf8");
  }

  static updateProfileConfig(profile: Profile): void {
    const home = ProfileManager.profileHomeDirPath(profile.getName())
    ProfileManager.createFolderIfNotExists(home);
    const config = profile.getConfig();
    const configPath = ProfileManager.pathFor(profile.getName(), Constants.PROFILE_CONFIG_FILE_NAME);
    fs.writeFileSync(configPath, JSON.stringify(config, null, 2), "utf8");
  }

  static purgeProfile(profile: Profile): void {
    const home = ProfileManager.profileHomeDirPath(profile.getName());
    fs.rmdirSync(home, {recursive: true});
  }

}

export class Profile {
  private config: InstanceConfig;
  private client: RESTClient | null = null;
  private tables: TableConfig | null = null;

  constructor(options: InstanceConfig) {
    this.config = options;
  }

  setRESTClient(client: RESTClient): void {
    this.client = client;
  }

  getName(): string {
    return this.config.name;
  }

  getBaseUrl(): string {
    return this.config.baseUrl;
  }

  getClientID(): string {
    return this.config.auth.clientID;
  }

  getClientSecret(): string {
    return this.config.auth.clientSecret;
  }

  getLastRetrieved(): number {
    return this.config.auth.lastRetrieved;
  }

  getConfig(): InstanceConfig {
    return this.config;
  }

  getInstanceOAuthTokenData(): InstanceOAuthTokenData {
    return this.config.auth;
  }

  getToken(): SNOAuthTokenData | null | undefined {
    return this.config.auth.token;
  }

  refreshToken(token: SNOAuthTokenData) {
    this.config.auth.lastRetrieved = Date.now();
    this.config.auth.token = token;
  }

  getTableConfiguration(): TableConfig | null {
    return this.tables
  }

  // TODO: better name, load all other profile files/table setup
  async fetchTableConfiguration(): Promise<void> {
    if (this.client != null) {
      this.tables = await this.client.getTableConfiguration(this);
    }
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
  token?: SNOAuthTokenData | null;
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