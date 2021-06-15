const NowUpdateXML = require("./now/NowUpdateXML");

const NowUpdateXMLScanStatus = {
  // Do not lint (action delete or not configured table)
  IGNORE: "IGNORE",
  // Linted, at least one warning found
  WARNING: "WARNING",
  // Linted, at least one error found
  ERROR: "ERROR",
  // Linted, no warnings or erros found
  OK: "OK",
  // Should be linted but does not contain anything to lint
  SKIPPED: "SKIPPED",
  // JSON payload initialized can be scanned based on configuration
  SCAN: "SCAN",
  // JSON payload detected as inactive; mark, do not lint
  INACTIVE: "INACTIVE"
};
Object.freeze(NowUpdateXMLScanStatus);

class NowUpdateXMLScan extends NowUpdateXML {
  constructor(data) {
    super(data);
    const propertyConfig = {
      configurable: false,
      enumerable: true
    };

    this.updates = 1;
    // Map[field, report]
    this.reports = new Map();
    Object.defineProperty(this, "ignored", Object.assign({}, propertyConfig, {
      writable: true,
      enumerable: false,
      value: false
    }));

    Object.defineProperty(this, "skipped", Object.assign({}, propertyConfig, {
      writable: true,
      enumerable: false,
      value: false
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
        if (this.ignored) {
          return NowUpdateXMLScanStatus.IGNORE;
        }
        
        if (this.skipped) {
          return NowUpdateXMLScanStatus.SKIPPED;
        }

        if (this.hasError) {
          return NowUpdateXMLScanStatus.ERROR;
        }

        if (this.hasWarning) {
          return NowUpdateXMLScanStatus.WARNING;
        }

        if (this.reports.size > 0) {
          return NowUpdateXMLScanStatus.OK;
        }

        return this.action.toLowerCase() === "delete" ? NowUpdateXMLScanStatus.IGNORE : NowUpdateXMLScanStatus.SCAN;
      }
    }));
  }

  ignore() {
    this.ignored = true;
  }

  skip() {
    this.skipped = true;
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
      reports: Object.fromEntries(this.reports.entries())
    });
  }
}

Object.defineProperty(NowUpdateXMLScan, "STATUS", {
  enumerable: true,
  configurable: false,
  writable: false,
  value: NowUpdateXMLScanStatus
});

module.exports = NowUpdateXMLScan;