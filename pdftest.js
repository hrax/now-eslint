try {
  require("dotenv").config();
} catch (e) {}

// https://pdfmake.github.io/docs/0.1/document-definition-object/styling/
const NowProfile = require("./src/NowProfile");
const NowLinter = require("./src/NowLinter");

const profile = new NowProfile({
  name: "dev115950",
  domain: "https://dev115950.service-now.com/",
  username: "admin",
  password: process.env.SNOW_PASSWORD || (Math.random() * 9999)
});
profile.setTables(require("./resources/tables.json"));

(async() => {
  const linter = new NowLinter(profile, {
    title: "Application Development Scan",
    query: "name=Some update set"
  });

  const setup = require("./resources/pdfsetup")(linter.options.title);

  await linter.process();
  linter.report("./testpdf.pdf", setup);
})();

/*

const generator = new NowReportGenerator(setup.docDef);
generator.setFonts(setup.fonts);
if (setup.tableLayouts) {
  generator.setTableLayouts(setup.tableLayouts);
}

generator.generateReportTitle(linter._options.title);

generator.generateReportSummary(profile, linter._options);
generator.generateReportFindings(linter.getChanges());

generator.generate("./testpdf.pdf");

*/