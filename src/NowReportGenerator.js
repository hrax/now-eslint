const pdfmake = require("pdfmake");
const fs = require("fs");

/**
 * Report generator
 */
class NowReportGenerator {
  constructor(def) {
    this.docDef = def || {};
  }

  setFonts(fonts) {
    this.fonts = fonts;
  }

  setTableLayouts(layouts) {
    this.tableLayouts = layouts;
  }

  setDefinitionProperty(prop, value) {
    this.docDef[prop] = value;
  }

  setContent(content) {
    this.docDef.content = content;
  }

  addContent(content) {
    if (!this.docDef.content) {
      this.docDef.content = [];
    }
    content.forEach((item) => this.docDef.content.push(item));
  }

  addPageBreak() {
    this.addContent([
      {
        text: "",
        pageBreak: "after"
      }
    ]);
  }

  addParagraph(content) {
    this.addContent([
      {
        text: content,
        style: "paragraph"
      }
    ]);
  }

  addHeading(heading) {
    this.addContent([
      {
        text: heading,
        style: "heading1",
        tocItem: true
      },
      {
        margin: [0, -5, 0, 10],
        canvas: [
          {
            type: "line",
            x1: 0, y1: 0,
            x2: 515.28, y2: 0,
            lineWidth: 0.5,
            lineColor: "#dee2e6"
          }
        ]
      }
    ]);
  }

  generateReportTitle(title) {
    const content = [{
      text: `\n\n\n\n\n\n\n\n\n\n${title}`,
      style: "title"
    }];

    // TODO: if subtitle
    content.push({
      text: "A ServiceNow ESLint Report",
      style: "small",
      bold: true,
      alignment: "center",
      margin: [0, -5, 0, 5]
    });
    content.push({
      margin: [0, 0, 0, 10],
      canvas: [
        {
          type: "line",
          x1: 50,
          x2: 465.28,
          y1: 0,
          y2: 0,
          lineWidth: 0.5,
          lineColor: "#dee2e6"
        }
      ]
    });
    content.push({
      text: new Date().toLocaleString("en-US", {
        day: "numeric", // numeric, 2-digit
        year: "numeric", // numeric, 2-digit
        month: "long" // numeric, 2-digit, long, short, narrow
      }),
      style: "small",
      alignment: "center",
      margin: [0, -5, 0, 5]
    });
    this.addContent(content);
    this.addPageBreak();
  }

  generateToc() {
    this.addContent([
      {
        toc: {
          title: {text: "Table of Contents", style: "heading1"}
        }
      }
    ]);
    this.addPageBreak();
  }

  generateLegalNotice() {
    const pkg = require("../package.json");
    this.addHeading("Legal Disclaimer / Confidentiality Notice");

    this.addParagraph([
      "The information in this document is generated from a ",
      {
        text: "now-eslint automation tool",
        link: pkg.homepage,
        style: "link"
      },
      " (further known as tool) that evaluates code in customer's environment against a defined set of ESLint standards for the implementation of ServiceNow product. You may duplicate this document; and if you do so, you must duplicate it in its entirety."
    ]);
    this.addParagraph("Author of the tool (further known as author) does not assume any liability arising out of the content in this document or your use of the information in this document. Author provides this document \"as is\" and assumes no responsibility for any inaccuracies in this document.");
    this.addParagraph("AUTHOR HEREBY DISCLAIMS ALL WARRANTIES, WHETHER WRITTEN OR ORAL, EXPRESS OR IMPLIED BY LAW OR OTHERWISE, INCLUDING WITHOUT LIMITATION, ANY WARRANTIES OF MERCHANTABILITY, ACCURACY, TITLE, NONINFRINGEMENT OR FITNESS FOR ANY PARTICULAR PURPOSE. IN NO EVENT WILL AUTHOR BE LIABLE FOR LOST PROFITS (WHETHER DIRECT OR INDIRECT), FOR INCIDENTAL, CONSEQUENTIAL, PUNITIVE, SPECIAL OR EXEMPLARY DAMAGES (INCLUDING DAMAGE TO BUSINESS, REPUTATION OR GOODWILL), OR INDIRECT DAMAGES OF ANY TYPE HOWEVER CAUSED EVEN IF AUTHOR HAS BEEN ADVISED OF SUCH DAMAGES IN ADVANCE OR IF SUCH DAMAGES WERE FORESEEABLE.");
    this.addParagraph("\n");
    this.addParagraph("The content of this document is for informational purposes only and the list of issues scanned in the customer's environment may not be complete or exhaustive. The solution for the identified issue may be outside of the scope of your statement of work for the ServiceNow implementation");
    this.addParagraph("The content of this document may contain confidential information about the ServiceNow implementation, it is recommended to treat the document as such when considering of sharing it with the 3rd party.");
    // The automation tool does not collect or store any information except those that are needed to connect to the instance (such as 'domain', 'username' and 'password') to perform the scan (such as 'table' and 'field' configuration).
    this.addPageBreak();
  }

  generateReportSummary(linter) {
    this.addHeading("ESLint Report");
    this.addParagraph("Lorem ipsum...");

    this.addHeading("Summary");
    this.addParagraph([
      {
        text: "INSTANCE\n",
        style: "small",
        bold: true
      },
      {
        text: `${linter.profile.domain}`,
        link: `${linter.profile.domain}`,
        style: "link"
      }
    ]);
    this.addParagraph([
      {
        text: "QUERY\n",
        style: "small",
        bold: true
      },
      {
        text: `${linter._options.query}`
      }
    ]);
    this.addParagraph([
      {
        text: "UNIQUE CHANGES FOUND\n",
        style: "small",
        bold: true
      },
      {
        text: `${linter.changes.size}`
      }
    ]);
    
    /*this.addHeading("References");
    this.addParagraph("Lorem ipsum...");*/
    this.addPageBreak();
  }

