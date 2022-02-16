const JSONReportGenerator = require("../../src/generator/JSONReportGenerator");

const UpdateXMLScan = require("../../src/UpdateXMLScan");

describe("JSONReportGenerator", () => {
  let data = {}

  beforeAll(() => {
    data = {
      domain: "domain",
      username: "username",
      title: "title",
      query: "query",
      changes: [
        ["change1", 
          {
            targetName: "targetName",
            type: "type",
            id: "id",
            createdBy: "createdBy",
            createdOn: "createdOn",
            updatedBy: "updatedBy",
            updatedOn: "updatedOn",
            status: UpdateXMLScan.STATUS.ERROR,
            action: "INSERT_OR_UPDATE",
            updates: "1",
            errorCount: "1",
            warningCount: "0",
            updateSet: "updateSet",
            targetTable: "targetTable",
            targetId: "targetId",
            reports: [
              ["script", {
                messages: [
                  {
                    line: 1,
                    column: 1,
                    severity: 2,
                    ruleId: "no-console",
                    message: "message"
                  }
                ]
              }]
            ]
          }
        ],
        ["change2", 
          {
            targetName: "targetName",
            type: "type",
            id: "id",
            createdBy: "createdBy",
            createdOn: "createdOn",
            updatedBy: "updatedBy",
            updatedOn: "updatedOn",
            status: UpdateXMLScan.STATUS.WARNING,
            action: "INSERT_OR_UPDATE",
            updates: "1",
            errorCount: "0",
            warningCount: "1",
            updateSet: "updateSet",
            targetTable: "targetTable",
            targetId: "targetId",
            reports: [
              ["script", {
                messages: [
                  {
                    line: 1,
                    column: 1,
                    severity: 1,
                    ruleId: "no-console",
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
    const generator = new JSONReportGenerator();
    const document = generator.build(data);

    // Just check that output is string and 2nd line starts with 2 spaces
    expect(document).toBeInstanceOf(String);
    expect(document).toMatch(/^\{\n  .*/);
  });
});