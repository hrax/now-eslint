/* eslint-disable */
const fs = require("fs");
const NowUpdateXMLScan = require("../src/NowUpdateXMLScan");
const NowLinter = require("../src/NowLinter");
const NowProfile = require("../src/NowProfile");

describe("NowLinter", () => {
  const _createLinter = (options, tables) => {
    const profile = new NowProfile({
      "domain": "???",
      "username": "???",
      "password": "???"
    });
    profile.setTables(tables);
    return new NowLinter(profile, options);
  };

  let payload = null;
  let data = null;

  beforeEach(() => {
    payload = fs.readFileSync("./spec/payloads/sys_script_include_50ba882f07d610108110f2ae7c1ed00d.xml", {encoding: "utf8"});
    data = {
      "name": "sys_script_include_50ba882f07d610108110f2ae7c1ed00d",
      "sys_id": "43ca802f07d610108110f2ae7c1ed05a",
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
  });

  it("Fetch and prepare NowUpdateXML records", async() => {
    const options = {
      "title": "Test Report",
      "query": "name=Default"
    };
    const linter = _createLinter(options, {
      "sys_script_include": {
        "fields": ["script"],
        "defaults": {
          "script": "9eca59a2abdba2593b84ea175b0f96749d1f8edd719f4e288bb97fcb8d729bb4"
        }
      }
    });
    spyOn(linter.instance, "requestUpdateXMLByUpdateSetQuery").and.returnValue({result: [data]});

    await linter.fetch();
    const changes = linter.getChanges();

    expect(linter.instance.requestUpdateXMLByUpdateSetQuery).toHaveBeenCalledWith(options.query);
    expect(linter.instance.requestUpdateXMLByUpdateSetQuery).toHaveBeenCalledTimes(1);
    expect(changes.size).toBe(1);
    expect(changes.values().next().value.id).toBe(data.sys_id);
  });

  it("Lint NowUpdateXML records", async () => {
    const options = {
      "title": "Test Report",
      "query": "name=Default"
    };
    const linter = _createLinter(options, {
      "sys_script_include": {
        "fields": ["script"],
        "defaults": {
          "script": "9eca59a2abdba2593b84ea175b0f96749d1f8edd719f4e288bb97fcb8d729bb4"
        }
      }
    });
    
    // Not testing NowLoader
    spyOn(linter.instance, "requestUpdateXMLByUpdateSetQuery").and.returnValue({result: [data]});

    // Not testing ESLint
    spyOn(linter.eslint, "lintText").and.returnValue([{
      warningCount: 0,
      errorCount: 0
    }]);

    await linter.process();

    const changes = linter.getChanges();

    expect(linter.instance.requestUpdateXMLByUpdateSetQuery).toHaveBeenCalledTimes(1);
    expect(linter.eslint.lintText).toHaveBeenCalledTimes(1);
    expect(changes.size).toBe(1);
    expect(changes.values().next().value.status).toBe("OK");
    console.log("SIZE " + changes.values().next().value.reports.size);
    expect(changes.values().next().value.reports.keys().next().value).toBe("script");
  });

  it("Ignore not configured tables", async () => {
    const options = {
      "title": "Test Report",
      "query": "name=Default"
    };
    
    const linter = _createLinter(options, {
      "sys_script": {
        "fields": ["script"],
        "defaults": {
          "script": "9eca59a2abdba2593b84ea175b0f96749d1f8edd719f4e288bb97fcb8d729bb4"
        }
      }
    });
    
    // Not testing NowLoader
    spyOn(linter.instance, "requestUpdateXMLByUpdateSetQuery").and.returnValue({result: [data]});

     // Not testing ESLint
    spyOn(linter.eslint, "lintText").and.callThrough();

    await linter.process();

    const changes = linter.getChanges();

    expect(linter.instance.requestUpdateXMLByUpdateSetQuery).toHaveBeenCalledTimes(1);
    expect(linter.eslint.lintText).not.toHaveBeenCalled();

    expect(changes.size).toBe(1);
    expect(changes.values().next().value.status).toBe("IGNORE");
    expect(changes.values().next().value.hasReports).toBe(false);
  });

  it("Skip on empty field", async () => {
    payload = fs.readFileSync("./spec/payloads/sys_script_include_empty_script.xml", {encoding: "utf8"});
    data.payload = payload;

    const options = {
      "title": "Test Report",
      "query": "name=Default"
    };
    
    const linter = _createLinter(options, {
      "sys_script_include": {
        "fields": ["script"],
        "defaults": {
          "script": "9eca59a2abdba2593b84ea175b0f96749d1f8edd719f4e288bb97fcb8d729bb4"
        }
      }
    });
    
    // Not testing NowLoader
    spyOn(linter.instance, "requestUpdateXMLByUpdateSetQuery").and.returnValue({result: [data]});

     // Not testing ESLint
    spyOn(linter.eslint, "lintText").and.callThrough();

    await linter.process();

    const changes = linter.getChanges();

    expect(linter.instance.requestUpdateXMLByUpdateSetQuery).toHaveBeenCalledTimes(1);
    expect(linter.eslint.lintText).not.toHaveBeenCalled();

    expect(changes.size).toBe(1);
    expect(changes.values().next().value.status).toBe("SKIPPED");
    expect(changes.values().next().value.hasReports).toBe(false);
  });

  xit("Skip on default value", async () => {
    payload = fs.readFileSync("./spec/payloads/sys_script_include_default_script.xml", {encoding: "utf8"});
    data.payload = payload;

    const options = {
      "title": "Test Report",
      "query": "name=Default"
    };
    
    // FIXME: why is the hash from xml calculated differently?
    const linter = _createLinter(options, {
      "sys_script_include": {
        "fields": ["script"],
        "defaults": {
          "script": "ecba1e1635d91377085928e7bbe4ed97f51e4a2ab68ed105a5d4140df7a5d001"
        }
      }
    });
    
    // Not testing NowLoader
    spyOn(linter.instance, "requestUpdateXMLByUpdateSetQuery").and.returnValue({result: [data]});

     // Not testing ESLint
    spyOn(linter.eslint, "lintText").and.callThrough();

    await linter.process();

    const changes = linter.getChanges();

    expect(linter.instance.requestUpdateXMLByUpdateSetQuery).toHaveBeenCalledTimes(1);
    expect(linter.eslint.lintText).not.toHaveBeenCalled();

    expect(changes.size).toBe(1);
    expect(changes.values().next().value.status).toBe("SKIPPED");
    expect(changes.values().next().value.hasReports).toBe(false);
  });
});