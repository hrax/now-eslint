/* eslint-disable */
const {ESLint, Linter} = require("eslint");
const crypto = require("crypto");

const helpers = require("./helpers");
const Assert = require("./Assert");
const NowInstance = require("./NowInstance");
const {NowUpdateXML, NowUpdateXMLStatus} = require("./NowUpdateXML");

class NowLinter {
  constructor(conn, options, tables) {
    this._profile = Object.assign({
      "domain": null,
      "username": null,
      "password": null,
      "proxy": null
    }, conn || {});

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
    
    this.tables = Object.assign({}, tables || {}, this._options.tables || {});

    // TODO: validation
    Assert.notEmpty(this._options.query, "Query in options needs to be specified!");

    this.instance = new NowInstance(this._profile);
    this.eslint = new ESLint(this._options.eslint);
    this.changes = {};
  }

  /**
   * Fetch update set changes from the instance. Resets loaded changes on each call!
   * @returns {void}
   */
  async fetch() {
    this.changes = {};

    const response = await this.instance.requestUpdateXMLByUpdateSetQuery(this._options.query);

    // Get records from the response
    response.result.forEach((record) => {
      const data = helpers.RESTHelper.transformUpdateXMLToData(record);
      const scan = new NowUpdateXMLScan(new NowUpdateXML(data));
      if (!this.changes[scan.name]) {
        this.changes[scan.name] = scan;
      }
    });
  }

  /**
   * Lint fetched change records. Should be called after the change records
   * have been loaded and processed
   *
   * @see #fetch()
   * @return {void}
   */
  async lint() {
    // Check the changes against configured lint tables
    Object.values(this.changes).filter((change) => {
      return change.report.status === NowUpdateXMLStatus.SCAN;
    })
      .forEach((change) => {
        if (change.targetTable == null || !this.tables[change.targetTable] || this.tables[change.targetTable] == null) {
          change.report.status = NowUpdateXMLStatus.IGNORE;
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
        this.tables[change.table].fields.forEach(async (field) => {
          const data = NowLinter.getJSONFieldValue(change.payload, field);
          if (data == null || data === "") {
            change.setSkippedReport();
            return;
          }
          
          // data is default value
          const hash = crypto.createHash("sha256").update(data).digest("hex");
          if (hash === this.tables[change.table].defaults[field]) {
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

  /**
   * Return changes fetched in this object
   */
  getChanges() {
    return Object.values(this.changes);
  }

  /**
   * Shorthand function, for #fetch and #lint methods. Returns loaded changes.
   * @returns {Object}
   */
  async process() {
    await this.fetch();

    await this.lint();

    return this.getChanges();
  }

  /**
   * Serialize the current state of the report and its changes into a JSON object.
   * TODO: Deep copy
   * @returns {Object}
   */
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
      } else if (value.status === "WARNING") {
        report.stats.type.warningCount++;
      } else if (value.status === "ERROR") {
        report.stats.type.errorCount++;
      } else if (value.status === "OK") {
        report.stats.type.okCount++;
      } else if (value.status === "SKIPPED") {
        report.stats.type.skippedCount++;
      } else if (value.status === "SCAN") {
        report.stats.type.scanCount++;
      }
    });

    return report;
  }

  async report() {
    await this.process();
    return this.toJSON();
  }

  /**
   * Retrieve field value from payload from either parsed CDATA or text or returns null
   * @param {Object} payload The parsed payload JSON object
   * @param {String} field The string to retrieve
   * @returns {String} or null
   */
  static getJSONFieldValue(payload, field) {
    return (payload[field] && (payload[field]._cdata || payload[field]._text)) || null;
  }
}

module.exports = NowLinter;
