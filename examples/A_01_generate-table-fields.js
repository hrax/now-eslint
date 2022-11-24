const {Profile} = require("../index.js");
// const {Profile} = require("@hrax/now-eslint");

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
  // Create Profile
  const profile = new Profile(data);
  // Load table data from the instance
  await profile.loadInstanceTables();
  // Save the profile to the profile home directory
  Profile.save(profile);
})();