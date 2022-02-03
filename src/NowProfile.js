const fs = require("fs");
const os = require("os");
const path = require("path");

const Assert = require("./util/Assert");
const NowInstance = require("./now/NowInstance");
const NowRequest = require("./now/NowRequest");
const NowReportGenerator = require("./NowReportGenerator");

/**
 * Options object
 * {
 *  name: null, // Profile name
 *  domain: null, // Domain URL, preferably not ending with /
 *  username: null, // Username used to connect to the instance
 *  password: null, // Password for the given username
 *  proxy: null, // Optional; proxy connection URL
 *  properties: null, // Optional; object containing additional available report properties
 *  tables: null, // Optional; object containing table information
 *  colors: null, // Not implemented;
 *  language: null, // Not implemented;
 * }
 */
class NowProfile {
  constructor(options) {
    Assert.notNull(options, "Options cannot be null!");
    Assert.isObject(options, "Options needs to be an object!");
    
    Assert.notEmpty(options.name, "Profile name cannot be empty!");
    Assert.notEmpty(options.domain, "ServiceNow instance domain cannot be empty!");
    Assert.notEmpty(options.username, "ServiceNow instance username cannot be empty!");
    Assert.notEmpty(options.password, "ServiceNow instance password cannot be empty!");

    // Cleanup domain; remove ending SEPARATOR
    if (options.domain.endsWith("/")) {
      options.domain = options.domain.slice(0, -1);
    }

    // const version = require("../package.json").version;
    const propertyConfig = {
      configurable: false,
      writable: false,
      enumerable: true
    };

    // helper
    const decode = function(value) {
      if (value == null || value === "" || !value.startsWith)  {
        return null;
      }

      if (!value.startsWith(NowProfile.ENCODE_PREFIX)) {
        return value;
      }
      return Buffer.from(value.substring(NowProfile.ENCODE_PREFIX.length), "base64").toString("utf8");
    };
    
    // Immutable properties; must create new instance if you want to modify them
    Object.defineProperty(this, "name", Object.assign({}, propertyConfig, {value: options.name}));
    Object.defineProperty(this, "domain", Object.assign({}, propertyConfig, {value: options.domain}));
    Object.defineProperty(this, "username", Object.assign({}, propertyConfig, {value: options.username}));
    Object.defineProperty(this, "password", Object.assign({}, propertyConfig, {value: decode(options.password)}));
    Object.defineProperty(this, "proxy", Object.assign({}, propertyConfig, {value: decode(options.proxy) || null}));

    // Options have any tables configured
    this.tables = Object.assign({}, options.tables || {});
    this.properties = Object.assign({}, options.properties || {});
    this.colors = Object.assign({}, options.colors || {});
    this.eslint = Object.assign({}, options.eslint || {});
    this.eslintrc = Object.assign({}, options.eslintrc || {});
  }

  createRequest() {
    return new NowRequest({
      domain: this.domain,
      username: this.username,
      password: this.password,
      proxy: this.proxy || null
    });
  }

  createInstance() {
    return new NowInstance(this.domain, this.username, this.password, this.proxy || null);
  }

  createReportGenerator(docDef) {
    Assert.notNull(docDef);
    Assert.isObject(docDef);
    
    // if (this.customGeneratorClassPath != null) {
    //   // require from current working directory or profile main directory
    //   const generator = require(`${this.customGeneratorClassPath}`);
    //   return new generator(docDef);
    // }

    return new NowReportGenerator(docDef);
  }

  toJSON() {
    const encode = (value) => {
      if (value == null || value === "") {
        return null;
      }

      return [NowProfile.ENCODE_PREFIX, Buffer.from(value, "utf8").toString("base64")].join("");
    };

    return {
      "name": this.name,
      "domain": this.domain,
      "username": this.username,
      "password": encode(this.password),
      "proxy": encode(this.proxy)
    };
  }

  static profilesHomeDirPath() {
    return path.normalize(process.env.NOW_ESLINT_PROFILE_HOME || NowProfile.PROFILES_HOME_DIR_PATH);
  }

