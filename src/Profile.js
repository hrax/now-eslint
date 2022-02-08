const fs = require("fs");
const os = require("os");
const path = require("path");

const Assert = require("./util/Assert");
const Instance = require("./now/Instance");
const Request = require("./now/Request");

/**
 * Options object
 * {
 *  name: null, // Profile name
 *  domain: null, // Domain URL, preferably not ending with /
 *  username: null, // Username used to connect to the instance
 *  password: null, // Password for the given username
 *  proxy: null, // Optional; proxy connection URL
 *  tables: null, // Optional; object containing table information
 *  resources: null, // Optional; object containing additional available report resources
 *  colors: null, // Not implemented;
 *  language: null, // Not implemented;
 *  eslint: null,
 *  eslintrc: null
 * }
 */
class Profile {
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

    const propertyConfig = {
      configurable: false,
      enumerable: true
    };

    // decode helper
    const decode = function(value) {
      if (value == null || value === "" || !value.startsWith)  {
        return null;
      }

      if (!value.startsWith(Profile.ENCODE_PREFIX)) {
        return value;
      }
      return Buffer.from(value.substring(Profile.ENCODE_PREFIX.length), "base64").toString("utf8");
    };

    // Mutable privates Map; giggity
    const privates = new Map();
    const privatesSafeGet = (key) => {
      // In case we try to access the property before it was set
      if (!privates.has(key)) {
        privates.set(key, new Map());
      }
      return privates.get(key);
    };
    const privatesSafeSet = (key, value) => {
      if (value != null && value instanceof Map) {
        privates.set(key, value);
      } else if (value != null && typeof value === "object") {
        // Expecting object notation object
        privates.set(key, new Map(Object.entries(value)));
      } else {
        // Anything else, set empty map
        privates.set(key, new Map());
      }
    };
    
    // Immutable properties; must create new instance if you want to modify them
    Object.defineProperty(this, "name", Object.assign({}, propertyConfig, {writable: false, value: options.name}));
    Object.defineProperty(this, "domain", Object.assign({}, propertyConfig, {writable: false, value: options.domain}));
    Object.defineProperty(this, "username", Object.assign({}, propertyConfig, {writable: false, value: options.username}));
    Object.defineProperty(this, "password", Object.assign({}, propertyConfig, {writable: false, value: decode(options.password)}));
    Object.defineProperty(this, "proxy", Object.assign({}, propertyConfig, {writable: false, value: decode(options.proxy) || null}));

    // Mutable properties
    Object.defineProperty(this, "tables", Object.assign({}, propertyConfig, {
      get() {
        return privatesSafeGet("tables");
      },
      set(newValue) {
        privatesSafeSet("tables", newValue);
      }
    }));
    Object.defineProperty(this, "resources", Object.assign({}, propertyConfig, {
      get() {
        return privatesSafeGet("resources");
      },
      set(newValue) {
        privatesSafeSet("resources", newValue);
      }
    }));
    Object.defineProperty(this, "colors", Object.assign({}, propertyConfig, {
      get() {
        return privatesSafeGet("colors");
      },
      set(newValue) {
        privatesSafeSet("colors", newValue);
      }
    }));
    Object.defineProperty(this, "eslint", Object.assign({}, propertyConfig, {
      get() {
        return privatesSafeGet("eslint");
      },
      set(newValue) {
        privatesSafeSet("eslint", newValue);
      }
    }));
    
