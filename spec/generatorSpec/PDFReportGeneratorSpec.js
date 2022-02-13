const PDFReportGenerator = require("../../src/generator/PDFReportGenerator");

describe("PDFReportGenerator", () => {
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
    const generator = new PDFReportGenerator();
    const document = generator.build(data);

    // Check that the document content is generated
  });
});