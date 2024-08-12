/* eslint-disable */
import { ESLint } from "eslint";

import { UpdateXMLScan } from "./UpdateXMLScan.js";
import AbstractReportGenerator from "../generator/AbstractReportGenerator.js";
import { Profile } from "../core/ProfileManager.js";
import { RESTClient } from "../core/RESTClient.js";
import { DOMParser } from "@xmldom/xmldom";
import { xmlhelpers } from "../util/helpers.js";

export interface LinterOptions {
  title: string;
  query: string;
};

export class Linter {

  private profile: Profile;
  private options: LinterOptions;
  private client: RESTClient;
  private eslint: ESLint = new ESLint();
  private changes: Map<string, UpdateXMLScan> = new Map();
  private metrics: Map<string, any> = new Map();

  /**
   * 
   * @param {Profile} profile 
   * @param {Object} options 
   */
  constructor(profile: Profile, client: RESTClient, options: LinterOptions) {
    this.profile = profile;
    this.client = client;
    this.options = options;
  }

  /**
   * Fetch update set changes from the instance. Resets loaded changes & metrics on each call!
   * @returns {void}
   */
  async fetch(): Promise<void> {
    this.changes.clear();
    this.metrics.clear();

    const changes = await this.client.loadUpdateXMLByUpdateSetQuery(this.profile, this.options.query);
    // Get records from the response
    changes.forEach((change) => {
      const scan = new UpdateXMLScan(change);
      scan.parsePayload();
      if (!this.changes.has(scan.name)) {
        this.changes.set(scan.name, scan);
      } else {
        this.changes.get(scan.name)!.updates += change.sys_mod_count;
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
  async lint(): Promise<void> {
    const updateSetIDs = new Set();
    const config = this.profile.getTableConfiguration();

    // Check the changes against configured lint tables
    this.changes.forEach((scan, name) => {
      if (scan.status() !== "SCAN") {
        return;
      }
      
      const table = scan.targetTable;
      if (config!.tables[table] == null) {
        scan.ignore();
        return;
      }

      const fields = config!.tables[table].fields || null;
      if (fields == null || Object.keys(fields).length === 0) {
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

      const document = new DOMParser().parseFromString(scan.payload);
      // For each configured field run lint
      Object.values(fields).forEach(async (field) => {
        const data = xmlhelpers.parsePayloadTableFieldValue(table, field.name, document);
        if (data == null || data === "") {
          scan.skip();
          return;
        }
        
        // data is default value
        /* if (config!.tables.get(table).defaults && this.profile.tables.get(table).defaults[field] && HashHelper.matches(data, this.profile.tables.get(table).defaults[field])) {
          scan.skip();
          return;
        } */
        
        const report = await this.eslint.lintText(data);
        if (report.length) {
          report[0].filePath = scan.reportPathForField(field.name);
          scan.reports.set(field.name, report[0]);
        }
      });
    });
      
    // Metrics
    this.metrics.set("byStatus", {});
    this.metrics.set("totalChanges", 0);
    this.metrics.set("uniqueChanges", 0);
    this.metrics.set("totalUpdateSets", 0);
    
    // Calculate metrics
    this.changes.forEach((scan, name) => {
      // Status metrics
      if (this.metrics.get("byStatus")[scan.status()] == null) {
        this.metrics.get("byStatus")[scan.status()] = 0;
      }
      this.metrics.get("byStatus")[scan.status()]++;

      // Changes metrics
      this.metrics.set("totalChanges", this.metrics.get("totalChanges") + scan.updates);
      
      // Update Sets
      updateSetIDs.add(scan.updateSetID);
    });
    this.metrics.set("uniqueChanges", this.changes.size);
    this.metrics.set("totalUpdateSets", updateSetIDs.size);
  }

  /**
   * Shorthand function, for #fetch and #lint methods.
   */
  async process() {
    await this.fetch();
    await this.lint();
  }

  report(path: string, fileName: string, generator: AbstractReportGenerator) {
    const data = {};
    generator.save(path, fileName, data);
  }
}

module.exports = Linter;