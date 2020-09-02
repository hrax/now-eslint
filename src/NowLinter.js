/* eslint-disable */
const {ESLint, Linter} = require("eslint");

const Assert = require("./Assert");
const NowLoader = require("./NowLoader");
const {NowUpdateXML, NowUpdateXMLStatus} = require("./NowUpdateXML");

class NowLinter {
  constructor(instance, options, tables) {
    this._profile = Object.assign({
      "domain": null,
      "username": null,
      "password": null
    }, instance || {});

    this._options = Object.assign({
      "query": "",
      "title": "Service Now ESLint Report",
      "skipInactive": false,
      "tables": {},
      "eslint": {
        "overrideConfig": null,
        "overrideConfigFile": null,
      }
    }, options || {});

    // TODO: validation
    // Assert.notEmpty("Query needs to be specified!");

    this.changes = {};
    this.tables = Object.assign({}, tables || {}, this._options.tables || {});

    this.loader = new NowLoader(this._profile.domain, this._profile.username, this._profile.password);
    this.eslint = new ESLint(this._options.eslint);
  }

  async fetch() {
    this.changes = {};

    const response = await this.loader.fetchUpdateXMLByUpdateSetQuery(this._options.query);

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
        this.tables[change.table].forEach(async (field) => {
          const data = NowLinter.getJSONFieldValue(change.payload, field);
          if (data == null || data === "") {
            change.setSkippedReport();
            return;
          }
          
          const report = await this.eslint.lintText(data);
          if (report.length) {
            report[0].filePath = "<" + change.name + "@" + field + ">";
            change.setReport(field, report[0]);
          }
        });
      });
  }

  getChanges() {
    return Object.values(this.changes);
  }

  async process() {
    await this.fetch();

    await this.lint();

    return this.getChanges();
  }

  toJSON() {
    const now = new Date();
    const slinceNo = -2;

    // TODO: process changes into a JSON
    const report = {
      config: {
        "domain": this._profile.domain,
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

    // TODO: redo this to a id order and separate map
    Object.entries(this.changes).forEach(([key, value]) => {
      ++report.stats.uniqueChanges;
      report.changes.push([key, value.toJSON()]);

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

  async report() {
    await this.process();
    return this.toJSON();
  }

  static getJSONFieldValue(payload, field) {
    return (payload[field] && (payload[field]._cdata || payload[field]._text)) || null;
  }
}

module.exports = NowLinter;
