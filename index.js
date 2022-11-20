const Linter = require("./modules/linter/Linter.js");
const Profile = require("./modules/linter/Profile.js");

// eslint-disable-next-line no-multi-assign
exports = module.exports = Linter;

// export modules + explicit access to Linter
exports.Linter = Linter;
exports.Profile = Profile;