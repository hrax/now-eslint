/* eslint-disable no-console */
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
  constructor(instance, options, tables) {
    this._profile = {
      instance: Object.assign({
        "domain": null,
        "username": null,
        "password": null
      }, instance || {}),
      options: Object.assign({
        "query": "",
        "title": "Service Now ESLint Report",
        "name": "now-eslint-report",
        "template": "template-slim",
        "skipInactive": false,
        "verbose": true,
        "tables": {},
        "cliEngine": {}
      }, options || {})
    };

    // Assert.notEmpty("Query needs to be specified!");

    this.changes = {};
    this.tables = Object.assign({}, tables || {}, this._profile.options.tables || {});
    this.loader = new NowLoader(this._profile.instance.domain, this._profile.instance.username, this._profile.instance.password);
    this.cli = new CLIEngine(this._profile.options.cliEngine || {});
  }

  async fetch() {
    this.changes = {};

    const response = await this.loader.fetchUpdateXMLByUpdateSetQuery(this._profile.options.query);

    // Get records from the response
    response.result.forEach((record) => {
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

        /* if (this._profile.options.skipInactive) {
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
        "domain": this._profile.instance.domain,
        "query": this._profile.options.query,
        "title": this._profile.options.title,
        "name": this._profile.options.name
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

    // TODO: redo this to a id order and separate map
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

  _saveFile(path, data, force, verbose) {
    if (!force && fs.existsSync(path)) {
      verbose && console.log("Creating backup for '" + path + "'");
      fs.renameSync(path, path + "-backup");
    }
    verbose && console.log("Saving data to '" + path + "'");
    fs.writeFileSync(path, data);
  }

  report(verbose) {
    if (verbose) {
      console.log("Generating the report from template '" + this._profile.options.template + "'");
    }
    const data = this.toJSON();
    this._saveFile("./reports/" + this._profile.options.name + ".json", JSON.stringify(data), false, verbose);
    verbose && console.log("JSON saved");

    ejs.renderFile("./templates/" + this._profile.options.template + ".html", data, (err, html) => {
      if (err) {
        throw Error(err);
      }
      this._saveFile("./reports/" + this._profile.options.name + ".html", html, false, verbose);
      verbose && console.log("Report saved");
    });
  }

  // TODO: move this to different class, this has nothing to do with linting, maybe separate class for instance setup + table gen?
  async generate() {
    /*
      TODO: Set up ignore tables (complex parsing; multi table payload)
     */
    const fields = await this.loader.fetchTableFieldData();
    const parents = await this.loader.fetchTableParentData();
    const tables = {};
    const getParentFields = function(table, fields, parents, toReturn) {
      toReturn = toReturn || [];
      if (fields[table] != null) {
        toReturn = toReturn.concat(fields[table]);
        if (parents[table]) {
          return getParentFields(parents[table], fields, parents, toReturn);
        }
      }

      // Return unique set as array
      return [...new Set(toReturn)];
    };

    Object.keys(fields).forEach(table => {
      tables[table] = getParentFields(table, fields, parents);
    });

    this._saveFile("./conf/tables.json", JSON.stringify(tables), false, true);
  }

  static getJSONFieldValue(payload, field) {
    return (payload[field] && (payload[field]._cdata || payload[field]._text)) || null;
  }
}

module.exports = NowLinter;