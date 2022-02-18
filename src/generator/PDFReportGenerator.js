/* eslint-disable no-magic-numbers */
const pdfmake = require("pdfmake");
const fs = require("fs");
const path = require("path");

const AbstractReportGenerator = require("./AbstractReportGenerator");
const ScanStatus = require("../UpdateXMLScan").STATUS;

class PDFReportGenerator extends AbstractReportGenerator {
  constructor() {
    super();

    this.fonts = {
      Calibri: {
        normal: path.normalize(__dirname + "/../../resources/fonts/Calibri/Calibri.ttf"),
        bold: path.normalize(__dirname + "/../../resources/fonts/Calibri/CALIBRIB.TTF"),
        italics: path.normalize(__dirname + "/../../resources/fonts/Calibri/CALIBRII.TTF"),
        bolditalics: path.normalize(__dirname + "/../../resources/fonts/Calibri/CALIBRIZ.TTF")
      }
    };

    this.tableLayouts = {};

    this.pageSize = "A4";
    this.pageOrientation = "portrait";
    this.pageMargins = [40, 60, 40, 60];

    // TODO: move styles definition here
  }

  addContent(document, ...content) {
    content.forEach((c) => document.push(c));
  }

  addPageBreak(document) {
    this.addContent(document, {
      text: "",
      pageBreak: "after"
    });
  }

  addParagraph(document, ...content) {
    this.addContent(document, {
      text: content,
      style: "paragraph"
    });
  }

