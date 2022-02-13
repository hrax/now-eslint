/* eslint-disable no-magic-numbers */
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
      resources: {
        "overview-resources": [{
          label: "Google",
          link: "http://example.com"
        }]
      }
    };
  })

  it("builds document body", () => {
    const generator = new PDFReportGenerator();
    const document = generator.build(data);
    const content = document.content;

    // Check that the document content is generated
    expect(content).not.toBeUndefined();
    expect(content).not.toBeNull();

    // Title
    expect(content[0].text.endsWith(data.title)).toBeTrue();
    
    // TOC; contents are generated automatically by the parser
    expect(content[5].text).toBe("Table of Contents");
    
    // Report overview section
    expect(content[9].text).toBe("Report overview");
    
    // Status description & table
    expect(content[15].text).toBe("Status description");
    expect(content[16].table.body[1][0].text).toBe("DELETED");
    
    // Resources & additional resources
    expect(content[17].text).toBe("Resources");
    expect(content[21].ul.length).toBe(data.resources["overview-resources"].length);
    content[21].ul.forEach((item, idx) => {
      expect(item.text).toBe(data.resources["overview-resources"][idx].label);
      expect(item.link).toBe(data.resources["overview-resources"][idx].link);
    });

    // Report summary
    expect(content[23].text).toBe("Report summary");
    expect(content[25].text[1].text).toBe(data.domain);
    expect(content[26].text[1].text).toBe(data.query);
    expect(content[27].text[1].text).toBe(data.changes.length + "");

    // if changes has errors, there should be an error table

    // Findings
    expect(content[29].text).toBe("Findings");
    expect(content[31].text[0]).toBe("No changes were found...");
  });
});