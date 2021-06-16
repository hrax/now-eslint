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

  addHeading(heading, toc) {
    if (toc === undefined) {
      toc = true;
    }

    this.addContent([
      {
        text: heading,
        style: "heading1",
        tocItem: toc
      },
      {
        margin: [0, -5, 0, 10],
        canvas: [
          {
            type: "line",
            x1: 0, y1: 0,
            x2: 515.28, y2: 0,
            lineWidth: 0.5,
            lineColor: "#80b3a0"
          }
        ]
      }
    ]);
  }

  addHeading2(heading, toc) {
    if (toc === undefined) {
      toc = true;
    }
    
    this.addContent([
      {
        text: heading,
        style: "heading2",
        tocItem: toc,
        tocMargin: [10, 0, 0, 0]
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
          lineColor: "#80b3a0"
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
    this.addHeading("Table of Contents", false);
    this.addContent([{toc: {}}]);
    this.addPageBreak();
  }

  generateOverview(data) {
    const pkg = require("../package.json");
    
    this.addHeading("Report overview");
    this.addParagraph([
      "The information in this document is generated from a ",
      {
        text: "now-eslint automation tool",
        link: pkg.homepage,
        style: "link"
      },
      " that evaluates code in ServiceNow update sets against a defined set of ESLint standards for the implementation of ServiceNow product."
    ]);
    this.addParagraph("The content of this document is for informational purposes only and the list of issues scanned in the ServiceNow update sets may not be complete or exhaustive. The solution for the identified issue may be outside of the scope for the ServiceNow implementation.");
    
    this.addHeading2("Confidentiality Notice", false);
    this.addParagraph("The content of this document may contain confidential information about the ServiceNow implementation, it is recommended to treat the document as such when considering of sharing it with the 3rd party.");

    if (data.status) {
      this.addHeading2("Status description", false);
      const table = {
        margin: [0, 0, 0, 10],
        table: {
          headerRows: 1,
          widths: ["auto", "*"],
          body: [
            [
              {
                text: "Status",
                style: "tableHeaderLight"
              },
              {
                text: "Description",
                style: "tableHeaderLight"
              }
            ]
          ]
        },
        layout: {
          hLineWidth: function(i, node) {
            return 0.5;
          },
          vLineWidth: function(i, node) {
            return 0.5;
          },
          hLineColor: function(i, node) {
            return "black";
          },
          vLineColor: function(i, node) {
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

      data.status.forEach((item) => {
        table.table.body.push([
          {
            text: `${item.label}`,
            style: "tableCell"
          },
          {
            text: `${item.description}`,
            style: "tableCell"
          }
        ]);
      });

      this.addContent([table]);
    }

    this.addHeading("Resources");
    this.addParagraph([
      "For an overview of ServiceNow technical best practices, visit the ",
      {
        text: "Technical Best Practices",
        link: "https://developer.servicenow.com/dev.do#!/guides/quebec/now-platform/tpb-guide/scripting_technical_best_practices",
        style: "link"
      },
      " guide (Quebec)."
    ]);

    if (data.resources && data.resources.length > 0) {
      const ul = [];
      data.resources.forEach((item) => {
        ul.push({
          margin: [0, 0, 0, 3],
          text: item.label,
          link: item.link,
          style: "link"
        });
      });

      this.addParagraph("For an ovewview of ESLint rules and practices for this report, visit one of the following:");
      this.addContent([
        {
          margin: [10, 0, 0, 10],
          ul: ul
        }
      ]);
    }

    this.addPageBreak();
  }

  generateReportSummary(data) {
    this.addHeading("Summary");
    this.addParagraph([
      {
        text: "INSTANCE\n",
        style: "small",
        bold: true
      },
      {
        text: `${data.domain}`,
        link: `${data.domain}`,
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
        text: `${data.query}`
      }
    ]);
    this.addParagraph([
      {
        text: "UNIQUE CHANGES FOUND\n",
        style: "small",
        bold: true
      },
      {
        text: `${data.changes.size}`
      }
    ]);

    if (data.changes) {
      this.addParagraph(["\n", "Following table lists all changes that were identified to contain an error and should be reviewed:"]);
      let table = {
        table: {
          headerRows: 1,
          widths: ["auto", "*", "auto"],
          body: [
            [
              // {
              //   text: "Number",
              //   style: "tableHeaderLight"
              // },
              {
                text: "Type",
                style: "tableHeaderLight"
              },
              {
                text: "Name",
                style: "tableHeaderLight"
              },
              {
                text: "Errors",
                style: "tableHeaderLight"
              }
            ]
          ]
        },
        layout: {
          hLineWidth: function(i, node) {
            return 0.5;
          },
          vLineWidth: function(i, node) {
            return 0.5;
          },
          hLineColor: function(i, node) {
            return "black";
          },
          vLineColor: function(i, node) {
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

      data.changes.forEach((scan) => {
        if (scan.status !== "ERROR") {
          return;
        }

        table.table.body.push([
          {
            text: scan.type,
            style: "tableCell"
          },
          {
            text: scan.targetName,
            linkToDestination: `scan-${scan.id}`,
            style: ["tableCell", "link"]
          },
          {
            text: `${scan.errorCount}`,
            style: "tableCell"
          }
        ]);
      });

      this.addContent([table]);
    }

    this.addPageBreak();
  }

  generateReportFindings(data) {
    this.addHeading("Findings");

    const results = [];

    data.changes.forEach((scan, key) => {
      // Change type and target
      results.push({
        text: `${scan.targetName} (${scan.type})`,
        style: "heading2",
        id: `scan-${scan.id}`,
        tocItem: true,
        tocMargin: [10, 0, 0, 0]
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
        margin: [0, 0, 0, 10],
        columns: [
          {
            width: "*",
            text: [
              {
                text: "LINKS ",
                style: "small",
                bold: true
              }
            ]
          }
        ],
        columnGap: 5
      };
      links.columns[0].text.push(
        {
          text: "Update Set",
          style: ["link"],
          link: `${data.domain}/sys_update_set.do?sys_id=${scan.updateSet}`
        },
        "  ",
        {
          text: "Change",
          style: ["link"],
          link: `${data.domain}/sys_update_xml.do?sys_id=${scan.id}`
        }
      );
      if (scan.action !== "DELETE" && scan.targetTable && scan.targetId) {
        links.columns[0].text.push("  ", {
          text: "Record",
          style: ["link"],
          link: `${data.domain}/${scan.targetTable}.do?sys_id=${scan.targetId}`
        });
      }

      results.push(links);

      if (scan.hasReports) {
        scan.reports.forEach((report, field) => {
          results.push({
            text: `Report for field '${field}'`,
            bold: true,
            style: "heading5",
            margin: [0, 0, 0, 5]
          });

          let table = {
            margin: [0, 0, 0, 10],
            table: {
              headerRows: 1,
              widths: ["auto", "auto", "auto", "*"],
              body: [
                [{
                  text: "Line",
                  style: "tableHeaderLight"
                },
                {
                  text: "Severity",
                  style: "tableHeaderLight"
                },
                {
                  text: "Rule",
                  style: "tableHeaderLight"
                },
                {
                  text: "Message",
                  style: "tableHeaderLight"
                }
                ]
              ]
            },
            layout: {
              hLineWidth: function(i, node) {
                return 0.5;
              },
              vLineWidth: function(i, node) {
                return 0.5;
              },
              hLineColor: function(i, node) {
                return "black";
              },
              vLineColor: function(i, node) {
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
      // results.push({
      //   margin: [0, 15, 0, 15],
      //   canvas: [
      //     {
      //       type: "line",
      //       x1: 0,
      //       x2: 515.28,
      //       y1: 0,
      //       y2: 0,
      //       lineWidth: 0.5,
      //       lineColor: "#80b3a0"
      //     }
      //   ]
      // });
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