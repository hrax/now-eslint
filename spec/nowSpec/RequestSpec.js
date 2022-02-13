const Request = require("../src/now/Request");

describe("Request", () => {
  const options = {
    "domain": "domain",
    "username": "user",
    "password": "password"
  };
  let request = null;
  let requestGetSpy = null;

  beforeEach(async() => {
    request = new Request(options);
    requestGetSpy = spyOn(request, "get").and.rejectWith(new Error("Received response body is empty"));
  });

  describe("#json", () => {
    // Should never happen, but lets test, just in case
    it("throws an error on faulty JSON", async() => {
      const path = "/path";
      requestGetSpy.and.resolveTo("{'result': ['test']}");

      await expectAsync(request.json(path)).toBeRejectedWith(new Error("Unable to parse response data to JSON."));

      expect(request.get).toHaveBeenCalledWith(path);
      expect(request.get).toHaveBeenCalledTimes(1);
    });

    it("is rejected on empty response", async() => {
      const path = "/path";

      await expectAsync(request.json(path)).toBeRejectedWith(new Error("Received response body is empty"));

      expect(request.get).toHaveBeenCalledWith(path);
    });

    it("returns object response", async() => {
      const path = "/path";
      const obj = {"test": "123"};
      requestGetSpy.and.resolveTo(JSON.stringify(obj));

      await expectAsync(request.json(path)).toBeResolvedTo(obj);

      expect(request.get).toHaveBeenCalledWith(path);
    });
  });


  describe("#testConnection", () => {
    it("returns false in case of error", async() => {
      await expectAsync(request.testConnection()).toBeRejectedWithError(/An error/);

      expect(request.get).toHaveBeenCalledWith(jasmine.anything());
    });

    it("returns false in case of bogus response", async() => {
      requestGetSpy.and.resolveTo(JSON.stringify({rows: []}));

      await expectAsync(request.testConnection()).toBeResolvedTo(false);

      expect(request.get).toHaveBeenCalledWith(jasmine.anything());
    });

    it("returns true in case of correct response", async() => {
      requestGetSpy.and.resolveTo(JSON.stringify({result: [{"sys_id": "123"}]}));

      await expectAsync(request.testConnection()).toBeResolvedTo(true);

      expect(request.get).toHaveBeenCalledWith(jasmine.anything());
    });
  });
});