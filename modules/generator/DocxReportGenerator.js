/* eslint-disable no-magic-numbers */
const fs = require("fs");
const path = require("path");
const docx = require("docx");

const AbstractReportGenerator = require("./AbstractReportGenerator");
const ScanStatus = require("../UpdateXMLScan").STATUS;

class DocxReportGenerator extends AbstractReportGenerator {
  constructor() {
    super();

    var pkg = require("../../package.json");
    this.version = pkg.version;
  }

  build(data) {
    return new docx.Document({
      creator: `now-eslint v${this.version}`,
      title: `${data.title}`,
      description: `ESLint report for changes in update sets matching query '${data.query}' on '${data.domain}'`,
      styles: {
        default: {
          document: {
            run: {
              color: "212529",
              font: "Calibri",
              size: 10
            }
          },
          title: {
            run: {
              color: "293e41",
              size: 30
            }
          },
          heading1: {
            run: {
              color: "293e41",
              size: 18
            }
          }
        }
      },
      sections: [
        // Page 1 - Title
        {
          children: [
            new docx.Paragraph({
              children: [
                new docx.TextRun({break: 10}),
                new docx.TextRun({text: `${data.title}`})
              ],
              heading: docx.HeadingLevel.TITLE,
              size: 30,
              alignment: docx.AlignmentType.CENTER
            }),
            new docx.Paragraph({
              children: [new docx.TextRun({text: `A ServiceNow ESLint Report`})],
              bold: true,
              alignment: docx.AlignmentType.CENTER,
              size: 9
            }),
            new docx.Paragraph({
              children: [
                new docx.TextRun({
                  text: new Date().toLocaleString("en-US", {
                    // numeric, 2-digit
                    day: "numeric",
                    // numeric, 2-digit
                    year: "numeric",
                    // numeric, 2-digit, long, short, narrow
                    month: "long"
                  })
                })
              ],
              alignment: docx.AlignmentType.CENTER
            })
          ]
        },
        // Page 2 - ToC
        {
          properties: {type: docx.SectionType.NEXT_PAGE},
          children: [new docx.Paragraph({text: "hello"})]
        },
        // Page 3 - Report overview
        {
          properties: {type: docx.SectionType.NEXT_PAGE},
          children: [new docx.Paragraph({text: "hello"})]
        },
        // Page 4 - Report summary
        {
          properties: {type: docx.SectionType.NEXT_PAGE},
          children: [new docx.Paragraph({text: "hello"})]
        },
        // Page 5+ - Report findings
        {
          properties: {type: docx.SectionType.NEXT_PAGE},
          children: [new docx.Paragraph({text: "hello"})]
        }
      ]
    });
  }

  extension() {
    return "docx";
  }

  save(folder, fileName, data) {
    const document = this.build(data);
    const extension = this.extension();

    docx.Packer.toBuffer(document).then((buffer) => {
      fs.writeFileSync(path.normalize(`${folder}/${fileName}.${extension}`), buffer);
    });
  }
}

module.exports = DocxReportGenerator;