
const http = require("https");
const xml2js = require("xml-js");
const CLIEngine = require("eslint").CLIEngine;
const Linter = require("eslint").Linter;

const config = require("./config.json");
const QUERY = "sys_idIN1f717b74db141010ccc9c4ab0b9619db";

const url = config.domain + "sys_update_xml_list.do?JSONv2&sysparm_order=sys_updated_on&sysparm_order_direction=desc&sysparm_query=" + QUERY;
console.log("URL: " + url);
console.log("");

// function to load update xml JSON response
const request = (url, options) => {
  return new Promise((resolve, reject) => {
    const request = http.request(
      url,
      options || {},
      (response) => {
        let data = "";
        response.setEncoding("utf8");

        response.on("data", (chunk) => {
          data += chunk;
        });

        response.on("end", () => {
          resolve(data);
        });
      }
    );

    request.on("error", (e) => {
      reject(e);
    });
    request.end();
  });
};

request(url, {"auth": [config.username, config.password].join(":")}).then((body) => {
  // Parse JSON string response
  let bodyJson = JSON.parse(body);

  // Get records from the response
  let records = bodyJson.records;

  // Parse XML payload in the changed record to JSON string
  let payload = xml2js.xml2json(records[0].payload, {compact: true});

  // Parse JSON string payload
  let payloadJson = JSON.parse(payload);

  // Write the name and updated date of the record
  // console.log(records[0].name + "@" + records[0].sys_updated_on);

  // Write the script field of the changed record
  // console.log("JSON Payload: \n" + payloadJson.record_update.sysevent_script_action.script._cdata);

  const cli = new CLIEngine();
  const report = cli.executeOnText(payloadJson.record_update.sysevent_script_action.script._cdata);

  // Write out lint report
  console.log(JSON.stringify(report));
});