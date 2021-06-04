
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

class NowUpdateXMLScan {
  constructor(update) {
    Object.defineProperty(this, "update", {
      value: update,
      configurable: false,
      writable: false,
      enumerable: true
    });
    Object.defineProperty(this, "name", {
      configurable: false,
      enumerable: true,
      get() {
        return this.update.name;
      }
    });
    Object.defineProperty(this, "payload", {
      configurable: false,
      enumerable: true,
      get() {
        return this.update.payload;
      }
    });
    this.status = update.action === "DELETE" ? NowUpdateXMLScanStatus.IGNORE : NowUpdateXMLScanStatus.SCAN;
    this.warningCount = 0;
    this.errorCount = 0;
    this.reports = new Map();
  }
}

module.exports = NowUpdateXMLScan;