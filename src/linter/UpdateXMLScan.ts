import { SNUpdateXML, SNUpdateXMLData } from "../core/sn";

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

  private _status: UpdateXMLScanStatus = "SCAN";

  reports: Map<string, any> = new Map();

  constructor(data?: SNUpdateXMLData) {
    super(data);
  }

  status(): UpdateXMLScanStatus {
    return this._status;
  }

  ignore(): void {
    this._status = "IGNORED";
  }

  manual(): void {
    this._status = "MANUAL";
  }

  skip(): void {
    this._status = "SKIPPED";
  }

  reportPathForField(field: string): string {
    return `<${this.updateSetID}/${this.targetTable}/${field}.js>`;
  }

}