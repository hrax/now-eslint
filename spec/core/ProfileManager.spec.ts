import fs, { Stats } from "fs";
import path from "path";
import * as ProfileManager from "../../src/core/ProfileManager";
import { InstanceConfig, Profile, ProfileInfo } from "../../src/core/ProfileManager";
import { RESTClient } from "../../src/core/RESTClient";
import { OAuthClient } from "../../src/core/OAuthClient";
import { resetAllWhenMocks, when } from "jest-when";
import { jesthelpers } from "../helpers";

describe("ProfileManagerSpec", () => {
  const dev1Profile = {
    name: "dev1",
    baseUrl: "https://dev1.example.com"
  };
  const dev2Profile = {
    name: "dev2",
    baseUrl: "https://dev2.example.com"
  };
  
  beforeEach(() => {
    resetAllWhenMocks();
  });

  it("should list all available profiles", () => {
    const expected: ProfileInfo[] = [dev1Profile, dev2Profile];

    // Blank stats impl
    const dirStats: Stats = {
      atime: new Date(),
      atimeMs: Date.now(),
      birthtime: new Date(),
      birthtimeMs: Date.now(),
      blksize: 0,
      blocks: 0,
      ctime: new Date(),
      ctimeMs: Date.now(),
      dev: 0,
      gid: 0,
      ino: 0,
      isBlockDevice: function(){return false},
      isCharacterDevice: function(){return false},
      isDirectory: function(){return true},
      isFIFO: function(){return false},
      isFile: function(){return false},
      isSocket: function(){return false},
      isSymbolicLink: function(){return false},
      mode: 0,
      mtime: new Date(),
      mtimeMs: Date.now(),
      nlink: 0,
      rdev: 0,
      size: 0,
      uid: 0
    };

    const profilesHomePath = "#profilesHome";
    jest.spyOn(path, "normalize").mockImplementation((path) => path);
    jest.spyOn(ProfileManager, "homeDirPath").mockReturnValue(profilesHomePath);
    jest.spyOn(ProfileManager, "profileFilePath").mockImplementation((name, file) => `${profilesHomePath}/${name}/${file}`);
    
    when(jest.spyOn(fs, "readdirSync"))
      .defaultImplementation(jesthelpers.defaultWhenImplementationThrow)
      // @ts-ignore
      .calledWith(profilesHomePath).mockReturnValue(["dev1", "dev2"]);
    
    // @ts-ignore
    // eslint-disable-next-line no-unused-vars, @typescript-eslint/no-unused-vars
    jest.spyOn(fs, "statSync").mockImplementation((path) => {
      return dirStats;
    });
    jest.spyOn(fs, "existsSync").mockReturnValue(true);
    when(jest.spyOn(fs, "readFileSync"))
      .defaultImplementation(jesthelpers.defaultWhenImplementationThrow)
      .calledWith(`${profilesHomePath}/dev1/profile.json`, "utf8").mockReturnValue(JSON.stringify(expected[0]))
      .calledWith(`${profilesHomePath}/dev2/profile.json`, "utf8").mockReturnValue(JSON.stringify(expected[1]));

    const profiles: ProfileInfo[] = ProfileManager.listProfiles();
    
    expect(profiles).toStrictEqual(expected);
  });

  it("should purge all existing profiles", () => {
    const profilesHomePath = "#profilesHome";
    const profilesHomeDirPathSpy = jest.spyOn(ProfileManager, "homeDirPath").mockReturnValue(profilesHomePath);

    const rmSpy = jest.spyOn(fs, "rmdirSync").mockReturnValue(undefined);
    ProfileManager.purgeProfiles();

    expect(profilesHomeDirPathSpy).toHaveBeenCalled();
    expect(rmSpy).toHaveBeenCalledWith(profilesHomePath, {recursive: true});
  });

  it("should load selected profile", async() => {
    const profilesHomePath = "#profilesHome";
    const profileName = "dev1";

    jest.spyOn(path, "normalize").mockImplementation((path) => path);
    jest.spyOn(ProfileManager, "homeDirPath").mockReturnValue(profilesHomePath);
    jest.spyOn(ProfileManager, "profileFilePath").mockImplementation((name, file) => `${profilesHomePath}/${name}/${file}`);

    jest.spyOn(fs, "existsSync").mockReturnValue(true);
    when(jest.spyOn(fs, "readFileSync"))
      .defaultImplementation(jesthelpers.defaultWhenImplementationThrow)
      .calledWith(`${profilesHomePath}/${profileName}/profile.json`, "utf8").mockReturnValue(JSON.stringify(dev1Profile));

    const oauthClient = new OAuthClient();
    const restClient = new RESTClient(oauthClient);

    const restClientSpy = jest.spyOn(restClient, "getTableConfiguration")
      .mockResolvedValue({
        tables: {}
      });

    await ProfileManager.loadProfile(profileName, restClient);

    expect(restClientSpy).toHaveBeenCalledTimes(1);
  });

  it("should save selected profile", () => {
    const profileData: InstanceConfig = {
      name: "dev1",
      "baseUrl": "https://example.com",
      auth: {
        type: "oauth-token",
        clientID: "clientID",
        clientSecret: "clientSecret",
        lastRetrieved: 0
      }
    };
    const profile = new Profile(profileData);

    const profilesHomePath = "#profilesHome";
    
    jest.spyOn(path, "normalize").mockImplementation((path) => path);
    jest.spyOn(ProfileManager, "homeDirPath").mockReturnValue(profilesHomePath);
    jest.spyOn(ProfileManager, "profileFilePath").mockImplementation((name, file) => `${profilesHomePath}/${name}/${file}`);

    jest.spyOn(fs, "existsSync").mockReturnValue(true);
    const writeSpy = jest.spyOn(fs, "writeFileSync").mockReturnValue(undefined);

    ProfileManager.saveProfile(profile);

    expect(writeSpy).toHaveBeenCalledWith(expect.anything(), JSON.stringify(profileData, null, 2), expect.anything());
  });

  it("should update selected profile config", () => {
    const profileData: InstanceConfig = {
      name: "dev1",
      "baseUrl": "https://example.com",
      auth: {
        type: "oauth-token",
        clientID: "clientID",
        clientSecret: "clientSecret",
        lastRetrieved: 0
      }
    };
    const profile = new Profile(profileData);

    const profilesHomePath = "#profilesHome";
    
    jest.spyOn(path, "normalize").mockImplementation((path) => path);
    jest.spyOn(ProfileManager, "homeDirPath").mockReturnValue(profilesHomePath);
    jest.spyOn(ProfileManager, "profileFilePath").mockImplementation((name, file) => `${profilesHomePath}/${name}/${file}`);

    jest.spyOn(fs, "existsSync").mockReturnValue(true);
    const writeSpy = jest.spyOn(fs, "writeFileSync").mockImplementation(undefined);

    ProfileManager.updateProfileConfig(profile);

    expect(writeSpy).toHaveBeenCalledWith(expect.anything(), JSON.stringify(profileData, null, 2), expect.anything());
  });

  it("should purge selected profile", () => {
    const profileData: InstanceConfig = {
      name: "dev1",
      "baseUrl": "https://example.com",
      auth: {
        type: "oauth-token",
        clientID: "clientID",
        clientSecret: "clientSecret",
        lastRetrieved: 0
      }
    };
    const profile = new Profile(profileData);

    const profilesHomePath = "#profilesHome";
    
    jest.spyOn(path, "normalize").mockImplementation((path) => path);
    jest.spyOn(ProfileManager, "homeDirPath").mockReturnValue(profilesHomePath);

    const rmSpy = jest.spyOn(fs, "rmdirSync").mockReturnValue(undefined);

    ProfileManager.purgeProfile(profile);

    expect(rmSpy).toHaveBeenCalledTimes(1);
  });

});

