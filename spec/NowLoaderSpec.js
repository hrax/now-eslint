const NowLoader = require("../src/NowLoader.js");

describe("NowLoader", () => {
  
  let loader = null;
  let loaderLoadSpy = null;

  beforeEach(async () => {
    loader = new NowLoader("domain", "user", "password");
    loaderLoadSpy = spyOn(loader, "load").and.rejectWith("Received response body is empty");

    // spy console!
    console = jasmine.createSpyObj("console", ["log"]);
  });

  describe("#fetch", () => {
    it("is rejected on empty response", async () => {
      const url = "/url";
      
      await expectAsync(loader.fetch(url)).toBeRejectedWith("Received response body is empty");
      
      expect(loader.load).toHaveBeenCalledWith(url);
    });

    it("returns object response", async () => {
      const url = "/url";
      const obj = {"test": "123"};
      loaderLoadSpy.and.resolveTo(JSON.stringify(obj));

      await expectAsync(loader.fetch(url)).toBeResolvedTo(obj);
      
      expect(loader.load).toHaveBeenCalledWith(url);
    });
  });


  describe("#testConnection", () => {
    it("returns false in case of error in testConnection", async () => {
      await expectAsync(loader.testConnection()).toBeResolvedTo(false);

      expect(loader.load).toHaveBeenCalledWith(jasmine.anything());
      expect(console.log).toHaveBeenCalledTimes(2);
    });

    it("returns false in case of bogus response in testConnection", async () => {
      loaderLoadSpy.and.resolveTo(JSON.stringify({rows:[]}));
      
      await expectAsync(loader.testConnection()).toBeResolvedTo(false);

      expect(loader.load).toHaveBeenCalledWith(jasmine.anything());
      expect(console.log).toHaveBeenCalledTimes(0);
    });

    it("returns true in case of correct response in testConnection", async () => {
      loaderLoadSpy.and.resolveTo(JSON.stringify({result:[{"sys_id": "123"}]}));
      
      await expectAsync(loader.testConnection()).toBeResolvedTo(true);

      expect(loader.load).toHaveBeenCalledWith(jasmine.anything());
      expect(console.log).toHaveBeenCalledTimes(0);
    });
  });

  describe("#fetchUpdateXMLByUpdateSetQuery", () => {
    it("parses update set changes", async () => {
      const query = "name=Default";

      loaderLoadSpy.withArgs(jasmine.stringMatching(query)).and.resolveTo(JSON.stringify({"result": [{"sys_id": "123"}]}));
      loaderLoadSpy.withArgs(jasmine.stringMatching("update_setIN123")).and.resolveTo(JSON.stringify({"result": [{"sys_id": "1234"}]}));

      await expectAsync(loader.fetchUpdateXMLByUpdateSetQuery(query)).toBeResolvedTo({
        "result": [{
          "sys_id": "1234"
        }]
      });

      expect(loader.load).toHaveBeenCalledTimes(2);
    });
  });

});