  static load(profileName) {
    const home = NowProfile.profilesHomeDirPath();
    const profileHome = `${home}/${NowProfile.PROFILE_PREFIX}${profileName}`;

    if (!NowProfile.exists(profileName)) {
      throw new Error(`Profile home at ${profileHome} does not exists!`);
    }

    const fileExists = function(filename) {
      return fs.existsSync(`${profileHome}/${filename}`);
    };

    const loadFile = function(filename) {
      const data = fs.readFileSync(`${profileHome}/${filename}`, "utf8");
      return JSON.parse(data);
    };

    if (!fileExists(NowProfile.PROFILE_CONFIG_NAME)) {
      throw new Error(`Profile config file was not found in the profile home at ${profileHome}`);
    }

    var options = loadFile(NowProfile.PROFILE_CONFIG_NAME);
    var profile = new NowProfile(options);

    // Load other files
    if (fileExists(NowProfile.PROFILE_TABLES_NAME)) {
      profile.tables = loadFile(NowProfile.PROFILE_TABLES_NAME);
    }

    if (fileExists(NowProfile.PROFILE_PROPERTIES_NAME)) {
      profile.properties = loadFile(NowProfile.PROFILE_PROPERTIES_NAME);
    }

    if (fileExists(NowProfile.PROFILE_COLORS_NAME)) {
      profile.colors = loadFile(NowProfile.PROFILE_COLORS_NAME);
    }

    if (fileExists(NowProfile.PROFILE_ESLINT_NAME)) {
      profile.eslint = loadFile(NowProfile.PROFILE_ESLINT_NAME);
    }

    if (fileExists(NowProfile.PROFILE_ESLINTRC_NAME)) {
      profile.eslintrc = loadFile(NowProfile.PROFILE_ESLINTRC_NAME);
    }

    return profile;
  }

  static save(profile) {
    Assert.notNull(profile);
    Assert.isInstance(profile, NowProfile, "Provided profile is not instance of NowProfile");

    const home = NowProfile.profilesHomeDirPath();
    const profileHome = `${home}/${NowProfile.PROFILE_PREFIX}${profile.name}`;

    // Check if profiles home directory exists; if not create
    if (!fs.existsSync(`${home}`)) {
      fs.mkdirSync(`${home}`);
    }

    // Check if profile home directory exists and delete (always override)
    if (!fs.existsSync(`${profileHome}`)) {
      fs.rmSync(`${profileHome}`, {recursive: true, force: true});
    }

    // always create clean profile home directory
    fs.mkdirSync(`${profileHome}`);

    const saveFile = function(filename, data) {
      fs.writeFileSync(`${profileHome}/${filename}`, data);
    };

    // We always save profile in multiple files; easier manual maintenance
    saveFile(NowProfile.PROFILE_CONFIG_NAME, JSON.stringify(profile));
    
    if (profile.tables && Object.keys(profile.tables).length) {
      saveFile(NowProfile.PROFILE_TABLES_NAME, JSON.stringify(profile.tables));
    }
    
    if (profile.properties && Object.keys(profile.properties).length) {
      saveFile(NowProfile.PROFILE_PROPERTIES_NAME, JSON.stringify(profile.properties));
    }
    
    if (profile.colors && Object.keys(profile.colors).length) {
      saveFile(NowProfile.PROFILE_COLORS_NAME, JSON.stringify(profile.colors));
    }

    if (profile.eslint && Object.keys(profile.eslint).length) {
      saveFile(NowProfile.PROFILE_ESLINT_NAME, JSON.stringify(profile.eslint));
    }

    if (profile.eslintrc && Object.keys(profile.eslintrc).length) {
      saveFile(NowProfile.PROFILE_ESLINTRC_NAME, JSON.stringify(profile.eslintrc));
    }
  }

  static exists(profileName) {
    const home = NowProfile.profilesHomeDirPath();
    const profileHome = path.normalize(`${home}/${NowProfile.PROFILE_PREFIX}${profileName}`);
    const profile = path.normalize(`${profileHome}/${NowProfile.PROFILE_CONFIG_NAME}`);
    
    if (!fs.existsSync(`${home}`)) {
      return false;
    }

    if (!fs.existsSync(`${profileHome}`)) {
      return false;
    }

    // return true only if the profile is saved
    if (fs.existsSync(`${profile}`)) {
      return true;
    }

    return false;
  }
}

NowProfile.PROFILES_HOME_DIR_PATH = path.normalize(`${os.homedir()}/.now-eslint-profiles`);
NowProfile.PROFILE_PREFIX = "profile_";

NowProfile.PROFILE_CONFIG_NAME = "profile.json";
NowProfile.PROFILE_TABLES_NAME = "tables.json";
NowProfile.PROFILE_PROPERTIES_NAME = "properties.json";
NowProfile.PROFILE_COLORS_NAME = "colors.json";
NowProfile.PROFILE_ESLINT_NAME = "eslint.json";
NowProfile.PROFILE_ESLINTRC_NAME = ".eslintrc.json";

NowProfile.ENCODE_PREFIX = "$$$";

module.exports = NowProfile;