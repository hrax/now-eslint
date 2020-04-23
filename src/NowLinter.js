
const fs = require("fs");
const ejs = require("ejs");

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
        if (!this.tables[change.table] || this.tables[change.table] == null) {
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
    const now = new Date();

    // TODO: process changes into a JSON
    const json = {
      config: {
        "domain": this._options.domain,
        "query": this._options.query,
        "name": this._options.name
      },
      stats: {
        createdOn: now.getFullYear() + "-" + ("0" + now.getMonth()).slice(-2) + "-" + ("0" + now.getDate()).slice(-2) + " " + ("0" + now.getHours()).slice(-2) + ":" + ("0" + now.getMinutes()).slice(-2) + ":" + ("0" + now.getSeconds()).slice(-2),
        type: {
          ignoreCount: 0,
          warningCount: 0,
          errorCount: 0,
          okCount: 0,
          skippedCount: 0,
          scanCount: 0
        },
        uniqueChanges: 0
      },
      changes: []
    };

    json.stats.uniqueChanges = Object.keys(this.changes).length;

    Object.entries(this.changes).forEach(([key, value]) => {
      json.changes.push([
        key, {
          "name": value.name,
          "id": value.id,
          "action": value.action,
          "updateCount": value.updateCount,
          "createdBy": value.createdBy,
          "createdOn": value.createdOn,
          "updatedBy": value.updatedBy,
          "updatedOn": value.updatedOn,
          "type": value.type,
          "targetName": value.targetName,
          "table": value.table,
          "updateSet": value.updateSet,
          "status": value.status,
          "warningCount": value.warningCount,
          "errorCount": value.errorCount,
          "reports": value.reportEntries,
          "payload": value.payloadXML
        }
      ]);

      // Do the statistics count
      if (value.status === "IGNORE") {
        json.stats.type.ignoreCount++;
      }

      if (value.status === "WARNING") {
        json.stats.type.warningCount++;
      }

      if (value.status === "ERROR") {
        json.stats.type.errorCount++;
      }

      if (value.status === "OK") {
        json.stats.type.okCount++;
      }

      if (value.status === "SKIPPED") {
        json.stats.type.skippedCount++;
      }

      if (value.status === "SCAN") {
        json.stats.type.scanCount++;
      }
    });

    return json;
  }

  save() {
    const json = this.toJSON();
    fs.writeFileSync(this._options.name + ".json", JSON.stringify(json));
  }

  report() {
    const data = this.toJSON();
    ejs.renderFile("./template/" + this._options.report + ".html", data, (err, html) => {
      if (err) {
        throw Error(err);
      }
      fs.writeFileSync(this._options.name + ".html", html);
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