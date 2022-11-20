const template = require("./template.js");

/**
 * Static utility class for asserting method parameters.
 */
class Assert {
  /**
   * No instances
   */
  constructor() {
    throw new Error("Static class, no instances!");
  }

  /**
   * Formats text with {i} placeholders
   * 
   * "Hello ${0}!" with value "world" will become Hello world!
   * 
   * @param {*} message The text to replace
   * @param {...any} args values to replace the placeholders with
   */
  static _format(message) {
    const format = (string) => {
      return (...values) => {
        const dict = values[values.length - 1] || {};
        return string.replace(/\$?{(?:(\d)|(?:"([a-z_-]+)"))}/gmi, (match, index, key) => {
          const value = index != null ? values[index] : dict[key];
          return value || match;
        });
      };
    };

    // Already templated
    if (typeof message === "function") {
      return message;
    }

    // String
    return format(message);
  }

  /**
   * Throws an Error if passed value is undefined, null or an empty String
   * @param {Object} value The value to check
   * @param {String} message The message to throw as an Error
   */
  static notEmpty(value, message) {
    if (value == null || value === "") {
      throw new Error(Assert._format(message || "Empty value detected!")());
    }
  }

  /**
   * Throws an Error if passed value is undefined or null
   * @param {Object} value The value to check
   * @param {String} message The message to throw as an Error
   */
  static notNull(value, message) {
    if (value == null) {
      throw new Error(Assert._format(message || "Null or undefined value detected!")());
    }
  }

  /**
   * Throws an Error if passed value is undefined
   * @param {Object} value The value to check
   * @param {String} message The message to throw as an Error
   */
  static notUndefined(value, message) {
    if ((typeof value === "undefined")) {
      throw new Error(message || "Undefined value detected!");
    }
  }

  /**
   * Throws an Error if passed condition is not true
   * @param {Boolean} condition The condition to verify
   * @param {String} message The message to throw as an Error
   */
  static isTrue(condition, message) {
    Assert.notNull(condition);
    if (!condition) {
      throw new Error(message || "Non-true value detected!");
    }
  }

  /**
   * Throws an Error if passed value is not of type String
   * @param {Object} value The value to check
   * @param {String} message The message to throw as an Error
   */
  static isString(value, message) {
    if ((typeof value !== "string")) {
      throw new Error(message || "Non-string value detected!");
    }
  }

  /**
   * Throws an Error if passed value is not of type Array
   * @param {Object} value The value to check
   * @param {String} message The message to throw as an Error
   */
  static isArray(value, message) {
    if (!Array.isArray(value)) {
      throw new Error(message || "Non-array value detected!");
    }
  }

  /**
   * Throws an Error if passed value is not of type Object
   * @param {Object} value The value to check
   * @param {String} message The message to throw as an Error
   */
  static isObject(value, message) {
    if ((typeof value !== "object")) {
      throw new Error(message || "Non-object value detected!");
    }
  }

  /**
   * Throws an Error if passed value is not of type Function
   * @param {Object} value The value to check
   * @param {String} message The message to throw as an Error
   */
  static isFunction(value, message) {
    if ((typeof value !== "function")) {
      throw new Error(message || "Non-function value detected!");
    }
  }

  /**
   * Throws an Error if passed value is not of type boolean
   * @param {Object} value The value to check
   * @param {String} message The message to throw as an Error
   */
  static isBoolean(value, message) {
    if ((typeof value !== "boolean")) {
      throw new Error(message || "Non-boolean value detected!");
    }
  }

  /**
   * Throws an Error if passed value is not of type Number
   * @param {Object} value The value to check
   * @param {String} message The message to throw as an Error
   */
  static isNumber(value, message) {
    if ((typeof value !== "number")) {
      throw new Error(message || "Non-number value detected!");
    }
  }

  /**
   * Throws an Error if passed value is not of type BigInt
   * @param {Object} value The value to check
   * @param {String} message The message to throw as an Error
   */
  static isBigInt(value, message) {
    if ((typeof value !== "bigint")) {
      throw new Error(message || "Non-bigint value detected!");
    }
  }

  /**
   * Throws an Error if passed obj does not contain all of the specified properties
   * @param {Object} obj The object to check
   * @param {Array} props The properties to check for
   * @param {String} message The message to throw as an Error
   */
  static objectContainsAllProperties(obj, props, message) {
    Assert.notNull(obj);
    Assert.notNull(props);
    Assert.isObject(obj);
    Assert.isArray(props);

    
    const keys = Object.keys(obj);
    if (!props.every((key) => keys.indexOf(key) !== -1)) {
      throw new Error(Assert._format(message || "Object does not contain all properties!")(props.join(",")));
    }
  }

  /**
   * Throws an Error if passed obj does not contain some of the specified properties
   * @param {Object} obj The object to check
   * @param {Array} props The properties to check for
   * @param {String} message The message to throw as an Error
   */
  static objectContainsSomeProperties(obj, props, message) {
    Assert.notNull(obj);
    Assert.notNull(props);
    Assert.isObject(obj);
    Assert.isArray(props);

    const keys = Object.keys(obj);
    if (!props.some((key) => keys.indexOf(key) !== -1)) {
      throw new Error(Assert._format(message || "Object does not contain some properties!")(props.join(",")));
    }
  }

  static isOneOf(value, array, message) {
    Assert.notNull(value);
    Assert.isArray(array);

    const found = array.find((item) => value.toLowerCase() === item.toLowerCase());
    if (found === undefined) {
      throw new Error(Assert._format(message || template`Value '${0}' is not present in the provided array '${1}'!`)(value, array.join(", ")));
    }
  }

  static isOneOfSensitive(value, array, message) {
    Assert.notNull(value);
    Assert.isArray(array);

    const found = array.find((item) => value === item);
    if (found === undefined) {
      throw new Error(Assert._format(message || template`Value '${0}' is not present in the provided array '${1}'!`)(value, array.join(", ")));
    }
  }

  static isInstance(value, clazz, message) {
    if (!(value instanceof clazz)) {
      throw new Error(Assert._format(message || template`Value '${0}' is not instance of '${1}'!`)(value.name || value, clazz.name || clazz));
    }
  }
}

module.exports = Assert;