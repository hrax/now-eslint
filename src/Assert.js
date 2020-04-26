
class Assert {
  static notEmpty(value, message) {
    if (value == null || value === "") {
      throw new Error(message);
    }
  }

  static notNull(value, message) {
    if (value == null) {
      throw new Error(message);
    }
  }

  static notUndefined(value, message) {
    if ((typeof value === "undefined")) {
      throw new Error(message);
    }
  }

  static isString(value, message) {
    if ((typeof value !== "string")) {
      throw new Error(message);
    }
  }

  static isArray(value, message) {
    if (!Array.isArray(value)) {
      throw new Error(message);
    }
  }

  static isFunction(value, message) {
    if ((typeof value !== "function")) {
      throw new Error(message);
    }
  }

  static isBoolean(value, message) {
    if ((typeof value !== "boolean")) {
      throw new Error(message);
    }
  }

  static isNumber(value, message) {
    if ((typeof value !== "number")) {
      throw new Error(message);
    }
  }

  static isBigInt(value, message) {
    if ((typeof value !== "bigint")) {
      throw new Error(message);
    }
  }
}

module.exports = Assert;