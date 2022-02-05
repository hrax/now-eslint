const Instance = require("../src/now/Instance");

describe("Instance", () => {
  let instance = null;
  let requestGetSpy = null;

  beforeEach(async() => {
    instance = new Instance("domain", "username", "password");
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
          "fields": ["script", "condition"]
        }
      };

      await expectAsync(instance.requestTableFieldData()).toBeResolvedTo(expected);

      expect(instance.request.get).toHaveBeenCalledTimes(1);
      expect(instance.request.get).toHaveBeenCalledWith(jasmine.stringMatching("sys_dictionary"));
    });
  });

  describe("#requestTableAndParentFieldData", () => {
    // B -> A
    it("merges table and direct parent data", async() => {
      requestGetSpy.and.returnValues(JSON.stringify({
        "result": [
          {
            "name": "A",
            "element": "script",
            "default_value": `(function executeRule(current, previous /*null when async*/) {

              // Add your code here
            
            })(current, previous);`
          },
          {
            "name": "B",
            "element": "condition",
            "default_value": ""
          }
        ]
      }), JSON.stringify({
        "result": [
          {
            "name": "B",
            "super_class.name": "A"
          }
        ]
      }));

      await expectAsync(instance.requestTableAndParentFieldData()).toBeResolvedTo({
        "A": {
          "fields": ["script"]
        },
        "B": {
          "fields": ["condition", "script"]
        }
      });
      
      expect(instance.request.get).toHaveBeenCalledTimes(2);
    });

    // C -> [B] -> A
    it("merges table and non-direct parent data", async() => {
      requestGetSpy.and.returnValues(JSON.stringify({
        "result": [
          {
            "name": "A",
            "element": "script",
            "default_value": ""
          },
          {
            "name": "C",
            "element": "condition",
            "default_value": ""
          }
        ]
      }), JSON.stringify({
        "result": [
          {
            "name": "C",
            "super_class.name": "B"
          },
          {
            "name": "B",
            "super_class.name": "A"
          }
        ]
      }));

      await expectAsync(instance.requestTableAndParentFieldData()).toBeResolvedTo({
        "A": {
          "fields": ["script"]
        },
        "C": {
          "fields": ["condition", "script"]
        }
      });
      
      expect(instance.request.get).toHaveBeenCalledTimes(2);
    });
  });
});