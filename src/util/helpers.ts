import { DOMParser } from "@xmldom/xmldom";
import * as xpath from "xpath";

export namespace xmlhelpers {
  
  /* export const template = (strings: string, ...keys: string[]) => {
    return (...values: string[]) => {
      const dict = values[values.length - 1] || {};
      const result = [strings[0]];
      keys.forEach((key: number | string, i) => {
        const value = (Number.isInteger(key) ? values[<number> key] : dict[<string> key]) || key;
        result.push(value, strings[i + 1]);
      });
      return result.join("");
    }
  */

  export function parsePayloadTableName(document: Document): string {
    const tableName = xpath.select1("string(//*[@table]/@table)", document);
    if (tableName == null) {
      return "";
    }
    return <string> tableName;
  }

  export function parsePayloadTableFieldValue(table: string, field: string, document: Document): string {
    const data = xpath.select1(`string(//record_update[@table]/${table}/${field}/text())`, document);
    if (data == null) {
      return "";
    }
    return <string> data;
  }
};