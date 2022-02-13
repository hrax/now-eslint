const Assert = require("../../src/util/Assert");

describe("Assert", () => {
  it("#_format formats text with proper values", () => {
    const msg = "A text with a format ref {0} and {1}";
    const expected = "A text with a format ref 1,2,3 and hello world!";

    expect(Assert._format(msg, [1,2,3].join(","), "hello world!")).toBe(expected);
    expect(Assert._format(expected)).toBe(expected);
  });

  it("#notEmpty throws error on empty string or null value", () => {
    const msg = "A string value cannot be empty.";

    expect(() => Assert.notEmpty("", msg)).toThrow(new Error(msg));
    expect(() => Assert.notEmpty(null, msg)).toThrow(new Error(msg));
    expect(() => Assert.notEmpty("Hello World!", msg)).not.toThrow();
  });

  it("#notNull throws error on null value", () => {
    const msg = "A value cannot be null.";

    expect(() => Assert.notNull(null, msg)).toThrow(new Error(msg));
    expect(() => Assert.notNull({}, msg)).not.toThrow();
  });

  it("#notUndefined throws error on undefined value", () => {
    const msg = "A value must be defined.";

    expect(() => Assert.notUndefined(undefined, msg)).toThrow(new Error(msg));
    expect(() => Assert.notUndefined(null, msg)).not.toThrow();
  });

  it("#isTrue throws error on false condition", () => {
    const msg = "A true condition must be defined!";

    expect(() => Assert.isTrue(false, msg)).toThrow(new Error(msg));
    expect(() => Assert.isTrue(false)).toThrowError(/Non-true value/);
    expect(() => Assert.isTrue(true)).not.toThrow();
  });

  it("#isString throws error on non-string value", () => {
    const msg = "A value must be type of String.";

    expect(() => Assert.isString(null, msg)).toThrow(new Error(msg));
    expect(() => Assert.isString("Hello World!", msg)).not.toThrow();
    expect(() => Assert.isString([], msg)).toThrow(new Error(msg));
    expect(() => Assert.isString({}, msg)).toThrow(new Error(msg));
    expect(() => Assert.isString(() => {}, msg)).toThrow(new Error(msg));
    expect(() => Assert.isString(true, msg)).toThrow(new Error(msg));
    expect(() => Assert.isString(15, msg)).toThrow(new Error(msg));
    expect(() => Assert.isString(BigInt(15), msg)).toThrow(new Error(msg));
  });

  it("#isArray throws error on non-array value", () => {
    const msg = "A value must be type of Array.";

    expect(() => Assert.isArray(null, msg)).toThrow(new Error(msg));
    expect(() => Assert.isArray("Hello World", msg)).toThrow(new Error(msg));
    expect(() => Assert.isArray([], msg)).not.toThrow();
    expect(() => Assert.isString({}, msg)).toThrow(new Error(msg));
    expect(() => Assert.isArray(() => {}, msg)).toThrow(new Error(msg));
    expect(() => Assert.isArray(true, msg)).toThrow(new Error(msg));
    expect(() => Assert.isArray(15, msg)).toThrow(new Error(msg));
    expect(() => Assert.isArray(BigInt(15), msg)).toThrow(new Error(msg));
  });

  it("#isObject throws error on non-object value", () => {
    const msg = "A value must be type of Object.";

    expect(() => Assert.isObject(null, msg)).not.toThrow();
    expect(() => Assert.isObject("Hello World", msg)).toThrow(new Error(msg));
    expect(() => Assert.isObject([], msg)).not.toThrow();
    expect(() => Assert.isObject({}, msg)).not.toThrow();
    expect(() => Assert.isObject(() => {}, msg)).toThrow(new Error(msg));
    expect(() => Assert.isObject(true, msg)).toThrow(new Error(msg));
    expect(() => Assert.isObject(15, msg)).toThrow(new Error(msg));
    expect(() => Assert.isObject(BigInt(15), msg)).toThrow(new Error(msg));
  });

  it("#isFunction throws error on non-function value", () => {
    const msg = "A value must be type of Function.";

    expect(() => Assert.isFunction(null, msg)).toThrow(new Error(msg));
    expect(() => Assert.isFunction("Hello World", msg)).toThrow(new Error(msg));
    expect(() => Assert.isFunction([], msg)).toThrow(new Error(msg));
    expect(() => Assert.isString({}, msg)).toThrow(new Error(msg));
    expect(() => Assert.isFunction(() => {}, msg)).not.toThrow();
    expect(() => Assert.isFunction(true, msg)).toThrow(new Error(msg));
    expect(() => Assert.isFunction(15, msg)).toThrow(new Error(msg));
    expect(() => Assert.isFunction(BigInt(15), msg)).toThrow(new Error(msg));
  });

  it("#isBoolean throws error on non-boolean value", () => {
    const msg = "A value must be type of Boolean.";

    expect(() => Assert.isBoolean(null, msg)).toThrow(new Error(msg));
    expect(() => Assert.isBoolean("Hello World", msg)).toThrow(new Error(msg));
    expect(() => Assert.isBoolean([], msg)).toThrow(new Error(msg));
    expect(() => Assert.isString({}, msg)).toThrow(new Error(msg));
    expect(() => Assert.isBoolean(() => {}, msg)).toThrow(new Error(msg));
    expect(() => Assert.isBoolean(false, msg)).not.toThrow();
    expect(() => Assert.isBoolean(15, msg)).toThrow(new Error(msg));
    expect(() => Assert.isBoolean(BigInt(15), msg)).toThrow(new Error(msg));
  });

  it("#isNumber throws error on non-number value", () => {
    const msg = "A value must be type of Number.";

    expect(() => Assert.isNumber(null, msg)).toThrow(new Error(msg));
    expect(() => Assert.isNumber("Hello World", msg)).toThrow(new Error(msg));
    expect(() => Assert.isNumber([], msg)).toThrow(new Error(msg));
    expect(() => Assert.isString({}, msg)).toThrow(new Error(msg));
    expect(() => Assert.isNumber(() => {}, msg)).toThrow(new Error(msg));
    expect(() => Assert.isNumber(true, msg)).toThrow(new Error(msg));
    expect(() => Assert.isNumber(1, msg)).not.toThrow();
    expect(() => Assert.isNumber(1.3, msg)).not.toThrow();
    expect(() => Assert.isNumber(BigInt(15), msg)).toThrow(new Error(msg));
  });

  it("#isBigInt throws error on non-bitint value", () => {
    const msg = "A value must be type of BigInt.";

    expect(() => Assert.isBigInt(null, msg)).toThrow(new Error(msg));
    expect(() => Assert.isBigInt("Hello World", msg)).toThrow(new Error(msg));
    expect(() => Assert.isBigInt([], msg)).toThrow(new Error(msg));
    expect(() => Assert.isString({}, msg)).toThrow(new Error(msg));
    expect(() => Assert.isBigInt(() => {}, msg)).toThrow(new Error(msg));
    expect(() => Assert.isBigInt(true, msg)).toThrow(new Error(msg));
    expect(() => Assert.isBigInt(15, msg)).toThrow(new Error(msg));
    expect(() => Assert.isBigInt(BigInt(1120), msg)).not.toThrow();
  });

  it("#objectContainsAllProperties throws error if not all properties are matched", () => {
    const msg = "An object must contain all properties.";
    const obj = {
      "a": "",
      "b": "",
      "c": "",
      "d": ""
    };

    expect(() => Assert.objectContainsAllProperties(obj, ["a","b","e"], msg)).toThrow(new Error(msg));
    expect(() => Assert.objectContainsAllProperties(obj, ["a","b","d"], msg)).not.toThrow();
  });

  it("#objectContainsSomeProperties throws error if at least one property is not matched", () => {
    const msg = "An object must contain at least one property.";
    const obj = {
      "a": "",
      "b": "",
      "c": "",
      "d": ""
    };

    expect(() => Assert.objectContainsSomeProperties(obj, ["e","f","g"], msg)).toThrow(new Error(msg));
    expect(() => Assert.objectContainsSomeProperties(obj, ["a","e","f"], msg)).not.toThrow();
  });

  it("#isOneOf", () => {
    const msg = "Value 'e' is not present in the provided array 'a, B, c, D'!"
    const oneOf = ["a", "B", "c", "D"];

    expect(() => Assert.isOneOf("e", oneOf)).toThrow(new Error(msg));
    expect(() => Assert.isOneOf("d", oneOf)).not.toThrow();
  });

  it("#isOneOfSensitive", () => {
    const msg = "Value 'd' is not present in the provided array 'a, B, c, D'!"
    const oneOf = ["a", "B", "c", "D"];

    expect(() => Assert.isOneOfSensitive("d", oneOf)).toThrow(new Error(msg));
    expect(() => Assert.isOneOfSensitive("D", oneOf)).not.toThrow();
  });
});