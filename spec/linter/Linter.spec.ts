import fs from "fs";
import { UpdateXMLScan } from "../../src/linter/UpdateXMLScan.js"
import { Linter } from "../../src/linter/Linter.js";
import { Profile } from "../../src/core/ProfileManager.js";

describe("LinterSpec", () => {
  /* beforeEach(() => {
    payload = fs.readFileSync("./spec/payloads/sys_script_include_50ba882f07d610108110f2ae7c1ed00d.xml", {encoding: "utf8"});
    data = {
      "name": "sys_script_include_50ba882f07d610108110f2ae7c1ed00d",
      "sys_id": "50ba882f07d610108110f2ae7c1ed00d",
      "action": "INSERT_OR_UPDATE",
      "sys_created_by": "admin",
      "sys_created_on": "1970-01-01 00:00:01",
      "sys_updated_by": "admin",
      "sys_updated_on": "1970-01-01 00:00:01",
      "type": "Script Include",
      "target_name": "sys_script_include_50ba882f07d610108110f2ae7c1ed00d",
      "update_set": "1234",
      "payload": payload
    };
  }); */

  it.skip("Fetch and prepare NowUpdateXML records", async() => {
    const options = {
      "title": "Test Report",
      "query": "name=Default"
    };
    const linter = <Linter> {};
    // spyOn(linter.instance, "requestUpdateXMLByUpdateSetQuery").and.returnValue({result: [data]});

    await linter.fetch();
    const changes = linter.changes;

    // expect(linter.instance.requestUpdateXMLByUpdateSetQuery).toHaveBeenCalledWith(options.query);
    // expect(linter.instance.requestUpdateXMLByUpdateSetQuery).toHaveBeenCalledTimes(1);
    // expect(changes.size).toBe(1);
    // expect(changes.values().next().value.id).toBe(data.sys_id);
  });

  it.skip("Lint NowUpdateXML records", async () => {
    const options = {
      "title": "Test Report",
      "query": "name=Default"
    };
    const linter = <Linter> {};
    
    // Not testing NowLoader
    // spyOn(linter.instance, "requestUpdateXMLByUpdateSetQuery").and.returnValue({result: [data]});

    // Not testing ESLint
    // spyOn(linter.eslint, "lintText").and.returnValue([{
    //   warningCount: 0,
    //   errorCount: 0
    // }]);

    await linter.process();

    const changes = linter.changes;

    // expect(linter.instance.requestUpdateXMLByUpdateSetQuery).toHaveBeenCalledTimes(1);
    // expect(linter.eslint.lintText).toHaveBeenCalledTimes(1);
    expect(changes.size).toBe(1);
    expect(changes.values().next().value.status).toBe("OK");
    console.log("SIZE " + changes.values().next().value.reports.size);
    expect(changes.values().next().value.reports.keys().next().value).toBe("script");
  });

  it.skip("Ignore not configured tables", async () => {
    const options = {
      "title": "Test Report",
      "query": "name=Default"
    };
    
    const linter = <Linter> {};
    
    // Not testing NowLoader
    // spyOn(linter.instance, "requestUpdateXMLByUpdateSetQuery").and.returnValue({result: [data]});

     // Not testing ESLint
    // spyOn(linter.eslint, "lintText").and.callThrough();

    await linter.process();

    const changes = linter.changes;

    // expect(linter.instance.requestUpdateXMLByUpdateSetQuery).toHaveBeenCalledTimes(1);
    // expect(linter.eslint.lintText).not.toHaveBeenCalled();

    expect(changes.size).toBe(1);
    // expect(changes.values().next().value.status).toBe(UpdateXMLScan.STATUS.IGNORED);
    expect(changes.values().next().value.hasReports).toBe(false);
  });

  it.skip("Skip on empty field", async () => {
    // payload = fs.readFileSync("./spec/payloads/sys_script_include_empty_script.xml", {encoding: "utf8"});
    // data.payload = payload;

    const options = {
      "title": "Test Report",
      "query": "name=Default"
    };
    
    const linter = <Linter> {};
    
    // Not testing NowLoader
    // spyOn(linter.instance, "requestUpdateXMLByUpdateSetQuery").and.returnValue({result: [data]});

     // Not testing ESLint
    // spyOn(linter.eslint, "lintText").and.callThrough();

    await linter.process();

    const changes = linter.changes;

    // expect(linter.instance.requestUpdateXMLByUpdateSetQuery).toHaveBeenCalledTimes(1);
    // expect(linter.eslint.lintText).not.toHaveBeenCalled();

    expect(changes.size).toBe(1);
    expect(changes.values().next().value.status).toBe("SKIPPED");
    expect(changes.values().next().value.hasReports).toBe(false);
  });

  it.skip("Skip on default value", async () => {
    // payload = fs.readFileSync("./spec/payloads/sys_script_include_default_script.xml", {encoding: "utf8"});
    // data.payload = payload;

    const options = {
      "title": "Test Report",
      "query": "name=Default"
    };
    
    const linter = <Linter> {};
    
    // Not testing NowLoader
    // spyOn(linter.instance, "requestUpdateXMLByUpdateSetQuery").and.returnValue({result: [data]});

     // Not testing ESLint
    // spyOn(linter.eslint, "lintText").and.callThrough();

    await linter.process();

    const changes = linter.changes;

    // expect(linter.instance.requestUpdateXMLByUpdateSetQuery).toHaveBeenCalledTimes(1);
    // expect(linter.eslint.lintText).not.toHaveBeenCalled();

    expect(changes.size).toBe(1);
    expect(changes.values().next().value.status).toBe("SKIPPED");
    expect(changes.values().next().value.hasReports).toBe(false);
  });
});