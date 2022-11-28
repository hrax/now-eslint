/* eslint-disable */
const {ESLint} = require("eslint");

const Assert = require("../util/Assert.js");
const HashHelper = require("../util/HashHelper.js");
const RESTHelper = require("../util/RestHelper.js");
const XPathHelper = require("../util/XPathHelper.js");
const UpdateXMLScan = require("./UpdateXMLScan.js");
// const PDFReportGenerator = require("../generator/PDFReportGenerator.js");
// const JSONReportGenerator = require("../generator/JSONReportGenerator.js");
const AbstractReportGenerator = require("../generator/AbstractReportGenerator.js");

class Linter {
  /**
   * 
   * @param {Profile} profile 
   * @param {Object} options 
   */
  constructor(profile, options) {
    Assert.notNull(options, "Options must be specified.");
    Assert.notEmpty(options.title, "Title in options needs to be specified.");
    Assert.notEmpty(options.query, "Query in options needs to be specified.");

    Object.defineProperty(this, "options", {
      writable: false,
      configurable: false,
      enumerable: true,
      value: Object.assign({
        "query": "",
        "title": "Service Now ESLint Report"
      }, options || {})
    });
    Object.freeze(this.options);

    Object.defineProperty(this, "changes", {
      writable: false,
      configurable: false,
      enumerable: true,
      value: new Map()
    });
    this._jsonData = null;
    
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
    this._jsonData = null;

    const response = await this.instance.requestUpdateXMLByUpdateSetQuery(this.options.query);

    // Get records from the response
    response.result.forEach((record) => {
      const data = RESTHelper.transformUpdateXMLToData(record);
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
          const data = XPathHelper.parseFieldValue(table, field, scan.payload);
          if (data == null || data === "") {
            scan.skip();
            return;
          }
          
          // data is default value
          if (this.profile.tables.get(table).defaults && this.profile.tables.get(table).defaults[field] && HashHelper.matches(data, this.profile.tables.get(table).defaults[field])) {
            scan.skip();
            return;
          }
          
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
    if (this._jsonData == null) {
      const data = {
        domain: this.profile.domain,
        username: this.profile.username,
        title: this.options.title,
        query: this.options.query,
        changes: Array.from(this.changes.entries()),
        resources: Object.fromEntries(this.profile.resources.entries()),
        metrics: {
          byStatus: {},
          totalChanges: 0,
          uniqueChanges: 0,
          totalUpdateSets: 0
        }
      };
  
      // Metrics
      const updateSets = new Set();
      data.changes.forEach(([name, scan]) => {
        // Status metrics
        if (data.metrics.byStatus[scan.status] == null) {
          data.metrics.byStatus[scan.status] = 0;
        }
        data.metrics.byStatus[scan.status]++;
  
        // Changes metrics
        data.metrics.totalChanges += parseInt(scan.updates);
        
        // Update Sets
        updateSets.add(scan.updateSet);
      });
      data.metrics.uniqueChanges = data.changes.length;
      data.metrics.totalUpdateSets = updateSets.size;

      this._jsonData = data;
    }

    // Lazy deep copy
    return JSON.parse(JSON.stringify(this._jsonData));
  }

  report(path, fileName, generator) {
    Assert.notEmpty(path, "path cannot be empty.");
    Assert.notEmpty(fileName, "fileName cannot be empty.");
    Assert.notNull(generator, "generator cannot be null.");
    Assert.isInstance(generator, AbstractReportGenerator, "provided generator needs to be instance of AbstractReportGenerator");

    const data = Object.assign({}, this.toJSON());
    generator.save(path, fileName, data);
  }
}

module.exports = Linter;