  generateReportFindings(linter) {
    this.addHeading("Findings");

    const results = [];

    linter.changes.forEach((scan, key) => {
      // Change type and target
      results.push({
        text: `${scan.type} (${scan.targetName})`,
        style: "heading2"
      });

      // Change details
      results.push({
        columns: [
          {
            width: "auto",
            text: [
              {
                text: "CREATED BY ",
                style: "small",
                bold: true
              },
              `${scan.createdBy}`,
              {
                text: " AT ",
                style: "small",
                bold: true
              },
              `${scan.createdOn}`
            ]
          },
          {
            width: "auto",
            text: [
              {
                text: "UPDATED BY ",
                style: "small",
                bold: true
              },
              `${scan.updatedBy}`,
              {
                text: " AT ",
                style: "small",
                bold: true
              },
              `${scan.updatedOn}`
            ]
          }
        ],
        columnGap: 5
      });
      results.push({
        columns: [
          {
            width: "auto",
            text: [
              {
                text: "STATUS ",
                style: "small",
                bold: true
              },
              `${scan.status}`
            ]
          },
          {
            width: "auto",
            text: [
              {
                text: "ACTION ",
                style: "small",
                bold: true
              },
              `${scan.action}`
            ]
          },
          {
            width: "auto",
            text: [
              {
                text: "UPDATES ",
                style: "small",
                bold: true
              },
              `${scan.updates}`
            ]
          },
          {
            width: "auto",
            text: [
              {
                text: "ERRORS ",
                style: "small",
                bold: true
              },
              `${scan.errorCount}`
            ]
          },
          {
            width: "*",
            text: [
              {
                text: "WARNINGS ",
                style: "small",
                bold: true
              },
              `${scan.warningCount}`
            ]
          }
        ],
        columnGap: 5
      });

      const links = {
        margin: [0, 5, 0, 0],
        columns: [],
        columnGap: 5
      };
      links.columns.push({
        width: "auto",
        text: [
          {
            text: "Update Set",
            style: ["small", "link"],
            link: `${linter.profile.domain}/sys_update_set.do?sys_id=${scan.updateSet}`
          }
        ]
      });
      links.columns.push({
        width: "auto",
        text: [
          {
            text: "Change",
            style: ["small", "link"],
            link: `${linter.profile.domain}/sys_update_xml.do?sys_id=${scan.id}`
          }
        ]
      });
      if (scan.action !== "DELETE" && scan.targetTable && scan.targetId) {
        links.columns.push({
          width: "auto",
          text: [
            {
              text: "Record",
              style: ["small", "link"],
              link: `${linter.profile.domain}/${scan.targetTable}.do?sys_id=${scan.targetId}`
            }
          ]
        });
      }

      results.push(links);

      if (scan.hasReports) {
        scan.reports.forEach((report, field) => {
          results.push({
            text: `Report for field '${field}'`,
            bold: true,
            style: "heading5",
            margin: [0, 10, 0, 5]
          });

          let table = {
            table: {
              headerRows: 1,
              widths: ["auto", "auto", "auto", "*"],
              body: [
                [{
                  text: "Line",
                  style: "tableHeader"
                },
                {
                  text: "Severity",
                  style: "tableHeader"
                },
                {
                  text: "Rule",
                  style: "tableHeader"
                },
                {
                  text: "Message",
                  style: "tableHeader"
                }
                ]
              ]
            },
            layout: {
              hLineWidth: function (i, node) {
                return 0.5;
              },
              vLineWidth: function (i, node) {
                return 0.5;
              },
              hLineColor: function (i, node) {
                return "black";
              },
              vLineColor: function (i, node) {
                return "black";
              }
              // hLineStyle: function (i, node) { return {dash: { length: 10, space: 4 }}; },
              // vLineStyle: function (i, node) { return {dash: { length: 10, space: 4 }}; },
              // paddingLeft: function(i, node) { return 4; },
              // paddingRight: function(i, node) { return 4; },
              // paddingTop: function(i, node) { return 2; },
              // paddingBottom: function(i, node) { return 2; },
              // fillColor: function (rowIndex, node, columnIndex) { return null; }
            }
          };

          report.messages.forEach((message) => {
            table.table.body.push([
              {
                text: `${message.line}:${message.column}`,
                style: "tableCell"
              },
              {
                text: message.severity === 1 ? "Warning" : "Error",
                style: "tableCell"
              },
              {
                text: `${message.ruleId}`,
                style: "tableCell"
              },
              {
                text: `${message.message}`,
                style: "tableCell"
              }
            ]);
          });
          
          results.push(table);
        });
      }

      // Change separator
      results.push({
        margin: [0, 15, 0, 15],
        canvas: [
          {
            type: "line",
            x1: 0,
            x2: 515.28,
            y1: 0,
            y2: 0,
            lineWidth: 0.5,
            lineColor: "#dee2e6"
          }
        ]
      });
    });

    this.addContent(results);
  }

  generate(path) {
    const printer = new pdfmake(this.fonts);
    const pdfDoc = printer.createPdfKitDocument(this.docDef, this.tableLayouts);
    pdfDoc.pipe(fs.createWriteStream(path));
    pdfDoc.end();
  }
}

module.exports = NowReportGenerator;