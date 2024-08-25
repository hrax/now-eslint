import { ESLint } from "eslint";
import { SNUpdateXML } from "../core/sn.js";

export type UpdateXMLScanStatus =
   // Do not lint (deleted record)
  "DELETED" |

  // Do not lint (not configured table)
  "IGNORED" |

  // Do not lint, should be checked manually (has no fields to check, but still configured)
  "MANUAL" |

  // JSON payload initialized can be scanned based on configuration
  "SCAN" |

  // JSON payload detected as inactive; mark, do not lint
  "INACTIVE" |

  // Should be linted but does not contain anything to lint
  "SKIPPED" |

  // Linted, at least one error found
  "ERROR" |

  // Linted, at least one warning found
  "WARNING" |

  // Linted, no warnings or erros found
  "OK";

export class UpdateXMLScan extends SNUpdateXML {
  private status: UpdateXMLScanStatus = "SCAN";
  private reports: Map<string, ESLint.LintResult> = new Map<string, ESLint.LintResult>();

  getStatus(): UpdateXMLScanStatus {
    if (this.action === "DELETE") {
      return "DELETED";
    }

    if (this.hasReportsErrors()) {
      return "ERROR";
    }

    if (this.hasReportsWarnings()) {
      return "WARNING";
    }

    if (this.hasReports()) {
      return "OK";
    }

    return this.status;
  }

  setIgnore(): void {
    this.status = "IGNORED";
  }

  setManual(): void {
    this.status = "MANUAL";
  }

  setSkip(): void {
    this.status = "SKIPPED";
  }

  getReportsWarningCount(): number {
    if (this.reports == null || this.reports.size === 0) {
      return 0;
    }
    let count = 0;
    this.reports.forEach((value) => count = count + (value.warningCount ?? 0));
    return count;
  }

  setReport(field: string, report: ESLint.LintResult): void {
    this.reports.set(field, report);
  }

  getReports() {
    return this.reports;
  }

  hasReports(): boolean {
    return this.reports.size > 0;
  }

  hasReportsWarnings(): boolean {
    return this.getReportsWarningCount() !== 0;
  }

  getReportsErrorCount(): number {
    if (this.reports == null || this.reports.size === 0) {
      return 0;
    }
    let count = 0;
    this.reports.forEach((value) => count = count + (value.errorCount ?? 0));
    return count;
  }

  hasReportsErrors(): boolean {
    return this.getReportsErrorCount() !== 0;
  }

  reportPathForField(field: string): string {
    return `<${this.updateSetID}/${this.targetTable}/${field}.js>`;
  }

  toJSON() {
    return Object.assign({}, super.toJSON(), {
      warningCount: this.getReportsWarningCount(),
      errorCount: this.getReportsErrorCount(),
      hasWarning: this.hasReportsWarnings(),
      hasError: this.hasReportsErrors(),
      status: this.getStatus(),
      reports: Array.from(this.reports.entries())
    });
  }
}