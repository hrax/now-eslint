const crypto = require("crypto");
const template = require("./template.js");

const HASH_PREFIX = template`8e${0}`;
const HASH_PREFIX_RE = new RegExp("^" + HASH_PREFIX("\\d+"), "i");

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
    const cleaned = HashHelper.cleanup(string);
    const prefix = HASH_PREFIX(cleaned.length);
    return prefix + crypto.createHash("sha256")
      .update(prefix)
      .update(cleaned)
      .digest("hex");
  }

  static matches(string, hash) {
    // Hash not set or not a hash
    if (hash == null || !hash.match(HASH_PREFIX_RE)) {
      return false;
    }

    // Hash quick check
    const cleaned = HashHelper.cleanup(string);
    if (!hash.startsWith(HASH_PREFIX(cleaned.length))) {
      return false;
    }

    const newHash = HashHelper.hash(string);
    return hash === newHash;
  }
}

module.exports = HashHelper;