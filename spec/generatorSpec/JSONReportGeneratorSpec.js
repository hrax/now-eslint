const JSONReportGenerator = require("../../src/generator/JSONReportGenerator");

describe("JSONReportGenerator", () => {
  let data = {}

  beforeAll(() => {
    data = {
      domain: "domain",
      username: "username",
      title: "title",
      query: "query",
      changes: [],
      resources: {}
    };
  })

  it("builds document body", () => {
    const generator = new JSONReportGenerator();
    const document = generator.build(data);

    // Just check that output is string and 2nd line starts with 2 spaces
    expect(document).toBeInstanceOf(String);
    expect(document).toMatch(/^\{\n  .*/);
  });
});