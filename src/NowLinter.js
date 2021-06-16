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
    this.eslint = new ESLint(this.profile.properties.get("eslint") || {});
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

  report(path, pdfsetup) {
    Assert.notEmpty(path, "path cannot be empty.");
    Assert.notNull(pdfsetup, "pdfsetup cannot be null.");
    Assert.isFunction(pdfsetup, "pdfsetup must be a function.");
    const data = Object.assign({}, {
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
      ]
    }, {
      resources: this.profile.properties.has("resources") ? this.profile.properties.get("resources") : []
    });

    const setup = pdfsetup(data);

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
