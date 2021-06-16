const NowProfile = require("../src/NowProfile");

describe("NowProfile", () => {
  it("profile init", () => {
    const data = {
      name: "testprofile",
      domain: "https://example.com/",
      username: "admin",
      password: "password12345"
    };
    const profile = new NowProfile(data);

    expect(profile.name).toBe(data.name);
    expect(profile.domain).toBe(data.domain);
    expect(profile.username).toBe(data.username);
    expect(profile.password).toBe(data.password);
  });

  it("fails to init on non-matching package version", () => {
    const data = {
      name: "testprofile",
      domain: "https://example.com/",
      username: "admin",
      password: "password12345",
      version: "0.0.1"
    };

    expect(() => new NowProfile(data)).toThrowError();
  });

  it("properly sets properties map", () => {
    const data = {
      name: "testprofile",
      domain: "https://example.com/",
      username: "admin",
      password: "password12345",
      properties: {
        eslint: {
          "custom1": "a",
          "custom2": "b"
        },
        resources: [
          {
            label: "aaa",
            link: "http://example.com"
          },
          {
            label: "bbb",
            link: "http://example.com"
          }
        ]
      }
    };

    const profile = new NowProfile(data);
    
    expect(profile.properties.has("eslint")).toBeTrue();
    expect(profile.properties.has("resources")).toBeTrue();
    
    const eslint = profile.properties.get("eslint");

    expect(eslint.custom1).toBe("a");

    const resources = profile.properties.get("resources");

    expect(resources[0].label).toBe("aaa");
  });
});