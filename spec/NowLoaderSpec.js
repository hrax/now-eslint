const NowLoader = require("../src/NowLoader.js");

describe("NowLoader", () => {
  let loader = null;
  let loaderLoadSpy = null;

  beforeEach(async() => {
    loader = new NowLoader("domain", "user", "password");
    loaderLoadSpy = spyOn(loader, "load").and.rejectWith("Received response body is empty");
  });

  describe("#fetch", () => {
    // Should never happen, but lets test, just in case
    it("throws an error on faulty JSON", async() => {
      const url = "/url";
      loaderLoadSpy.and.resolveTo("{'result': ['test']}");

      await expectAsync(loader.fetch(url)).toBeRejectedWith(new Error("Unable to parse JSON in provided format."));

      expect(loader.load).toHaveBeenCalledWith(url);
      expect(loader.load).toHaveBeenCalledTimes(1);
    });

    it("is rejected on empty response", async() => {
      const url = "/url";

      await expectAsync(loader.fetch(url)).toBeRejectedWith("Received response body is empty");

      expect(loader.load).toHaveBeenCalledWith(url);
    });

    it("returns object response", async() => {
      const url = "/url";
      const obj = {"test": "123"};
      loaderLoadSpy.and.resolveTo(JSON.stringify(obj));

      await expectAsync(loader.fetch(url)).toBeResolvedTo(obj);

      expect(loader.load).toHaveBeenCalledWith(url);
    });
  });


  describe("#testConnection", () => {
    it("returns false in case of error", async() => {
      await expectAsync(loader.testConnection()).toBeRejectedWithError(/An error/);

      expect(loader.load).toHaveBeenCalledWith(jasmine.anything());
    });

    it("returns false in case of bogus response", async() => {
      loaderLoadSpy.and.resolveTo(JSON.stringify({rows: []}));

      await expectAsync(loader.testConnection()).toBeResolvedTo(false);

      expect(loader.load).toHaveBeenCalledWith(jasmine.anything());
    });

    it("returns true in case of correct response", async() => {
      loaderLoadSpy.and.resolveTo(JSON.stringify({result: [{"sys_id": "123"}]}));

      await expectAsync(loader.testConnection()).toBeResolvedTo(true);

      expect(loader.load).toHaveBeenCalledWith(jasmine.anything());
    });
  });

  describe("#fetchUpdateXMLByUpdateSetQuery", () => {
    it("parses update set changes", async() => {
      const query = "name=Default";

      loaderLoadSpy.withArgs(jasmine.stringMatching(query)).and.resolveTo(JSON.stringify({"result": [{"sys_id": "123"}]}));
      loaderLoadSpy.withArgs(jasmine.stringMatching("update_setIN123")).and.resolveTo(JSON.stringify({"result": [{"sys_id": "1234"}]}));

      await expectAsync(loader.fetchUpdateXMLByUpdateSetQuery(query)).toBeResolvedTo({"result": [{"sys_id": "1234"}]});

      expect(loader.load).toHaveBeenCalledTimes(2);
      expect(loader.load).toHaveBeenCalledWith(jasmine.stringMatching("sys_update_set"));
      expect(loader.load).toHaveBeenCalledWith(jasmine.stringMatching("sys_update_xml"));
    });
  });

  describe("#fetchTableParentData", () => {
    it("parses table parent data", async() => {
      loaderLoadSpy.and.resolveTo(JSON.stringify({
        "result": [
          {
            "name": "incident",
            "super_class.name": "task"
          },
          {
            "name": "problem",
            "super_class.name": "task"
          }
        ]
      }));

      await expectAsync(loader.fetchTableParentData()).toBeResolvedTo({"incident": "task", "problem": "task"});

      expect(loader.load).toHaveBeenCalledTimes(1);
      expect(loader.load).toHaveBeenCalledWith(jasmine.stringMatching("sys_db_object"));
    });
  });

  describe("#fetchTableFieldData", () => {
    it("parses table field data", async() => {
      loaderLoadSpy.and.resolveTo(JSON.stringify({
        "result": [
          {
            "name": "sys_script",
            "element": "script",
            "default_value": `(function executeRule(current, previous /*null when async*/) {

              // Add your code here
            
            })(current, previous);`
          },
          {
            "name": "sys_script",
            "element": "condition",
            "default_value": ""
          }
        ]
      }));

      // Hash calculated manually for test
      const expected = {
        "sys_script": {
          "fields": ["script", "condition"],
          "defaults": {
            "script": "9eca59a2abdba2593b84ea175b0f96749d1f8edd719f4e288bb97fcb8d729bb4"
          }
        }
      }
      
      await expectAsync(loader.fetchTableFieldData()).toBeResolvedTo(expected);

      expect(loader.load).toHaveBeenCalledTimes(1);
      expect(loader.load).toHaveBeenCalledWith(jasmine.stringMatching("sys_dictionary"));
    });
  });

  describe("#fetchTableAndParentFieldData", () => {
    it("merges table and parent data", async() => {
      loaderLoadSpy.and.returnValues(JSON.stringify({
        "result": [
          {
            "name": "sys_script",
            "element": "script",
            "default_value": `(function executeRule(current, previous /*null when async*/) {

              // Add your code here
            
            })(current, previous);`
          },
          {
            "name": "sys_script_client",
            "element": "condition",
            "default_value": ""
          }
        ]
      }), JSON.stringify({
        "result": [
          {
            "name": "sys_script_client",
            "super_class.name": "sys_script"
          }
        ]
      }));

      await expectAsync(loader.fetchTableAndParentFieldData()).toBeResolvedTo({
        "sys_script": {
          "fields": ["script"],
          "defaults": {
            "script": "9eca59a2abdba2593b84ea175b0f96749d1f8edd719f4e288bb97fcb8d729bb4"
          }
        },
        "sys_script_client": {
          "fields": ["condition", "script"],
          "defaults": {
            "script": "9eca59a2abdba2593b84ea175b0f96749d1f8edd719f4e288bb97fcb8d729bb4"
          }
        }
      });
      expect(loader.load).toHaveBeenCalledTimes(2);

    });
  });
});