    // Set mutable properties
    this.tables = Object.assign({}, options.tables || {});
    this.resources = Object.assign({}, options.resources || {});
    this.colors = Object.assign({}, options.colors || {});
    this.eslint = Object.assign({}, options.eslint || {});
  }

  createRequest() {
    return new Request({
      domain: this.domain,
      username: this.username,
      password: this.password,
      proxy: this.proxy || null
    });
  }

  createInstance() {
    return new Instance(this.domain, this.username, this.password, this.proxy || null);
  }

  toJSON() {
    const encode = (value) => {
      if (value == null || value === "") {
        return null;
      }

      return [Profile.ENCODE_PREFIX, Buffer.from(value, "utf8").toString("base64")].join("");
    };
    
    const toReturn = {
      "name": this.name,
      "domain": this.domain,
      "username": this.username,
      "password": encode(this.password)
    };

    if (this.proxy != null) {
      toReturn["proxy"] = encode(this.proxy);
    }

    return toReturn;
  }

  static profilesHomeDirPath() {
    return path.normalize(process.env.NOW_ESLINT_PROFILE_HOME || Profile.PROFILES_HOME_DIR_PATH);
  }

  static load(profileName) {
    const home = Profile.profilesHomeDirPath();
    const profileHome = path.normalize(`${home}/${Profile.PROFILE_PREFIX}${profileName}`);

    if (!Profile.exists(profileName)) {
      throw new Error(`Profile home at ${profileHome} does not exists!`);
    }

    const fileExists = function(filename) {
      return fs.existsSync(`${profileHome}/${filename}`);
    };

    const loadFile = function(filename) {
      const data = fs.readFileSync(`${profileHome}/${filename}`, "utf8");
      return JSON.parse(data);
    };

    if (!fileExists(Profile.PROFILE_CONFIG_NAME)) {
      throw new Error(`Profile config file was not found in the profile home at ${profileHome}`);
    }

    var options = loadFile(Profile.PROFILE_CONFIG_NAME);
    var profile = new Profile(options);

    // Load other files
    if (fileExists(Profile.PROFILE_TABLES_NAME)) {
      profile.tables = loadFile(Profile.PROFILE_TABLES_NAME);
    }

    if (fileExists(Profile.PROFILE_RESOURCES_NAME)) {
      profile.resources = loadFile(Profile.PROFILE_RESOURCES_NAME);
    }

    if (fileExists(Profile.PROFILE_COLORS_NAME)) {
      profile.colors = loadFile(Profile.PROFILE_COLORS_NAME);
    }

    if (fileExists(Profile.PROFILE_ESLINT_NAME)) {
      profile.eslint = loadFile(Profile.PROFILE_ESLINT_NAME);
    }

    return profile;
  }

  static save(profile, cleanup = false) {
    Assert.notNull(profile);
    Assert.isInstance(profile, Profile, "Provided profile is not instance of NowProfile");

    const home = Profile.profilesHomeDirPath();
    const profileHome = path.normalize(`${home}/${Profile.PROFILE_PREFIX}${profile.name}`);

    if (cleanup === true) {
      Profile.purge(profile.name);
    }

    // Check if directories exist otherwise create
    [home, profileHome].forEach(item => {
      if (!fs.existsSync(item)) {
        fs.mkdirSync(item);
      }
    });

    const saveFile = function(filename, data) {
      const filepath = path.normalize(`${profileHome}/${filename}`);
      const padding = 2;
      // Delete old file before we save a new one
      fs.rmSync(filepath, {recursive: true, force: true});
      fs.writeFileSync(filepath, JSON.stringify(data, null, padding));
    };

    // We always save profile in multiple files; easier manual maintenance
    saveFile(Profile.PROFILE_CONFIG_NAME, profile);
    
    if (profile.tables.size) {
      saveFile(Profile.PROFILE_TABLES_NAME, Object.fromEntries(profile.tables.entries()));
    }
    
    if (profile.resources.size) {
      saveFile(Profile.PROFILE_RESOURCES_NAME, Object.fromEntries(profile.resources.entries()));
    }
    
    if (profile.colors.size) {
      saveFile(Profile.PROFILE_COLORS_NAME, Object.fromEntries(profile.colors.entries()));
    }

    if (profile.eslint.size) {
      saveFile(Profile.PROFILE_ESLINT_NAME, Object.fromEntries(profile.eslint.entries()));
    }
  }

  static exists(profileName) {
    const home = Profile.profilesHomeDirPath();
    const profileHome = path.normalize(`${home}/${Profile.PROFILE_PREFIX}${profileName}`);
    const profile = path.normalize(`${profileHome}/${Profile.PROFILE_CONFIG_NAME}`);
    
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

  static purge(profileName) {
    const home = Profile.profilesHomeDirPath();
    const profileHome = path.normalize(`${home}/${Profile.PROFILE_PREFIX}${profileName}`);
    
    if (fs.existsSync(`${profileHome}`)) {
      fs.rmSync(`${profileHome}`, {recursive: true, force: true});
    }
  }

  static purgeHome() {
    const home = Profile.profilesHomeDirPath();

    if (fs.existsSync(`${home}`)) {
      fs.rmSync(`${home}`, {recursive: true, force: true});
    }
  }

  static isProfileNameValid(profileName) {
    return Profile.PROFILE_NAME_REGEXP.test(profileName);
  }
}

Profile.PROFILES_HOME_DIR_PATH = path.normalize(`${os.homedir()}/.now-eslint-profiles`);
Profile.PROFILE_PREFIX = "profile_";

Profile.PROFILE_CONFIG_NAME = "profile.json";
Profile.PROFILE_TABLES_NAME = "tables.json";
Profile.PROFILE_RESOURCES_NAME = "resources.json";
Profile.PROFILE_COLORS_NAME = "colors.json";
Profile.PROFILE_ESLINT_NAME = "eslint.json";

Profile.ENCODE_PREFIX = "$$$";

Profile.PROFILE_NAME_REGEXP = /^[a-zA-Z0-9_-]+$/;

module.exports = Profile;