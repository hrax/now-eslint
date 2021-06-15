const NowInstance = require("../src/now/NowInstance");

describe("NowInstance", () => {
  let instance = null;
  let requestGetSpy = null;

  beforeEach(async() => {
    instance = new NowInstance("domain", "username", "password");
    requestGetSpy = spyOn(instance.request, "get").and.rejectWith("Received response body is empty");
  });

  describe("#requestUpdateXMLByUpdateSetQuery", () => {
    it("parses update set changes", async() => {
      const query = "name=Default";

      requestGetSpy.withArgs(jasmine.stringMatching(query)).and.resolveTo(JSON.stringify({"result": [{"sys_id": "123"}]}));
      requestGetSpy.withArgs(jasmine.stringMatching("update_setIN123")).and.resolveTo(JSON.stringify({"result": [{"sys_id": "1234"}]}));

      await expectAsync(instance.requestUpdateXMLByUpdateSetQuery(query)).toBeResolvedTo({"result": [{"sys_id": "1234"}]});

      expect(instance.request.get).toHaveBeenCalledTimes(2);
      expect(instance.request.get).toHaveBeenCalledWith(jasmine.stringMatching("sys_update_set"));
      expect(instance.request.get).toHaveBeenCalledWith(jasmine.stringMatching("sys_update_xml"));
    });
  });

  describe("#requestTableParentData", () => {
    it("parses table parent data", async() => {
      requestGetSpy.and.resolveTo(JSON.stringify({
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

      await expectAsync(instance.requestTableParentData()).toBeResolvedTo({"incident": "task", "problem": "task"});

      expect(instance.request.get).toHaveBeenCalledTimes(1);
      expect(instance.request.get).toHaveBeenCalledWith(jasmine.stringMatching("sys_db_object"));
    });
  });

  describe("#requestTableFieldData", () => {
    it("parses table field data", async() => {
      requestGetSpy.and.resolveTo(JSON.stringify({
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
      };

      await expectAsync(instance.requestTableFieldData()).toBeResolvedTo(expected);

      expect(instance.request.get).toHaveBeenCalledTimes(1);
      expect(instance.request.get).toHaveBeenCalledWith(jasmine.stringMatching("sys_dictionary"));
    });
  });

  describe("#requestTableAndParentFieldData", () => {
    it("merges table and parent data", async() => {
      requestGetSpy.and.returnValues(JSON.stringify({
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

      await expectAsync(instance.requestTableAndParentFieldData()).toBeResolvedTo({
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
      expect(instance.request.get).toHaveBeenCalledTimes(2);
    });
  });
});