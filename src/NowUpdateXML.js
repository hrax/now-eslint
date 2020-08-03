const Assert = require("./Assert.js");
const xml2js = require("xml-js");

const NowUpdateXMLAction = {
  INSERT_OR_UPDATE: "INSERT_OR_UPDATE",
  DELETE: "DELETE"
};

const NowUpdateXMLStatus = {
  // Do not lint
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

class NowUpdateXML {
  constructor(data, dryRun) {
    Assert.notNull(data, "Data must not be null.");
    Assert.isObject(data, "Data must be an Object.");
    Assert.objectContainsAllProperties(data, ["sys_id","name","action","sys_created_by","sys_created_on","sys_updated_by","sys_updated_on","type","target_name","update_set","payload"], "Data object must contain all of the following properties {0}.");

    dryRun = dryRun || false;

    this._initialized = false;

    this._name = data.name;
    this._id = data.sys_id;
    this._action = data.action;
    this._updateCount = 1;

    this._createdBy = data.sys_created_by;
    this._createdOn = data.sys_created_on;
    this._updatedBy = data.sys_updated_by;
    this._updatedOn = data.sys_updated_on;

    this._type = data.type;
    this._targetName = data.target_name;
    this._table = null;
    this._updateSet = data.update_set;

    // ESLint specific

    // By default ignore everything, once json payload is intialized status will be updated to scan
    this._status = NowUpdateXMLStatus.IGNORE;
    this._reports = {};
    this._warningCount = 0;
    this._errorCount = 0;

    if (this._action === NowUpdateXMLAction.INSERT_OR_UPDATE) {
      this._payloadXML = data.payload;
      this._payloadJSON = null;
    }

    if (dryRun === false) {
      this.initialize();
    }
  }

  initialize() {
    try {
      if (this._initialized === true || this._action !== NowUpdateXMLAction.INSERT_OR_UPDATE || this._payloadJSON != null) {
        return;
      }

      // Parse XML payload into JSON
      const payloadJSON = JSON.parse(xml2js.xml2json(this._payloadXML, {compact: true}));
      const record = payloadJSON.record_update;
      // Sys_dictionary changes do not have table specified as attribute, default to name of the first child
      const table = record._attributes ? record._attributes.table : Object.keys(record)[0];

      // Set up table value
      this._table = table;

      // Set up JSON payload to the "top" record element
      this._payloadJSON = record[table];

      // We have initialized payload, mark as ready to scan
      this._status = NowUpdateXMLStatus.SCAN;
    } finally {
      // Always initialize!
      this._initialized = true;
    }
  }

  get isInitialized() {
    return this._initialized;
  }

  get name() {
    return this._name;
  }

  get id() {
    return this._id;
  }

  get action() {
    return this._action;
  }

  get updateCount() {
    return this._updateCount;
  }

  incrementUpdateCount() {
    this._updateCount++;
  }

  get createdBy() {
    return this._createdBy;
  }

  get createdOn() {
    return this._createdOn;
  }

  get updatedBy() {
    return this._updatedBy;
  }

  get updatedOn() {
    return this._updatedOn;
  }

  get type() {
    return this._type;
  }

  get targetName() {
    return this._targetName;
  }

  get table() {
    return this._table;
  }

  get updateSet() {
    return this._updateSet;
  }

  get payloadXML() {
    return this._payloadXML;
  }

  get payload() {
    return this._payloadJSON;
  }

  get status() {
    return this._status;
  }

  get hasReports() {
    return Object.keys(this._reports).length !== 0;
  }

  get reportEntries() {
    return Object.entries(this._reports);
  }

  get reportFields() {
    return Object.keys(this._reports);
  }

  get reports() {
    return Object.values(this._reports);
  }

  setReport(fieldName, report) {
    this._reports[fieldName] = report;

    this._warningCount = this._warningCount + report.warningCount;
    this._errorCount = this._errorCount + report.errorCount;

    if (this.hasErrors) {
      this._status = NowUpdateXMLStatus.ERROR;
    } else if (this.hasWarnings) {
      this._status = NowUpdateXMLStatus.WARNING;
    } else {
      this._status = NowUpdateXMLStatus.OK;
    }
  }

  setSkippedReport() {
    if (this.hasReports || this._status === NowUpdateXMLStatus.SKIPPED) {
      return;
    }

    this._status = NowUpdateXMLStatus.SKIPPED;
  }

  setIgnoreReport() {
    if (this._status !== NowUpdateXMLStatus.SCAN) {
      return;
    }

    this._status = NowUpdateXMLStatus.IGNORE;
  }

  setInactiveReport() {
    if (this._status === NowUpdateXMLStatus.INACTIVE) {
      return;
    }

    this._status = NowUpdateXMLStatus.INACTIVE;
  }

  get warningCount() {
    return this._warningCount;
  }

  get errorCount() {
    return this._errorCount;
  }

  get hasWarnings() {
    return this._warningCount > 0;
  }

  get hasErrors() {
    return this._errorCount > 0;
  }
}

module.exports = {
  "NowUpdateXMLAction": NowUpdateXMLAction,
  "NowUpdateXMLStatus": NowUpdateXMLStatus,
  "NowUpdateXML": NowUpdateXML
};