  addHeading(document, heading, toc = true) {
    this.addContent(
      document,
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
            x1: 0,
            y1: 0,
            x2: 515.28,
            y2: 0,
            lineWidth: 0.5,
            lineColor: "#80b3a0"
          }
        ]
      }
    );
  }

  addHeading2(document, heading, toc = true) {
    this.addContent(
      document,
      {
        text: heading,
        style: "heading2",
        tocItem: toc,
        tocMargin: [10, 0, 0, 0]
      }
    );
  }

  generateReportTitle(document, title) {
    const content = [
      {
        text: `\n\n\n\n\n\n\n\n\n\n${title}`,
        style: "title"
      }
    ];

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
        // numeric, 2-digit
        day: "numeric",
        // numeric, 2-digit
        year: "numeric",
        // numeric, 2-digit, long, short, narrow
        month: "long"
      }),
      style: "small",
      alignment: "center",
      margin: [0, -5, 0, 5]
    });
    this.addContent(document, ...content);
    this.addPageBreak(document);
  }

  generateReportToc(document) {
    this.addHeading(document, "Table of Contents", false);
    this.addContent(document, {toc: {}});
    this.addPageBreak(document);
  }

  generateReportOverview(document, data) {
    const pkg = require(__dirname + "/../../package.json");
    const status = [
      {
        label: ScanStatus.DELETED,
        description: "Record deleted"
      },
      {
        label: ScanStatus.IGNORED,
        description: "Record ignored, target table is not configured"
      },
      {
        label: ScanStatus.MANUAL,
        description: "Record update should be checked manually"
      },
      {
      //   label: NowUpdateXMLScan.STATUS.INACTIVE,
      //   description: "Record should be linted, but is inactive"
      // },
      // {
        label: ScanStatus.SKIPPED,
        description: "Record should be linted, but does not contain anything to lint"
      },
      {
        label: ScanStatus.ERROR,
        description: "Record linted, at least one error found"
      },
      {
        label: ScanStatus.WARNING,
        description: "Record linted, at least one warning found"
      },
      {
        label: ScanStatus.OK,
        description: "Record linted, no linter warnings or erros found"
      }
    ];
    
    this.addHeading(document, "Report overview");
    this.addParagraph(
      document,
      "The information in this document is generated from a ",
      {
        text: "now-eslint automation tool",
        link: pkg.homepage,
        style: "link"
      },
      " that evaluates code in ServiceNow update sets against a defined set of ESLint standards for the implementation of ServiceNow product."
    );
    this.addParagraph(document, "The content of this document is for informational purposes only and the list of issues scanned in the ServiceNow update sets may not be complete or exhaustive. The solution for the identified issue may be outside of the scope for the ServiceNow implementation.");
    
    this.addHeading2(document, "Confidentiality Notice", false);
    this.addParagraph(document, "The content of this document may contain confidential information about the ServiceNow implementation, it is recommended to treat the document as such when considering of sharing it with the 3rd party.");

    this.addHeading2(document, "Status description", false);
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
    status.forEach((item) => {
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
    this.addContent(document, table);
    
    this.addHeading(document, "Resources");
    this.addParagraph(
      document,
      "For an overview of ServiceNow technical best practices, visit the ",
      {
        text: "Technical Best Practices",
        link: "https://developer.servicenow.com/dev.do#!/guides/quebec/now-platform/tpb-guide/scripting_technical_best_practices",
        style: "link"
      },
      " guide (Quebec)."
    );

    if (data.resources != null && data.resources["overview-resources"] != null && data.resources["overview-resources"].length > 0) {
      const ul = [];
      data.resources["overview-resources"].forEach((item) => {
        ul.push({
          margin: [0, 0, 0, 3],
          text: item.label,
          link: item.link,
          style: "link"
        });
      });

      this.addParagraph(document, "You can as well review these additional resources by visiting one of the following:");
      this.addContent(
        document,
        {
          margin: [10, 0, 0, 10],
          ul: ul
        }
      );
    }

    this.addPageBreak(document);
  }

  generateReportSummary(document, data) {
    this.addHeading(document, "Report summary");
    this.addParagraph(
      document,
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
    );
    this.addParagraph(
      document,
      {
        text: "QUERY\n",
        style: "small",
        bold: true
      },
      {text: `${data.query}`}
    );
    this.addParagraph(
      document,
      {
        text: "UNIQUE CHANGES FOUND\n",
        style: "small",
        bold: true
      },
      {text: `${data.changes.length || 0}`}
    );

    if (data.changes && data.changes.length) {
      this.addParagraph(document, "\n", "Following table lists all changes that were identified to contain an error and should be reviewed:");
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

      data.changes.forEach(([name, scan]) => {
        if (scan.status !== "ERROR" && scan.status !== "MANUAL") {
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

      this.addContent(document, table);
    }

    this.addPageBreak(document);
  }

  generateReportFindings(document, data) {
    if (!data.changes || data.changes == null) {
      return;
    }

    this.addHeading(document, "Report findings");

    
    if (data.changes && data.changes.length) {
      const results = [];
      data.changes.forEach(([key, scan]) => {
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
  
        if (scan.reports && scan.reports.length) {
          scan.reports.forEach(([field, report]) => {
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
                  [
                    {
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
      this.addContent(document, ...results);
    } else {
      this.addParagraph(document, "No changes were found...");
    }
  }

  getHeader(data) {
    return function(currentPage, pageCount, pageSize) {
      if (currentPage === 1) {
        return [];
      }
      return [
        {
          margin: [0, 20, 40, 0],
          columns: [
            {
              width: "*",
              text: []
            },
            {
              width: "auto",
              text: `${data.title}`,
              alignment: "right",
              style: "small"
            }
          ]
        }
      ];
    };
  }

  getFooter(data) {
    return function(currentPage, pageCount) {
      if (currentPage === 1) {
        return [];
      }
      return [
        {
          margin: [40, 30, 40, 0],
          columns: [
            {
              width: "40%",
              text: [
                {
                  text: "FOR INTERNAL USE",
                  style: "small",
                  italics: true
                }
              ]
            },
            {
              width: "*",
              text: [
                {
                  text: `${currentPage}`,
                  style: "small",
                  alignment: "center"
                }
              ]
            },
            {
              width: "40%",
              text: ""
            }
          ],
          columnGap: 5
        }
      ];
    };
  }

  getDefaultStyle() {
    return {
      "color": "#212529",
      "font": "Calibri",
      "fontSize": 10,
      "lineHeight": 1.1
    };
  }

  getStyles() {
    return {
      "title": {
        "color": "#293e41",
        "fontSize": 30,
        "alignment": "center",
        "margin": [0, 0, 0, 10]
      },
      "heading1": {
        "color": "#293e41",
        "fontSize": 18,
        "margin": [0, 5, 0, 10]
      },
      "heading2": {
        "color": "#80b3a0",
        "fontSize": 16,
        "margin": [0, 5, 0, 10]
      },
      "heading3": {
        "color": "#212529",
        "fontSize": 14,
        "margin": [0, 5, 0, 10]
      },
      "heading4": {
        "color": "#212529",
        "fontSize": 12,
        "margin": [0, 5, 0, 10]
      },
      "small": {"fontSize": 9},
      "tableCell": {"margin": [3, 5, 3, 2]},
      "tableHeader": {
        "fillColor": "#343a40",
        "color": "#fff",
        "margin": [3, 5, 3, 2],
        "bold": true
      },
      "tableHeaderLight": {
        "fillColor": "#6c757d",
        "color": "#fff",
        "margin": [3, 5, 3, 2],
        "bold": true
      },
      "link": {
        "color": "#0d6efd",
        "decoration": "underline"
      },
      "paragraph": {"margin": [0, 0, 0, 10]}
    };
  }

  build(data) {
    const document = [];

    // Page 1
    this.generateReportTitle(document, data.title);

    // Page 2 - ToC
    this.generateReportToc(document);

    // Page 3 - Report overview
    this.generateReportOverview(document, data);

    // Page 4 - Report summary
    this.generateReportSummary(document, data);

    // Page 5+ - Report findings
    this.generateReportFindings(document, data);

    return {
      "pageSize": this.pageSize,
      "pageOrientation": this.pageOrientation,
      "pageMargins": this.pageMargins,
      "header": this.getHeader(data),
      "footer": this.getFooter(data),
      "defaultStyle": this.getDefaultStyle(),
      "styles": this.getStyles(),
      content: document
    };
  }

  save(path, data) {
    const document = this.build(data);

    const printer = new pdfmake(this.fonts);
    const pdfDoc = printer.createPdfKitDocument(document, {tableLayouts: this.tableLayouts});
    pdfDoc.pipe(fs.createWriteStream(path));
    pdfDoc.end();
  }
}

module.exports = PDFReportGenerator;