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
});