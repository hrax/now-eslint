const Profile = require("../../modules/linter/Profile.js");

describe("Profile", () => {
  describe("initialization", () => {
    it("should initialize basic configuration with empty extended configuration", () => {
      const data = {
        name: "testprofile",
        domain: "https://example.com/",
        username: "admin",
        password: "password12345",
        proxy: "http://user:password@domain:port"
      };
      const profile = new Profile(data);
  
      expect(profile.name).toBe(data.name);
      expect(profile.domain).toBe(data.domain);
      expect(profile.username).toBe(data.username);
      expect(profile.password).toBe(data.password);
      expect(profile.proxy).toBe(data.proxy);

      expect(profile.tables.size).toEqual(0);
      expect(profile.resources.size).toEqual(0);
      expect(profile.colors.size).toEqual(0);
      expect(profile.eslint.size).toEqual(0);
    });

    it("should initialize with extended configuration if provided", () => {
      const data = {
        name: "testprofile",
        domain: "https://example.com/",
        username: "admin",
        password: "password12345",
        proxy: "http://user:password@domain:port",
        tables: {
          "wf_workflow_version": null
        },
        resources: {
          "links": "N/A"
        },
        colors: null,
        eslint: {
          "root": true
        },
        eslintrc: {
          "no-console": 1
        }
      };
      const profile = new Profile(data);
  
      expect(profile.tables.size).toEqual(1);
      expect(profile.tables.get("wf_workflow_version")).toBeNull();

      expect(profile.resources.size).toEqual(1);
      expect(profile.resources.get("links")).toBe("N/A");

      expect(profile.colors).not.toBeNull();
      expect(profile.colors.size).toEqual(0);

      expect(profile.eslint.size).toEqual(1);
      expect(profile.eslint.get("root")).toBeTrue();
    });
  });

  describe("json", () => {
    it("serialization encodes password and proxy", () => {
      const data = {
        name: "testprofile",
        domain: "https://example.com/",
        username: "admin",
        password: "password12345",
        proxy: "http://user:password@domain:port"
      };
      const profile = new Profile(data);
      // serialize to JSON and deserialze to check
      const json = JSON.parse(JSON.stringify(profile));
  
      expect(json.password).toMatch(/^\$\$\$/)
      expect(json.proxy).toMatch(/^\$\$\$/);
    });
  });
});