const fs = require("fs");

const pdfmake = require("pdfmake");

var fonts = {
  Calibri: {
    normal: "resources/fonts/Calibri/Calibri.ttf",
    bold: "resources/fonts/Calibri/CALIBRIB.TTF",
    italics: "resources/fonts/Calibri/CALIBRII.TTF",
    bolditalics: "resources/fonts/Calibri/CALIBRIZ.TTF"
  }
};

// https://pdfmake.github.io/docs/0.1/document-definition-object/styling/
const docDef = require("./pdfdefinition.json");
docDef.footer = function(currentPage, pageCount) {
  if (currentPage === 1) {
    return [];
  }
  return [
    {
      text: currentPage.toString() + " of " + pageCount,
      fontSize: 9,
      alignment: "center"
    }
  ];
},
docDef.content = [
  {
    text: "\n\n\n\n\n\n\n\n\n\nServiceNow Update Set ESLint Report",
    style: "title"
  },
  {
    text: "",
    pageBreak: "after"
  },
  {
    text: "Details",
    style: "heading1"
  },
  {
    margin: [0, -5, 0, 10],
    canvas: [
      {
        type: 'line',
        x1: 0, y1: 0,
        x2: 515.28, y2: 0,
        lineWidth: 1
      }
    ]
  },
  {
    text: [
      "Domain: ",
      {
        text: "https://example.com",
        link: "https://example.com",
        color: "blue"
      }
    ]
  },
  "Report created at: " + new Date(),
  "Unique changes found: 352",
  "Update set query: name=Default^created_byCONTAINStest",
  {
    text: "",
    pageBreak: "after"
  },
  {
    text: "Results",
    style: "heading1"
  },
  {
    margin: [0, -5, 0, 10],
    canvas: [
      {
        type: 'line',
        x1: 0, y1: 0,
        x2: 515.28, y2: 0,
        lineWidth: 1
      }
    ]
  },
  {
    text: "Dictionary (Application ID.Application)",
    style: "heading2"
  },
  {
    columns: [
      {
        // auto-sized columns have their widths based on their content
        width: "auto",
        text: [
          {
            text: "CREATED BY ",
            style: "small",
            bold: true
          },
          "admin",
          {
            text: " AT ",
            style: "small",
            bold: true
          },
          "2009-01-03"
        ]
      },
      {
        width: "*",
        text: [
          {
            text: "UPDATED BY ",
            style: "small",
            bold: true
          },
          "admin",
          {
            text: " AT ",
            style: "small",
            bold: true
          },
          "2009-01-03"
        ]
      }
    ],
    // optional space between columns
    columnGap: 5
  },
  {
    columns: [
      {
        // auto-sized columns have their widths based on their content
        width: "auto",
        text: [
          {
            text: "STATUS ",
            style: "small",
            bold: true
          },
          "ERROR"
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
          "INSERT_OR_UPDATE"
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
          "3"
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
          "7"
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
          "1"
        ]
      }
    ],
    // optional space between columns
    columnGap: 5
  },
  "\n",
  {
    table: {
      headerRows: 1,
      widths: [ 'auto', 'auto', 'auto', '*'],
      body: [
        [{
          text: 'Line',
          style: "tableHeader"
        },
        {
          text: 'Severity',
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
        ],
        [
          {
            text: "1:32",
            style: "tableCell"
          },
          {
            text: "Warning",
            style: "tableCell"
          },
          {
            text: "no-unused-vars",
            style: "tableCell"
          },
          {
            text: "'current' is defined but never used.",
            style: "tableCell"
          }
        ],
        [
          {
            text: "1:42",
            style: "tableCell"
          },
          {
            text: "Error",
            style: "tableCell"
          },
          {
            text: "padded-blocks",
            style: "tableCell"
          },
          {
            text: "'current' is defined but never used.",
            style: "tableCell"
          }
        ],
        [
          {
            text: "3:1",
            style: "tableCell"
          },
          {
            text: "Error",
            style: "tableCell"
          },
          {
            text: "indent",
            style: "tableCell"
          },
          {
            text: "Expected indentaton of 2 spaces but found 1 tab.",
            style: "tableCell"
          }
        ]
      ]
    }
  }
];

var printer = new pdfmake(fonts);
var pdfDoc = printer.createPdfKitDocument(docDef);
pdfDoc.pipe(fs.createWriteStream("./testpdf.pdf"));
pdfDoc.end();