/* eslint-disable no-magic-numbers */
const template = require("../../modules/util/template.js");

describe("template", () => {
  it("formats text with index values", () => {
    const msgT = template`A text with a format ref ${0} and ${1}`;
    const expectedT = template`A text with a format ref 1,2,3 and hello world!`;
    const expected = "A text with a format ref 1,2,3 and hello world!";

    expect(msgT([1,2,3].join(","), "hello world!")).toBe(expected);
    expect(expectedT()).toBe(expected);
  });

  it("formats text with dictionary values", () => {
    const msgT = template`A text with a format ref ${"foo"} and ${"bar"}`;
    const expectedT = template`A text with a format ref 1,2,3 and hello world!`;
    const expected = "A text with a format ref 1,2,3 and hello world!";

    expect(msgT({
      "foo": [1,2,3].join(","),
      "bar": "hello world!"
    })).toBe(expected);

    expect(expectedT()).toBe(expected);
  });

  it("formats text with dictionary camel-case values", () => {
    const msgT = template`A text with a format ref ${"fooFoo"} and ${"fooBar"}`;
    const expectedT = template`A text with a format ref 1,2,3 and hello world!`;
    const expected = "A text with a format ref 1,2,3 and hello world!";

    expect(msgT({
      "fooFoo": [1,2,3].join(","),
      "fooBar": "hello world!"
    })).toBe(expected);

    expect(expectedT()).toBe(expected);
  });

  it("formats text with dictionary hyphen values", () => {
    const msgT = template`A text with a format ref ${"foo-foo"} and ${"foo-bar"}`;
    const expectedT = template`A text with a format ref 1,2,3 and hello world!`;
    const expected = "A text with a format ref 1,2,3 and hello world!";

    expect(msgT({
      "foo-foo": [1,2,3].join(","),
      "foo-bar": "hello world!"
    })).toBe(expected);

    expect(expectedT()).toBe(expected);
  });

  it("formats text with dictionary underscore values", () => {
    const msgT = template`A text with a format ref ${"foo_foo"} and ${"foo_bar"}`;
    const expectedT = template`A text with a format ref 1,2,3 and hello world!`;
    const expected = "A text with a format ref 1,2,3 and hello world!";

    expect(msgT({
      "foo_foo": [1,2,3].join(","),
      "foo_bar": "hello world!"
    })).toBe(expected);

    expect(expectedT()).toBe(expected);
  });

});