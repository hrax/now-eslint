
const fs = require("fs");
const ejs = require("ejs");

const CLIEngine = require("eslint").CLIEngine;
// eslint-disable-next-line no-unused-vars
const Linter = require("eslint").Linter;

const Assert = require("./Assert");
const NowLoader = require("./NowLoader");
const NowUpdateXML = require("./NowUpdateXML").NowUpdateXML;
const NowUpdateXMLStatus = require("./NowUpdateXML").NowUpdateXMLStatus;

class NowLinter {
  constructor(options) {
    this._options = Object.assign({
      "domain": null,
      "username": null,
      "password": null,
      "query": "",
      "title": "Service Now ESLint Report",
      "name": "now-eslint-report",
      "template": "template-slim",
      "skipInactive": false,
      "verbose": true,
      "autoJson": true,
      "tables": {},
      "cliEngine": {}
    }, options || {});

    Assert.notEmpty("Query needs to be specified!");

    this.changes = {};
    this.tables = Object.assign({}, this._options.tables || {});
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
          return;
        }

        /* if (this._options.skipInactive) {
          let active = NowLinter.getJSONFieldValue(change.payload, "active");
          if (active == null) {
            active = true;
          }

          if (!active) {
            change.setInactiveReport();
            return;
          }
        } */

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
      });
  }

  async process(verbose) {
    if (verbose) {
      console.log("Fetching Update Sets and their changes");
    }
    await this.fetch();

    if (verbose) {
      console.log("Performing ESLint scan on the loaded changes");
    }
    await this.lint();

    return Object.values(this.changes);
  }

  toJSON() {
    const now = new Date();
    const slinceNo = -2;

    // TODO: process changes into a JSON
    const report = {
      config: {
        "domain": this._options.domain,
        "query": this._options.query,
        "title": this._options.title,
        "name": this._options.name
      },
      stats: {
        createdOn: (
          now.getFullYear() + "-" +
          ("0" + now.getMonth()).slice(slinceNo) + "-" +
          ("0" + now.getDate()).slice(slinceNo) + " " +
          ("0" + now.getHours()).slice(slinceNo) + ":" +
          ("0" + now.getMinutes()).slice(slinceNo) + ":" +
          ("0" + now.getSeconds()).slice(slinceNo)
        ),
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

    Object.entries(this.changes).forEach(([key, value]) => {
      ++report.stats.uniqueChanges;
      report.changes.push([
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
        report.stats.type.ignoreCount++;
      }

      if (value.status === "WARNING") {
        report.stats.type.warningCount++;
      }

      if (value.status === "ERROR") {
        report.stats.type.errorCount++;
      }

      if (value.status === "OK") {
        report.stats.type.okCount++;
      }

      if (value.status === "SKIPPED") {
        report.stats.type.skippedCount++;
      }

      if (value.status === "SCAN") {
        report.stats.type.scanCount++;
      }
    });

    return report;
  }

  save() {
    const json = this.toJSON();
    fs.writeFileSync(this._options.name + ".json", JSON.stringify(json));
  }

  report(verbose) {
    if (verbose) {
      console.log("Generating the report from template '" + this._options.template + "'");
    }
    const data = this.toJSON();
    ejs.renderFile("./templates/" + this._options.template + ".html", data, (err, html) => {
      if (err) {
        throw Error(err);
      }
      fs.writeFileSync("./reports/" + this._options.name + ".html", html);
      if (verbose) {
        console.log("Report saved to './reports/" + this._options.name + ".html'");
      }
    });
  }

  async generate() {
    /*
      TODO: Set up ignore tables (complex parsing; multi table payload)
      TODO: Scan for parent table field configuration
     */
    const tables = await this.loader.fetchTableConfigurationData();

    if (Object.keys(tables).length > 0 && fs.existsSync("tables.json")) {
      console.log("Creating backup for the original tables.json file");
      fs.renameSync("tables.json", "tables.json-backup");
    }

    console.log("Loaded " + Object.keys(tables).length + " table entries. Saving into tables.json");
    fs.writeFileSync("tables.json", JSON.stringify(tables));
  }

  static getJSONFieldValue(payload, field) {
    return (payload[field] && (payload[field]._cdata || payload[field]._text)) || null;
  }
}

module.exports = NowLinter;