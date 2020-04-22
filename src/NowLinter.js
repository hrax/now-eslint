
const CLIEngine = require("eslint").CLIEngine;
// eslint-disable-next-line no-unused-vars
const Linter = require("eslint").Linter;

const NowLoader = require("../src/NowLoader");
const NowUpdateXML = require("../src/NowUpdateXML").NowUpdateXML;

class NowLinter {
  constructor(options) {
    this._options = Object.assign({
      "domain": "",
      "username": "",
      "password": "",
      "query": "",
      "tables": {},
      "cliEngine": {}
    }, options || {});
    this.changes = {};

    this.tables = this._options.tables;

    this.loader = new NowLoader(this._options.domain, this._options.username, this._options.password);
    this.cli = new CLIEngine(this._options.cliEngine || {});
  }

  async fetch() {
    this.changes = {};

    const response = await this.loader.fetchUpdateXMLByUpdateSetQuery(this._options.query);

    // Get records from the response
    response.records.forEach((record) => {
      let change = new NowUpdateXML(record, true);
      if (!this.changes[change.name]) {
        change.initialize();
        this.changes[change.name] = change;
      } else {
        this.changes[change.name].incrementUpdateCount();
      }
    });
  }

  async lint() {
    // Check the changes against configured lint tables
    Object.values(this.changes).filter((change) => {
      return change.status === "SCAN";
    })
      .forEach((change) => {
        if (!this.tables[change.table]) {
          change.status = "IGNORE";
        } else {
          let hasWarnings = false;
          let hasErrors = false;
          // For each configured field run lint
          this.tables[change.table].forEach((field) => {
            const data = NowLinter.getJSONFieldValue(change.payload, field);
            if (data == null || data === "") {
              return;
            }
            const report = this.cli.executeOnText(data);
            report.results[0].filePath = "<" + change.name + "@" + field + ">";
            change.setReport(field, report);
            if (report.warningCount > 0) {
              hasWarnings = true;
            }

            if (report.errorCount > 0) {
              hasErrors = true;
            }
          });

          // TODO: set status based on the number of warnings/errors found
          if (hasErrors) {
            change.status = "ERROR";
          } else if (hasWarnings) {
            change.status = "WARNING";
          } else if (change.reports.length === 0) {
            change.status = "SKIPPED";
          } else {
            change.status = "OK";
          }
        }
      });
  }

  async process() {
    await this.fetch();
    await this.lint();

    return Object.values(this.changes);
  }

  static getJSONFieldValue(payload, field) {
    return payload[field]._cdata || payload[field]._text || null;
  }
}

module.exports = NowLinter;