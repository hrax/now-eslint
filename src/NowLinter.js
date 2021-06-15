/* eslint-disable */
const {ESLint, Linter} = require("eslint");
const crypto = require("crypto");

const Assert = require("./util/Assert");
const helpers = require("./util/helpers");
const NowUpdateXMLScan = require("./NowUpdateXMLScan");

class NowLinter {
  /**
   * 
   * @param {NowProfile} profile 
   * @param {Object} options 
   */
  constructor(profile, options) {
    // TODO: validation
    Assert.notEmpty(options.query, "Query in options needs to be specified!");

    Object.defineProperty(this, "options", {
      writable: false,
      configurable: false,
      enumerable: true,
      value: Object.assign({
        "query": "",
        "title": "Service Now ESLint Report",
        "skipInactive": false,
        "eslint": {
          "overrideConfig": null,
          "overrideConfigFile": null,
        }
      }, options || {})
    });
    
    this.profile = profile;
    this.instance = this.profile.createInstance();
    this.eslint = new ESLint(this.options.eslint);
    this.changes = new Map();
  }

  /**
   * Fetch update set changes from the instance. Resets loaded changes on each call!
   * @returns {void}
   */
  async fetch() {
    this.changes.clear();

    const response = await this.instance.requestUpdateXMLByUpdateSetQuery(this.options.query);

    // Get records from the response
    response.result.forEach((record) => {
      const data = helpers.RESTHelper.transformUpdateXMLToData(record);
      const scan = new NowUpdateXMLScan(data);
      if (!this.changes.has(scan.name)) {
        this.changes.set(scan.name, scan);
      } else {
        this.changes.get(scan.name).incrementUpdateCount();
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
    this.changes.forEach((scan, name) => {
      if (scan.status !== "SCAN") {
        return;
      }
      
      const table = scan.targetTable;
      const fields = this.profile.getTableFields(table);
      if (fields == null || fields.length === 0) {
        scan.ignore();
        return;
      }

        /* if (this.options.skipInactive) {
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
        fields.forEach(async (field) => {
          const data = helpers.XPathHelper.parseFieldValue(table, field, scan.payload);
          if (data == null || data === "") {
            scan.skip();
            return;
          }
          
          /* // data is default value
          const hash = crypto.createHash("sha256").update(data).digest("hex");
          if (hash === this.tables[scan.table].defaults[field]) {
            scan.setSkippedReport();
            return;
          } */
          
          const report = await this.eslint.lintText(data);
          if (report.length) {
            report[0].filePath = "<" + scan.name + "@" + field + ">";
            scan.reports.set(field, report[0]);
          }
        });
      });
  }

  /**
   * Return changes fetched in this object
   */
  getChanges() {
    return this.changes;
  }

  /**
   * Shorthand function, for #fetch and #lint methods. Returns loaded changes.
   * @returns {Map}
   */
  async process() {
    await this.fetch();

    await this.lint();
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
        "query": this.options.query,
        "title": this.options.title,
        "name": this.options.name
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

  report(path, setup) {
    const data = {
      domain: this.profile.domain,
      username: this.profile.username,
      title: this.options.title,
      query: this.options.query,
      changes: this.changes,
      status: [
        {
          label: "OK",
          description: "Linted, no warnings or erros found"
        },
        {
          label: "ERROR",
          description: "Linted, at least one error found"
        },
        {
          label: "WARNING",
          description: "Linted, at least one warning found"
        },
        {
          label: "SKIPPED",
          description: "Should be linted but does not contain anything to lint"
        },
        {
          label: "IGNORE",
          description: "Do not lint (action delete or not configured table)"
        }
      ],
      resources: [
        {
          label: "aaa",
          link: "http://example.com"
        },
        {
          label: "bbb",
          link: "http://example.com"
        }
      ]
    };

    const generator = this.profile.createReportGenerator(setup.docDef);
    generator.setFonts(setup.fonts);
    if (setup.tableLayouts) {
      generator.setTableLayouts(setup.tableLayouts);
    }

    generator.generateReportTitle(data.title);

    generator.generateToc();

    // generator.generateLegalNotice();
    generator.generateOverview(data);
    generator.generateReportSummary(data);
    generator.generateReportFindings(data);

    generator.generate(path);
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
