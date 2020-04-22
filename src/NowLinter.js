
const fs = require("fs");

const CLIEngine = require("eslint").CLIEngine;
// eslint-disable-next-line no-unused-vars
const Linter = require("eslint").Linter;

const NowLoader = require("./NowLoader");
const NowUpdateXML = require("./NowUpdateXML").NowUpdateXML;
const NowUpdateXMLStatus = require("./NowUpdateXML").NowUpdateXMLStatus;

class NowLinter {
  constructor(options) {
    this._options = Object.assign({
      "domain": "",
      "username": "",
      "password": "",
      "query": "",
      "name": "",
      "report": "",
      "tables": {},
      "cliEngine": {}
    }, options || {});
    this.changes = {};

    this.tables = Object.assign({}, this._options.tables || {});

    if (this._options.query === "" || this._options.query == null) {
      throw Error("Query needs to be specified!");
    }

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

  /**
   * Lint configured change records. Should be called after the change records
   * have been loaded and processed
   *
   * @see #fetch()
   * @return {void}
   */
  async lint() {
    // Check the changes against configured lint tables
    Object.values(this.changes).filter((change) => {
      return change.status === NowUpdateXMLStatus.SCAN;
    })
      .forEach((change) => {
        if (!this.tables[change.table]) {
          change.setIgnoreReport();
        } else {
          // For each configured field run lint
          this.tables[change.table].forEach((field) => {
            const data = NowLinter.getJSONFieldValue(change.payload, field);
            if (data == null || data === "") {
              change.setSkippedReport();
              return;
            }
            const report = this.cli.executeOnText(data);
            report.results[0].filePath = "<" + change.name + "@" + field + ">";
            change.setReport(field, report);
          });
        }
      });
  }

  async process() {
    await this.fetch();
    await this.lint();

    return Object.values(this.changes);
  }

  toJSON() {
    // TODO: process changes into a JSON
    return {};
  }

  save() {
    // TODO: save changes as JSON file into CWD
  }

  report() {
    // TODO: generate a HTML report from the changes into CWD
    console.log("GENERATE: from template '" + this._options.report + "' to '" + this._options.name + "'");
    console.log("");

    Object.values(this.changes).forEach((i) => {
      console.log("ID: " + i.id);
      console.log("Name: " + i.name);
      console.log("Action: " + i.action);
      console.log("Status: " + i.status);
      console.log("Updates: " + i.updateCount);

      console.log("Warnings: " + i.warningCount);
      console.log("Errors: " + i.errorCount);

      console.log("");
    });
  }

  async generate() {
    const tables = await this.loader.fetchTableConfigurationData();

    if (Object.keys(tables).length > 0 && fs.existsSync("tables.json")) {
      console.log("Creating backup for the original tables.json file");
      fs.renameSync("tables.json", "tables.json-backup");
    }

    console.log("Loaded " + Object.keys(tables).length + " table entries. Saving into tables.json");
    fs.writeFileSync("tables.json", JSON.stringify(tables));
  }

  static getJSONFieldValue(payload, field) {
    return payload[field]._cdata || payload[field]._text || null;
  }
}

module.exports = NowLinter;