/* eslint-disable no-magic-numbers */
const PDFReportGenerator = require("../../modules/generator/PDFReportGenerator.js");
const UpdateXMLScan = require("../../modules/linter/UpdateXMLScan.js");

xdescribe("PDFReportGenerator", () => {
  let data = {};

  beforeEach(() => {
    data = {
      domain: "domain",
      username: "username",
      title: "title",
      query: "query",
      changes: [
        ["change1", 
          {
            targetName: "targetName1",
            type: "type1",
            id: "id1",
            createdBy: "createdBy1",
            createdOn: "createdOn1",
            updatedBy: "updatedBy1",
            updatedOn: "updatedOn1",
            status: UpdateXMLScan.STATUS.WARNING,
            action: "INSERT_OR_UPDATE",
            updates: "1",
            errorCount: "0",
            warningCount: "1",
            updateSet: "updateSet1",
            targetTable: "targetTable1",
            targetId: "targetId1",
            reports: [
              ["script1", {
                messages: [
                  {
                    line: 1,
                    column: 1,
                    severity: 1,
                    ruleId: "no-console",
                    message: "message1"
                  }
                ]
              }]
            ]
          }
        ],
        ["change2", 
          {
            targetName: "targetName2",
            type: "type2",
            id: "id2",
            createdBy: "createdBy2",
            createdOn: "createdOn2",
            updatedBy: "updatedBy2",
            updatedOn: "updatedOn2",
            status: UpdateXMLScan.STATUS.ERROR,
            action: "INSERT_OR_UPDATE",
            updates: "1",
            errorCount: "1",
            warningCount: "0",
            updateSet: "updateSet2",
            targetTable: "targetTable2",
            targetId: "targetId2",
            reports: [
              ["script2", {
                messages: [
                  {
                    line: 1,
                    column: 1,
                    severity: 2,
                    ruleId: "no-undef",
                    message: "message"
                  }
                ]
              }]
            ]
          }
        ]
      ],
      resources: {
        "overview-resources": [{
          label: "Google",
          link: "http://example.com"
        }]
      }
    };
  });

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
    expect(content[29].table.body[1][1].text).toBe(data.changes[1][1].targetName);

    // Findings
    expect(content[31].text).toBe("Report findings");
    expect(content[33].text).toBe(`${data.changes[0][1].targetName} (${data.changes[0][1].type})`);
    // check the findings report table
    expect(content[37].text).toBe(`Report for field '${data.changes[0][1].reports[0][0]}'`);
    expect(content[38].table.body[1][0].text).toBe(`${data.changes[0][1].reports[0][1].messages[0].line}:${data.changes[0][1].reports[0][1].messages[0].column}`);
    expect(content[38].table.body[1][1].text).toBe(`Warning`);
    expect(content[38].table.body[1][2].text).toBe(`${data.changes[0][1].reports[0][1].messages[0].ruleId}`);
    expect(content[38].table.body[1][3].text).toBe(`${data.changes[0][1].reports[0][1].messages[0].message}`);

  });

  it("builds report with no findings", () => {
    data.changes = [];

    const generator = new PDFReportGenerator();
    const document = generator.build(data);
    const content = document.content;

    // Check that the document content is generated
    expect(content).not.toBeUndefined();
    expect(content).not.toBeNull();

    // Findings
    expect(content[29].text).toBe("Report findings");
    expect(content[31].text[0]).toBe("No changes were found...");
  })

  it("builds report with manual findings in report summary", () => {
    data.changes[0][1].status = UpdateXMLScan.STATUS.MANUAL;

    const generator = new PDFReportGenerator();
    const document = generator.build(data);
    const content = document.content;

    // Check that the document content is generated
    expect(content).not.toBeUndefined();
    expect(content).not.toBeNull();

    // Report summary
    expect(content[23].text).toBe("Report summary");
    expect(content[25].text[1].text).toBe(data.domain);
    expect(content[26].text[1].text).toBe(data.query);
    expect(content[27].text[1].text).toBe(data.changes.length + "");

    // if changes has errors & manuals, there should be a table in summary
    expect(content[29].table.body[1][1].text).toBe(data.changes[0][1].targetName);
    expect(content[29].table.body[2][1].text).toBe(data.changes[1][1].targetName);
  });
});