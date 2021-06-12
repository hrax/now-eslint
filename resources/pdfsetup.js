module.exports = function(title) {
  return {
    fonts: {
      Calibri: {
        normal: "resources/fonts/Calibri/Calibri.ttf",
        bold: "resources/fonts/Calibri/CALIBRIB.TTF",
        italics: "resources/fonts/Calibri/CALIBRII.TTF",
        bolditalics: "resources/fonts/Calibri/CALIBRIZ.TTF"
      }
    },
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
                text: `${title}`,
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
          "color": "#dc3545",
          "fontSize": 30,
          "alignment": "center",
          "margin": [0, 0, 0, 10]
        },
        "heading1": {
          "color": "#dc3545",
          "fontSize": 18,
          "margin": [0, 5, 0, 10]
        },
        "heading2": {
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
          "margin": [3, 2]
        },
        "link": {
          "color": "#0d6efd",
          "decoration": "underline"
        },
        "paragraph": {
          "margin": [0, 0, 0, 5]
        }
      }
    }
  };
};