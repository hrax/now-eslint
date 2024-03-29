const UpdateXML = require("../core/UpdateXML.js");

const UpdateXMLScanStatus = {
  // Do not lint (deleted record)
  DELETED: "DELETED",

  // Do not lint (not configured table)
  IGNORED: "IGNORED",

  // Do not lint, should be checked manually (has no fields to check, but still configured)
  MANUAL: "MANUAL",

  // JSON payload initialized can be scanned based on configuration
  SCAN: "SCAN",

  // JSON payload detected as inactive; mark, do not lint
  INACTIVE: "INACTIVE",

  // Should be linted but does not contain anything to lint
  SKIPPED: "SKIPPED",

  // Linted, at least one error found
  ERROR: "ERROR",

  // Linted, at least one warning found
  WARNING: "WARNING",

  // Linted, no warnings or erros found
  OK: "OK"
};
Object.freeze(UpdateXMLScanStatus);

class UpdateXMLScan extends UpdateXML {
  constructor(data) {
    super(data);
    const propertyConfig = {
      configurable: false,
      enumerable: true
    };

    Object.defineProperty(this, "updates", Object.assign({}, propertyConfig, {
      writable: true,
      enumerable: true,
      value: 1
    }));
    
    // Map[field:String, report:Array]
    Object.defineProperty(this, "reports", Object.assign({}, propertyConfig, {
      writable: true,
      enumerable: true,
      value: new Map()
    }));

    Object.defineProperty(this, "command", Object.assign({}, propertyConfig, {
      writable: true,
      enumerable: false,
      value: null
    }));

    Object.defineProperty(this, "warningCount", Object.assign({}, propertyConfig, {
      get() {
        if (this.reports.size === 0) {
          return 0;
        }
        let count = 0;
        this.reports.forEach((value, key) => {
          count = count + value.warningCount;
        });
        return count;
      }
    }));

    Object.defineProperty(this, "errorCount", Object.assign({}, propertyConfig, {
      get() {
        if (this.reports.size === 0) {
          return 0;
        }
        let count = 0;
        this.reports.forEach((value) => {
          count = count + value.errorCount;
        });
        return count;
      }
    }));

    Object.defineProperty(this, "hasWarning", Object.assign({}, propertyConfig, {
      get() {
        if (this.reports.size === 0) {
          return false;
        }
        const it = this.reports.values();
        for (let value of it) {
          if (value.warningCount > 0) {
            return true;
          }
        }
        return false;
      }
    }));

    Object.defineProperty(this, "hasError", Object.assign({}, propertyConfig, {
      get() {
        if (this.reports.size === 0) {
          return false;
        }
        const it = this.reports.values();
        for (let value of it) {
          if (value.errorCount > 0) {
            return true;
          }
        }
        return false;
      }
    }));
    
    Object.defineProperty(this, "hasReports", Object.assign({}, propertyConfig, {
      get() {
        return this.reports.size > 0;
      }
    }));

    Object.defineProperty(this, "status", Object.assign({}, propertyConfig, {
      get() {
        // Do not perform any other checks if action is delete
        if (this.action.toLowerCase() === "delete") {
          return UpdateXMLScanStatus.DELETED;
        }

        if (this.command != null && !this.hasReports) {
          return this.command;
        }

        if (this.hasError) {
          return UpdateXMLScanStatus.ERROR;
        }

        if (this.hasWarning) {
          return UpdateXMLScanStatus.WARNING;
        }

        if (this.hasReports) {
          return UpdateXMLScanStatus.OK;
        }

        // Default status
        return UpdateXMLScanStatus.SCAN;
      }
    }));
  }

  ignore() {
    this.command = UpdateXMLScanStatus.IGNORED;
  }

  skip() {
    this.command = UpdateXMLScanStatus.SKIPPED;
  }

  manual() {
    this.command = UpdateXMLScanStatus.MANUAL;
  }

  incrementUpdateCount() {
    this.updates++;
  }

  toJSON() {
    return Object.assign({}, super.toJSON(), {
      warningCount: this.warningCount,
      errorCount: this.errorCount,
      hasWarning: this.hasWarning,
      hasError: this.hasError,
      status: this.status,
      updates: this.updates,
      reports: Array.from(this.reports.entries())
    });
  }
}

module.exports = UpdateXMLScan;
module.exports.STATUS = UpdateXMLScanStatus;