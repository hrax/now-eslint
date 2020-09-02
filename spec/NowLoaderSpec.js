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
      }))

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
            "element": "script"
          },
          {
            "name": "sys_script",
            "element": "condition"
          }
        ]
      }))

      await expectAsync(loader.fetchTableFieldData()).toBeResolvedTo({"sys_script": ["script", "condition"]});

      expect(loader.load).toHaveBeenCalledTimes(1);
      expect(loader.load).toHaveBeenCalledWith(jasmine.stringMatching("sys_dictionary"));
    });
  });
});