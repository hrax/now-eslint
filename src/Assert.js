
class Assert {
  static _format(text, ...args) {
    let s = text || "",
        i = args.length || 0;

    while (i--) {
        s = s.replace(new RegExp('\\{' + i + '\\}', 'gm'), args[i]);
    }
    return s;
};

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

  static isObject(value, message) {
    if ((typeof value !== "object")) {
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

  static objectContainsAllProperties(obj, props, message) {
    Assert.notNull(obj);
    Assert.notNull(props);
    Assert.isObject(obj);
    Assert.isArray(props);

    const keys = Object.keys(obj);
    if (!props.every((key) => keys.indexOf(key) !== -1)) {
      throw new Error(message);
    }
  }

  static objectContainsAllProperties(obj, props, message) {
    Assert.notNull(obj);
    Assert.notNull(props);
    Assert.isObject(obj);
    Assert.isArray(props);

    const keys = Object.keys(obj);
    if (!props.every((key) => keys.indexOf(key) !== -1)) {
      throw new Error(Assert._format(message, props.join(",")));
    }
  }

  static objectContainsSomeProperties(obj, props, message) {
    Assert.notNull(obj);
    Assert.notNull(props);
    Assert.isObject(obj);
    Assert.isArray(props);

    const keys = Object.keys(obj);
    if (!props.some((key) => keys.indexOf(key) !== -1)) {
      throw new Error(Assert._format(message, props.join(",")));
    }
  }
}

module.exports = Assert;