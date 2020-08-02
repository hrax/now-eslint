const Assert = require("../src/Assert.js");

describe("Assert", () => {
  it("#notEmpty throws error on empty string value", () => {
    let value = "";
    let msg = "A string value cannot be empty.";

    expect(() => Assert.notEmpty(value, msg)).toThrow(new Error(msg));
  });

  it("#notEmpty throws error on null value", () => {
    let value = null;
    let msg = "A value cannot be null.";

    expect(() => Assert.notEmpty(value, msg)).toThrow(new Error(msg));
  });

  it("#notEmpty does not throw error on non-empty value", () => {
    let value = "Hello World!";
    let msg = "A value cannot be null.";

    expect(() => Assert.notEmpty(value, msg)).not.toThrow();
  });

  it("#notNull throws error on null value", () => {
    let value = null;
    let msg = "A value cannot be null.";

    expect(() => Assert.notNull(value, msg)).toThrow(new Error(msg));
  });

  it("#notNull does not throw error on non-null value", () => {
    let value = new Object;
    let msg = "A value cannot be null.";

    expect(() => Assert.notNull(value, msg)).not.toThrow();
  });

  it("#notUndefined throws error on undefined value", () => {
    let value = undefined;
    let msg = "A value must be defined.";

    expect(() => Assert.notUndefined(value, msg)).toThrow(new Error(msg));
  });

  it("#notUndefined does not throw error on defined value", () => {
    let value = null;
    let msg = "A value must be defined.";

    expect(() => Assert.notUndefined(value, msg)).not.toThrow();
  });

  // isString
  it("#isString throws error on non-string value", () => {
    let msg = "A value must be type of String.";

    expect(() => Assert.isString(null, msg)).toThrow(new Error(msg));
    expect(() => Assert.isString([], msg)).toThrow(new Error(msg));
    expect(() => Assert.isString(() => {}, msg)).toThrow(new Error(msg));
    expect(() => Assert.isString(true, msg)).toThrow(new Error(msg));
    expect(() => Assert.isString(15, msg)).toThrow(new Error(msg));
    expect(() => Assert.isString(BigInt(15), msg)).toThrow(new Error(msg));
  });

  it("#isString does not throw error on string value", () => {
    let msg = "A value must be type of String.";

    expect(() => Assert.isString("Hello World!", msg)).not.toThrow();
  });

  // isArray
  it("#isArray throws error on non-array value", () => {
    let msg = "A value must be type of Array.";

    expect(() => Assert.isArray(null, msg)).toThrow(new Error(msg));
    expect(() => Assert.isArray("Hello World", msg)).toThrow(new Error(msg));
    expect(() => Assert.isArray(() => {}, msg)).toThrow(new Error(msg));
    expect(() => Assert.isArray(true, msg)).toThrow(new Error(msg));
    expect(() => Assert.isArray(15, msg)).toThrow(new Error(msg));
    expect(() => Assert.isArray(BigInt(15), msg)).toThrow(new Error(msg));
  });

  it("#isArray does not throw error on array value", () => {
    let msg = "A value must be type of Array.";

    expect(() => Assert.isArray([], msg)).not.toThrow();
  });

  // isFunction
  it("#isFunction throws error on non-function value", () => {
    let msg = "A value must be type of Function.";

    expect(() => Assert.isFunction(null, msg)).toThrow(new Error(msg));
    expect(() => Assert.isFunction("Hello World", msg)).toThrow(new Error(msg));
    expect(() => Assert.isFunction([], msg)).toThrow(new Error(msg));
    expect(() => Assert.isFunction(true, msg)).toThrow(new Error(msg));
    expect(() => Assert.isFunction(15, msg)).toThrow(new Error(msg));
    expect(() => Assert.isFunction(BigInt(15), msg)).toThrow(new Error(msg));
  });

  it("#isFunction does not throw error on function value", () => {
    let msg = "A value must be type of Function.";

    expect(() => Assert.isFunction(() => {}, msg)).not.toThrow();
  });

  // isBoolean
  it("#isBoolean throws error on non-boolean value", () => {
    let msg = "A value must be type of Boolean.";

    expect(() => Assert.isBoolean(null, msg)).toThrow(new Error(msg));
    expect(() => Assert.isBoolean("Hello World", msg)).toThrow(new Error(msg));
    expect(() => Assert.isBoolean([], msg)).toThrow(new Error(msg));
    expect(() => Assert.isBoolean(() => {}, msg)).toThrow(new Error(msg));
    expect(() => Assert.isBoolean(15, msg)).toThrow(new Error(msg));
    expect(() => Assert.isBoolean(BigInt(15), msg)).toThrow(new Error(msg));
  });

  it("#isBoolean does not throw error on boolean value", () => {
    let msg = "A value must be type of Boolean.";

    expect(() => Assert.isBoolean(false, msg)).not.toThrow();
  });

  // isNumber
  it("#isNumber throws error on non-number value", () => {
    let msg = "A value must be type of Number.";

    expect(() => Assert.isNumber(null, msg)).toThrow(new Error(msg));
    expect(() => Assert.isNumber("Hello World", msg)).toThrow(new Error(msg));
    expect(() => Assert.isNumber([], msg)).toThrow(new Error(msg));
    expect(() => Assert.isNumber(() => {}, msg)).toThrow(new Error(msg));
    expect(() => Assert.isNumber(true, msg)).toThrow(new Error(msg));
    expect(() => Assert.isNumber(BigInt(15), msg)).toThrow(new Error(msg));
  });

  it("#isNumber does not throw error on number value", () => {
    let msg = "A value must be type of Number.";

    expect(() => Assert.isNumber(1, msg)).not.toThrow();
    expect(() => Assert.isNumber(1.3, msg)).not.toThrow();
  });

  // isBigInt
  it("#isBigInt throws error on non-bitint value", () => {
    let msg = "A value must be type of BigInt.";

    expect(() => Assert.isBigInt(null, msg)).toThrow(new Error(msg));
    expect(() => Assert.isBigInt("Hello World", msg)).toThrow(new Error(msg));
    expect(() => Assert.isBigInt([], msg)).toThrow(new Error(msg));
    expect(() => Assert.isBigInt(() => {}, msg)).toThrow(new Error(msg));
    expect(() => Assert.isBigInt(true, msg)).toThrow(new Error(msg));
    expect(() => Assert.isBigInt(15, msg)).toThrow(new Error(msg));
  });

  it("#isBigInt does not throw error on bigint value", () => {
    let msg = "A value must be type of BigInt.";

    expect(() => Assert.isBigInt(BigInt(1120), msg)).not.toThrow();
  });
});