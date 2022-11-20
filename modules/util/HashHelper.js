const crypto = require("crypto");

class HashHelper {
  /**
   * No instances
   */
  constructor() {
    throw new Error("Static class, no instances!");
  }

  static cleanup(string) {
    if (string == null) {
      return "";
    }
    return string.trim()
      .toLowerCase()
      .replace(/\s/gm, "");
  }

  static hash(string) {
    string = HashHelper.cleanup(string);
    return "x" + string.length + crypto.createHash("sha256")
      .update(string)
      .digest("hex");
  }

  static matches(string, hash) {
    // Hash not set or not a hash
    if (hash == null || !hash.match(/^x\d/i)) {
      return false;
    }

    string = HashHelper.cleanup(string);

    // Hash quick check
    if (!hash.startsWith("x" + string.length)) {
      return false;
    }

    const newHash = HashHelper.hash(string);
    return hash === newHash;
  }
}

module.exports = HashHelper;