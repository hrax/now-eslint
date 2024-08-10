import fs, { Stats } from "fs";
import path from "path";
import { InstanceConfig, Profile, ProfileInfo, ProfileManager, TableConfig } from "../../core/ProfileManager";
import { RESTClient } from "../../core/RESTClient";
import { OAuthClient } from "../../core/OAuthClient";
import { profile } from "console";

describe("ProfileManagerSpec", () => {
  const dev1Profile = {
    name: "dev1",
    baseUrl: "https://dev1.example.com"
  };
  const dev2Profile = {
    name: "dev2",
    baseUrl: "https://dev2.example.com"
  };

  it("should list all available profiles", () => {
    const expected: Array<ProfileInfo> = [dev1Profile,dev2Profile];

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
    }

    const profilesHomePath = "#profilesHome";
    spyOn(path, "normalize").and.callFake((path) => path);
    spyOn(ProfileManager, "profilesHomeDirPath").and.returnValue(profilesHomePath);
    spyOn(ProfileManager, "pathFor").and.callFake((name, file) => `${profilesHomePath}/${name}/${file}`);
    // @ts-ignore
    spyOn(fs, "readdirSync").withArgs(profilesHomePath).and.returnValue(["dev1", "dev2"]);
    // @ts-ignore
    spyOn(fs, "statSync").and.callFake((path) => {
      return dirStats;
    })
    spyOn(fs, "existsSync").and.returnValue(true);
    spyOn(fs, "readFileSync")
      .withArgs(`${profilesHomePath}/dev1/profile.json`, 'utf8').and.returnValue(JSON.stringify(expected[0]))
      .withArgs(`${profilesHomePath}/dev2/profile.json`, 'utf8').and.returnValue(JSON.stringify(expected[1]));

    const profiles: Array<ProfileInfo> = ProfileManager.listProfiles();
    // deep equal
    expect(profiles).toEqual(expected);
  });

  it("should purge all existing profiles", () => {
    const profilesHomePath = "#profilesHome";
    const profilesHomeDirPathSpy = spyOn(ProfileManager, "profilesHomeDirPath").and.returnValue(profilesHomePath);

    const rmSpy = spyOn(fs, "rmdirSync");
    ProfileManager.purgeProfiles();

    expect(profilesHomeDirPathSpy).toHaveBeenCalled();
    expect(rmSpy).toHaveBeenCalledOnceWith(profilesHomePath, {recursive: true})
  });

  it("should load selected profile", async () => {
    const profilesHomePath = "#profilesHome";
    const profileName = "dev1";

    spyOn(path, "normalize").and.callFake((path) => path);
    spyOn(ProfileManager, "profilesHomeDirPath").and.returnValue(profilesHomePath);
    spyOn(ProfileManager, "pathFor").and.callFake((name, file) => `${profilesHomePath}/${name}/${file}`);

    spyOn(fs, "existsSync").and.returnValue(true);
    spyOn(fs, "readFileSync")
      .withArgs(`${profilesHomePath}/${profileName}/profile.json`, 'utf8').and.returnValue(JSON.stringify(dev1Profile))

    // need to stub profile.loadTableConfiguration...
    const oauthClient = new OAuthClient();
    const restClient = new RESTClient(oauthClient);

    const restClientSpy = spyOn(restClient, "getTableConfiguration")
      .and.resolveTo({
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
    
    spyOn(path, "normalize").and.callFake((path) => path);
    spyOn(ProfileManager, "profilesHomeDirPath").and.returnValue(profilesHomePath);
    spyOn(ProfileManager, "pathFor").and.callFake((name, file) => `${profilesHomePath}/${name}/${file}`);

    spyOn(fs, "existsSync").and.returnValue(true);
    const writeSpy = spyOn(fs, "writeFileSync")
      .withArgs(jasmine.anything(), jasmine.anything(), jasmine.anything()).and.stub();

    ProfileManager.saveProfile(profile);

    expect(writeSpy).toHaveBeenCalledOnceWith(jasmine.anything(), JSON.stringify(profileData, null, 2), jasmine.anything());
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
    
    spyOn(path, "normalize").and.callFake((path) => path);
    spyOn(ProfileManager, "profilesHomeDirPath").and.returnValue(profilesHomePath);
    spyOn(ProfileManager, "pathFor").and.callFake((name, file) => `${profilesHomePath}/${name}/${file}`);

    spyOn(fs, "existsSync").and.returnValue(true);
    const writeSpy = spyOn(fs, "writeFileSync")
      .withArgs(jasmine.anything(), jasmine.anything(), jasmine.anything()).and.stub();

    ProfileManager.updateProfileConfig(profile);

    expect(writeSpy).toHaveBeenCalledOnceWith(jasmine.anything(), JSON.stringify(profileData, null, 2), jasmine.anything());
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
    
    spyOn(path, "normalize").and.callFake((path) => path);
    spyOn(ProfileManager, "profilesHomeDirPath").and.returnValue(profilesHomePath);

    const rmSpy = spyOn(fs, "rmdirSync")
      .withArgs(jasmine.anything(), {recursive: true}).and.stub();

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