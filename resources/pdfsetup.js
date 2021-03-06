/**
 * Modify setup object;
 * setup = {
 *  fonts: {},
 *  tableLayouts: {},
 *  docDef: {}
 * }
 * 
 * For modification of these properties see https://pdfmake.github.io/docs/0.1/
 */
module.exports = function(data) {
  return {
    fonts: {
      Calibri: {
        normal: require.resolve("./fonts/Calibri/Calibri.ttf"),
        bold: require.resolve("./fonts/Calibri/CALIBRIB.TTF"),
        italics: require.resolve("./fonts/Calibri/CALIBRII.TTF"),
        bolditalics: require.resolve("./fonts/Calibri/CALIBRIZ.TTF")
      }
    },
    tableLayouts: {},
    docDef: {
      "pageSize": "A4",
      "pageOrientation": "portrait",
      "pageMargins": [40, 60, 40, 60 ],
      header: function(currentPage, pageCount, pageSize) {
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
      },
      footer: function(currentPage, pageCount) {
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
                    text: "PROPRIETARY AND CONFIDENTIAL",
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
      },
      "content": [],
      "defaultStyle": {
        "color": "#212529",
        "font": "Calibri",
        "fontSize": 10,
        "lineHeight": 1.1
      },
      "styles": {
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
          "fontSize": 14,
          "margin": [0, 5, 0, 10]
        },
        "heading4": {
          "fontSize": 12,
          "margin": [0, 5, 0, 10]
        },
        "small": {
          "fontSize": 9
        },
        "tableCell": {
          "margin": [3, 5, 3, 2]
        },
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
        "paragraph": {
          "margin": [0, 0, 0, 10]
        }
      }
    }
  };
};