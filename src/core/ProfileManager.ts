import fs from "fs";
import os from "os";
import path from "path";

import { RESTClient } from "./RESTClient.js";
import { SNOAuthTokenData, SNTableMap } from "./sn.js";

const JSON_INDENT = 2;
const PROFILES_FOLDER_NAME = ".now-eslint-profiles" as const;
const PROFILES_HOME_DIR_PATH = path.normalize(`${os.homedir()}/${PROFILES_FOLDER_NAME}`);
const PROFILE_CONFIG_FILE_NAME: ProfileFileName = "profile.json" as const;
// TODO: const PROFILE_ESLINT_FILE_NAME = "eslintrc.config.js" as const;
const PROFILE_NAME_REGEXP = /^[a-zA-Z0-9_-]+$/;

const createFolderIfNotExists = function(path: string): void {
  if (!fs.existsSync(path)) {
    fs.mkdirSync(path, {
      recursive: true
    });
  }
};

const homeDirPath = function() {
  return path.normalize(process.env.NOW_ESLINT_PROFILE_HOME || PROFILES_HOME_DIR_PATH);
};

export class ProfileManager {
  private homePath: string;
  constructor(homePath: string, force = false) {
    this.homePath = path.normalize(homePath);
    if (force === true) {
      createFolderIfNotExists(homePath);
    }
  }

  getHomePath() {
    return this.homePath;
  };

  getProfilePath(name: string) {
    return path.normalize(`${this.getHomePath()}/${name}/`);
  };

  getProfileFilePath(name: string, file: ProfileFileName): string {
    return path.normalize(`${this.getProfilePath(name)}/${file}`);
  };

  profileExists(name: string) {
    return fs.existsSync(this.getProfilePath(name));
  };

  listProfiles(): ProfileInfo[] {
    const home = this.getHomePath();
    return fs.readdirSync(home)
      .filter((file) => {
        return fs.statSync(path.normalize(`${home}/${file}`)).isDirectory() && fs.existsSync(this.getProfileFilePath(file, PROFILE_CONFIG_FILE_NAME));
      })
      .map<ProfileInfo>((profile) => {
        const configPath = this.getProfileFilePath(profile, PROFILE_CONFIG_FILE_NAME);
        const content = fs.readFileSync(configPath, "utf8");
        const config: ProfileInfo = JSON.parse(content);
        return {
          name: profile,
          baseUrl: config.baseUrl
        };
      });
  };

  purgeProfiles(): void {
    fs.rmdirSync(this.getHomePath(), {recursive: true});
  };

  fromData(data: InstanceConfig): Profile {
    return new Profile(data);
  };

  async loadProfile(name: string, client: RESTClient): Promise<Profile | null> {
    const home = this.getProfilePath(name);
    if (!fs.existsSync(home)) {
      return null;
    }
    const configFilePath = this.getProfileFilePath(name, PROFILE_CONFIG_FILE_NAME);
    if (!fs.existsSync(configFilePath)) {
      return null;
    }
    const configFileData = fs.readFileSync(configFilePath, "utf8");
  
    const profile = this.fromData(JSON.parse(configFileData));
    profile.setRESTClient(client);
    await profile.fetchTableConfiguration();
    return profile;
  };
  
  saveProfile(profile: Profile): void {
    const home = this.getProfilePath(profile.getName());
    createFolderIfNotExists(home);
    const config = profile.getConfig();
    const configPath = this.getProfileFilePath(profile.getName(), PROFILE_CONFIG_FILE_NAME);
    fs.writeFileSync(configPath, JSON.stringify(config, null, JSON_INDENT), "utf8");
  };
  
  updateProfileConfig(profile: Profile): void {
    // FIXME: for now 100% same as save, redirect
    this.saveProfile(profile);
  };
  
  purgeProfile(profile: Profile): void {
    const home = this.getProfilePath(profile.getName());
    fs.rmdirSync(home, {recursive: true});
  };
}


const profileManager = new ProfileManager(homeDirPath(), true);
export default profileManager;

/*
 * Manages everything around profiles - home folder, profile home and additional files
 * list, load, save, purgeAll, purge
 */

export const isProfileNameValid = function(name: string): boolean {
  return PROFILE_NAME_REGEXP.test(name);
};

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
    return this.tables;
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

export type OAuthType = "oauth-password" | "oauth-token";
export interface InstanceAuthenticationData extends InstanceOAuthTokenData {
  type: OAuthType;
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
  tables: SNTableMap;
}