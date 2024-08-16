import { writeFileSync } from "fs";
import { resolve } from "path";

import AbstractReportGenerator from "./AbstractReportGenerator.js";

export default class JSONReportGenerator extends AbstractReportGenerator {
  private padding = 2;

  build(data: unknown): string {
    return JSON.stringify(data, null, this.padding);
  }

  extension(): string {
    return "json";
  }

  save(folder: string, fileName: string, data: unknown): void {
    const document = this.build(data);
    writeFileSync(resolve(`${folder}/${fileName}.${this.extension()}`), document);
  }
}
