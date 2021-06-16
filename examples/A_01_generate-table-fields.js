const fs = require("fs");

// Load the NowLoader
const {Profile} = require("@hrax/now-eslint");

// Configure profile data object
const data = {
  // Profile must have a name!
  name: "script",
  // Can use any address available, including vanity/custom URLs
  domain: "https://exampleinstance.service-now.com",
  // Self explanatory
  username: "",
  password: ""
};

// Must, until the top-level awaits is enabled
(async() => {
  const profile = new Profile(data);
  const instance = profile.createInstance();
  // load table and their parent fields with type script
  const tables = await instance.requestTableAndParentFieldData();
  // set the tables to profile
  profile.setTables(tables);
  // save profile
  fs.writeFileSync("profile.json", JSON.stringify(profile));
})();