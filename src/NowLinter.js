/* eslint-disable */
const {ESLint, Linter} = require("eslint");
const crypto = require("crypto");

const Assert = require("./util/Assert");
const helpers = require("./util/helpers");
const UpdateXMLScan = require("./UpdateXMLScan");

class NowLinter {
  /**
   * 
   * @param {Profile} profile 
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
        "title": "Service Now ESLint Report"
      }, options || {})
    });

    Object.defineProperty(this, "changes", {
      writable: false,
      configurable: false,
      enumerable: true,
      value: new Map()
    });
    
    this.profile = profile;
    this.instance = this.profile.createInstance();
    this.eslint = new ESLint(Object.fromEntries(this.profile.eslint.entries()));
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
      const scan = new UpdateXMLScan(data);
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
      if (!this.profile.tables.has(table)) {
        scan.ignore();
        return;
      }

      const fields = this.profile.tables.get(table).fields || null;
      if (fields == null || fields.length === 0) {
        scan.manual();
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
   * Shorthand function, for #fetch and #lint methods.
   */
  async process() {
    await this.fetch();

    await this.lint();
  }

  /**
   * Serialize the current state of the report and its changes into a JSON object.
   * @returns {Object}
   */
  toJSON() {
    const data = {
      "domain": this.profile.domain,
      "title": this.options.title,
      "query": this.options.query,
      "changes": Object.fromEntries(this.changes)
    };

    // Lazy deep copy
    return JSON.parse(JSON.stringify(data));
  }

  report(path) {
    Assert.notEmpty(path, "path cannot be empty.");
    const data = Object.assign({}, {
      domain: this.profile.domain,
      username: this.profile.username,
      title: this.options.title,
      query: this.options.query,
      changes: this.changes
    }, {
      // resources: this.profile.resources.has("resources") ? this.profile.properties.get("resources") : []
    });

    const generator = this.profile.createReportGenerator();
    generator.generate(data, path);
  }
}

module.exports = NowLinter;
