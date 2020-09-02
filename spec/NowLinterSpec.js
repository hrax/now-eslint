/* eslint-disable */
const fs = require("fs");
const {NowUpdateXMLAction,NowUpdateXMLStatus} = require("../src/NowUpdateXML");
const NowLinter = require("../src/NowLinter.js");

describe("NowLinter", () => {
  const _createLinter = (options, tables) => {
    return new NowLinter({
      "domain": "???",
      "username": "???",
      "password": "???"
    }, options, tables);
  };

  let payload = null;
  let data = null;

  beforeEach(() => {
    payload = fs.readFileSync("./spec/payloads/sys_script_include_50ba882f07d610108110f2ae7c1ed00d.xml", {encoding: "utf8"});
    data = {
      "name": "sys_script_include_50ba882f07d610108110f2ae7c1ed00d",
      "sys_id": "43ca802f07d610108110f2ae7c1ed05a",
      "action": NowUpdateXMLAction.INSERT_OR_UPDATE,
      "sys_created_by": "admin",
      "sys_created_on": "1970-01-01 00:00:01",
      "sys_updated_by": "admin",
      "sys_updated_on": "1970-01-01 00:00:01",
      "type": "Script Include",
      "target_name": "sys_script_include_50ba882f07d610108110f2ae7c1ed00d",
      "update_set": "1234",
      "payload": payload
    };
  });

  it("Fetch and prepare NowUpdateXML records", async() => {
    const options = {
      "title": "Test Report",
      "query": "name=Default"
    };
    const linter = _createLinter(options, {"sys_script_include": ["script"]});
    spyOn(linter.loader, "fetchUpdateXMLByUpdateSetQuery").and.returnValue({result: [data]});

    await linter.fetch();
    const changes = linter.getChanges();

    expect(linter.loader.fetchUpdateXMLByUpdateSetQuery).toHaveBeenCalledWith(options.query);
    expect(linter.loader.fetchUpdateXMLByUpdateSetQuery).toHaveBeenCalledTimes(1);
    expect(changes.length).toBe(1);
    expect(changes[0].id).toBe(data.sys_id);
  });

  it("Lint NowUpdateXML records", async () => {
    const options = {
      "title": "Test Report",
      "query": "name=Default"
    };
    const linter = _createLinter(options, {"sys_script_include": ["script"]});
    
    // Not testing NowLoader
    spyOn(linter.loader, "fetchUpdateXMLByUpdateSetQuery").and.returnValue({result: [data]});

    // Not testing ESLint
    spyOn(linter.eslint, "lintText").and.returnValue({results: [{
      warningCount: 0,
      errorCount: 0
    }]});

    await linter.process();

    const changes = linter.getChanges();

    expect(linter.loader.fetchUpdateXMLByUpdateSetQuery).toHaveBeenCalledTimes(1);
    expect(linter.eslint.lintText).toHaveBeenCalledTimes(1);
    expect(changes.length).toBe(1);
    expect(changes[0].status).toBe(NowUpdateXMLStatus.OK);
    expect(changes[0].reportEntries[0][0]).toBe("script");
  });

  it("Ignore not configured tables", async () => {
    const options = {
      "title": "Test Report",
      "query": "name=Default"
    };
    
    const linter = _createLinter(options, {"sys_script": ["script"]});
    
    // Not testing NowLoader
    spyOn(linter.loader, "fetchUpdateXMLByUpdateSetQuery").and.returnValue({result: [data]});

     // Not testing ESLint
    spyOn(linter.eslint, "lintText").and.callThrough();

    await linter.process();

    const changes = linter.getChanges();

    expect(linter.loader.fetchUpdateXMLByUpdateSetQuery).toHaveBeenCalledTimes(1);
    expect(linter.eslint.lintText).not.toHaveBeenCalled();

    expect(changes.length).toBe(1);
    expect(changes[0].status).toBe(NowUpdateXMLStatus.IGNORE);
    expect(changes[0].hasReports).toBe(false);
  });

  it("Skip on empty field", async () => {
    payload = fs.readFileSync("./spec/payloads/sys_script_include_empty_script.xml", {encoding: "utf8"});
    data.payload = payload;

    const options = {
      "title": "Test Report",
      "query": "name=Default"
    };
    
    const linter = _createLinter(options, {"sys_script_include": ["script"]});
    
    // Not testing NowLoader
    spyOn(linter.loader, "fetchUpdateXMLByUpdateSetQuery").and.returnValue({result: [data]});

     // Not testing ESLint
    spyOn(linter.eslint, "lintText").and.callThrough();

    await linter.process();

    const changes = linter.getChanges();

    expect(linter.loader.fetchUpdateXMLByUpdateSetQuery).toHaveBeenCalledTimes(1);
    expect(linter.eslint.lintText).not.toHaveBeenCalled();

    expect(changes.length).toBe(1);
    expect(changes[0].status).toBe(NowUpdateXMLStatus.SKIPPED);
    expect(changes[0].hasReports).toBe(false);
  });
});