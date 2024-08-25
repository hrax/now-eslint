/* eslint-disable camelcase */
import fs from "fs";
import { UpdateXMLScan } from "../../src/linter/UpdateXMLScan.js";
import { Linter, LinterOptions } from "../../src/linter/Linter.js";
import profileManager, { Profile } from "../../src/core/ProfileManager.js";
import { SNUpdateXMLData } from "../../src/core/sn.js";
import { RESTClient } from "../../src/core/RESTClient.js";
import oauthClient from "../../src/core/OAuthClient.js";
import { resetAllWhenMocks, when } from "jest-when";
import { defaultWhenImplementationThrow } from "../helpers.js";
import { ESLint } from "eslint";

describe("LinterSpec", () => {
  const payload = fs.readFileSync("./spec/payloads/sys_script_include_50ba882f07d610108110f2ae7c1ed00d.xml", {encoding: "utf8"});
  const data: SNUpdateXMLData = {
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
    "payload": payload,
    "application": "global",
    "payloadHash": -1234,
    "sys_mod_count": 1
  };

  let profile: Profile, client: RESTClient;

  beforeEach(() => {
    resetAllWhenMocks();
    profile = profileManager.fromData({
      name: "dev1",
      baseUrl: "https://example.com",
      auth: {
        clientID: "123",
        clientSecret: "123",
        lastRetrieved: 0,
        type: "oauth-token",
        token: {
          access_token: "123",
          refresh_token: "123",
          expires_in: 60,
          scope: "",
          token_type: "Bearer"
        }
      }
    });
    client = new RESTClient(oauthClient);
  });

  it("should fetch and prepare UpdateXML records", async() => {
    const options: LinterOptions = {
      "title": "Test Report",
      "query": "name=Default"
    };
    const linter = new Linter(profile, client, options);
    const clientUpdateXMLSpy = jest.spyOn(client, "loadUpdateXMLByUpdateSetQuery");
    when(clientUpdateXMLSpy)
      .defaultImplementation(defaultWhenImplementationThrow)
      .calledWith(profile, options.query).mockResolvedValue([data]);

    await linter.fetch();
    const changes = linter.changes;

    expect(clientUpdateXMLSpy).toHaveBeenCalledTimes(1);
    expect(changes.size).toBe(1);
    expect((changes.values().next().value as UpdateXMLScan).ID).toBe(data.sys_id);
  });

  it("Lint NowUpdateXML records", async() => {
    profile.setTableConfiguration({
      tables: {
        "sys_script_include": {
          name: "sys_script_include",
          fields: {
            "script": {
              name: "script"
            }
          }
        }
      }
    });
    const options = {
      "title": "Test Report",
      "query": "name=Default"
    };
    const linter = new Linter(profile, client, options);
    const clientUpdateXMLSpy = jest.spyOn(client, "loadUpdateXMLByUpdateSetQuery");
    when(clientUpdateXMLSpy)
      .defaultImplementation(defaultWhenImplementationThrow)
      .calledWith(profile, options.query).mockResolvedValue([data]);
    
    // Not testing ESLint
    const lintTextSpy = jest.spyOn(linter.getESLint(), "lintText").mockResolvedValue([
      {
        warningCount: 0,
        errorCount: 0
      } as ESLint.LintResult
    ]);

    await linter.process();

    const changes = linter.changes;

    expect(clientUpdateXMLSpy).toHaveBeenCalledTimes(1);
    expect(lintTextSpy).toHaveBeenCalledTimes(1);
    expect(changes.size).toBe(1);
    expect(changes.values().next().value.getStatus()).toBe("OK");
    expect(changes.values().next().value.getReports().keys().next().value).toBe("script");
  });

  it("Ignore not configured tables", async() => {
    const options = {
      "title": "Test Report",
      "query": "name=Default"
    };
    
    const linter = new Linter(profile, client, options);
    
    // Not testing NowLoader
    const clientUpdateXMLSpy = jest.spyOn(client, "loadUpdateXMLByUpdateSetQuery");
    when(clientUpdateXMLSpy)
      .defaultImplementation(defaultWhenImplementationThrow)
      .calledWith(profile, options.query).mockResolvedValue([data]);

    const lintTextSpy = jest.spyOn(linter.getESLint(), "lintText");

    await linter.process();

    const changes = linter.changes;

    expect(clientUpdateXMLSpy).toHaveBeenCalledTimes(1);
    expect(lintTextSpy).not.toHaveBeenCalled();

    expect(changes.size).toBe(1);
    expect(changes.values().next().value.getStatus()).toBe("IGNORED");
    expect(changes.values().next().value.hasReports()).toBe(false);
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