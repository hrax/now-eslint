/* eslint-disable */
import { ESLint } from "eslint";
import { DOMParser } from "@xmldom/xmldom";

import { UpdateXMLScan } from "./UpdateXMLScan.js";
import AbstractReportGenerator from "../generator/AbstractReportGenerator.js";
import profileManager, { Profile } from "../core/ProfileManager.js";
import { RESTClient } from "../core/RESTClient.js";
import * as xmlhelpers from "../util/xmlhelpers.js";
import { SNField } from "../core/sn.js";

export interface LinterOptions {
  title: string;
  query: string;
};

export type LinterMetricType = "byStatus" | "totalChanges" | "uniqueChanges" | "totalUpdateSets";

export class Linter {

  static readonly METRIC_BY_STATUS: LinterMetricType = "byStatus";
  static readonly METRIC_TOTAL_CHANGES: LinterMetricType = "totalChanges";
  static readonly METRIC_UNIQUE_CHANGES: LinterMetricType = "uniqueChanges";
  static readonly METRIC_TOTAL_UPDATE_SETS: LinterMetricType = "totalUpdateSets";

  private profile: Profile;
  private options: LinterOptions;
  private client: RESTClient;
  private eslint: ESLint = new ESLint();
  changes: Map<string, UpdateXMLScan> = new Map<string, UpdateXMLScan>();
  metrics: Map<LinterMetricType, any> = new Map<LinterMetricType, any>();

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

  getESLint(): ESLint {
    return this.eslint;
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
      if (scan.getStatus() !== "SCAN") {
        return;
      }
      
      const table = scan.targetTable;
      if (config?.tables[table] == null) {
        scan.setIgnore();
        return;
      }

      const fields = config?.tables[table].fields ?? null;
      if (fields == null || Object.keys(fields).length === 0) {
        scan.setManual();
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
      Object.values(fields).forEach(async (field: SNField) => {
        const data = xmlhelpers.parsePayloadTableFieldValue(table, field.name, document);
        if (data == null || data === "") {
          scan.setSkip();
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
          scan.setReport(field.name, report[0]);
        }
      });
    });
      
    // Metrics
    this.metrics.set(Linter.METRIC_BY_STATUS, {});
    this.metrics.set(Linter.METRIC_TOTAL_CHANGES, 0);
    this.metrics.set(Linter.METRIC_UNIQUE_CHANGES, 0);
    this.metrics.set(Linter.METRIC_TOTAL_UPDATE_SETS, 0);
    
    // Calculate metrics
    this.changes.forEach((scan, name) => {
      // Status metrics
      if (this.metrics.get(Linter.METRIC_BY_STATUS)[scan.getStatus()] == null) {
        this.metrics.get(Linter.METRIC_BY_STATUS)[scan.getStatus()] = 0;
      }
      this.metrics.get(Linter.METRIC_BY_STATUS)[scan.getStatus()]++;

      // Changes metrics
      this.metrics.set(Linter.METRIC_TOTAL_CHANGES, this.metrics.get(Linter.METRIC_TOTAL_CHANGES) + scan.updates);
      
      // Update Sets
      updateSetIDs.add(scan.updateSetID);
    });
    this.metrics.set(Linter.METRIC_UNIQUE_CHANGES, this.changes.size);
    this.metrics.set(Linter.METRIC_TOTAL_UPDATE_SETS, updateSetIDs.size);
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