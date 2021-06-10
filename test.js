const NowInstance = require("./src/NowInstance");


console.log(require("crypto").createHash("sha256").update(`(function executeRule(current, previous /*null when async*/) {

	// Add your code here

})(current, previous);`).digest("hex"));

const profile = new NowProfile({});
const instance = profile.createInstance("proxy");

const tables = instance.requestTableAndParentFieldData();
profile.setTables(tables);
