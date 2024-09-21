import { writeFileSync } from "fs";
import { resolve } from "path";

import AbstractReportGenerator from "./AbstractReportGenerator.js";

export default class JSONReportGenerator extends AbstractReportGenerator {
  private padding = 2;

  build(data: unknown): string {
    return JSON.stringify(data, function(key: unknown, value: unknown) {
      if (typeof value === "object" && value instanceof Map) {
        return Object.fromEntries((value as Map<unknown, unknown>).entries());
      }
      return value;
    }, this.padding);
  }

  extension(): string {
    return "json";
  }

  save(folder: string, fileName: string, data: unknown): void {
    const document = this.build(data);
    writeFileSync(resolve(`${folder}/${fileName}.${this.extension()}`), document);
  }
}