// describe("Profile", () => {
//   describe("initialization", () => {
//     it("should initialize basic configuration with empty extended configuration", () => {
//       const data = {
//         name: "testprofile",
//         domain: "https://example.com/",
//         username: "admin",
//         password: "password12345",
//         proxy: "http://user:password@domain:port"
//       };
//       const profile = new Profile(data);
  
//       expect(profile.name).toBe(data.name);
//       expect(profile.domain).toBe(data.domain);
//       expect(profile.username).toBe(data.username);
//       expect(profile.password).toBe(data.password);
//       expect(profile.proxy).toBe(data.proxy);

//       expect(profile.tables.size).toEqual(0);
//       expect(profile.resources.size).toEqual(0);
//       // expect(profile.colors.size).toEqual(0);
//       expect(profile.eslint.size).toEqual(0);
//     });

//     it("should initialize with extended configuration if provided", () => {
//       const data = {
//         name: "testprofile",
//         domain: "https://example.com/",
//         username: "admin",
//         password: "password12345",
//         proxy: "http://user:password@domain:port",
//         tables: {
//           "wf_workflow_version": null
//         },
//         resources: {
//           "links": "N/A"
//         },
//         colors: null,
//         eslint: {
//           "root": true
//         },
//         eslintrc: {
//           "no-console": 1
//         }
//       };
//       const profile = new Profile(data);
  
//       expect(profile.tables.size).toEqual(1);
//       expect(profile.tables.get("wf_workflow_version")).toBeNull();

//       expect(profile.resources.size).toEqual(1);
//       expect(profile.resources.get("links")).toBe("N/A");

//       // expect(profile.colors).not.toBeNull();
//       // expect(profile.colors.size).toEqual(0);

//       expect(profile.eslint.size).toEqual(1);
//       expect(profile.eslint.get("root")).toBeTrue();
//     });
//   });

//   describe("json", () => {
//     it("serialization encodes password and proxy", () => {
//       const data = {
//         name: "testprofile",
//         domain: "https://example.com/",
//         username: "admin",
//         password: "password12345",
//         proxy: "http://user:password@domain:port"
//       };
//       const profile = new Profile(data);
//       // serialize to JSON and deserialze to check
//       const json = JSON.parse(JSON.stringify(profile));
  
//       expect(json.password).toMatch(/^\$\$\$/)
//       expect(json.proxy).toMatch(/^\$\$\$/);
//     });
//   });
// });