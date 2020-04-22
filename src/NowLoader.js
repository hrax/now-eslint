
const http = require("https");

// eslint-disable-next-line max-len
const UPDATE_XML_BASE_URL = "sys_update_xml_list.do?JSONv2&sysparm_order=sys_updated_on&sysparm_order_direction=desc&sysparm_query=";
// eslint-disable-next-line max-len
const UPDATE_SET_BASE_URL = "sys_update_set_list.do?JSONv2&sysparm_order=sys_created_on&sysparm_order_direction=desc&sysparm_query=";
// eslint-disable-next-line max-len
const DICTIONARY_SCRIPTS_BASE_URL = "sys_dictionary_list.do?JSONv2&sysparm_query=internal_type=script^ORinternal_type=script_plain^ORinternal_type=script_server^GROUPBYname^ORDERBYelement";

class NowLoader {
  constructor(domain, username, password) {
    if (domain == null) {
      throw Error("Domain must be specified");
    }

    if (username == null) {
      throw Error("Username must be specified");
    }

    if (password == null) {
      throw Error("Password must be specified");
    }

    // Cleanup add ending slash
    if (!domain.endsWith("/")) {
      domain = domain + "/";
    }

    this.domain = domain;
    this.username = username;
    this.password = password;
  }

  async load(url) {
    // Cleanup, remove starting slash
    if (url && url.startsWith("/")) {
      url = url.substring(1);
    }

    return new Promise((resolve, reject) => {
      const request = http.request(
        this.domain + url,
        {"auth": [this.username, this.password].join(":")},
        (response) => {
          let data = "";
          response.setEncoding("utf8");

          response.on("data", (chunk) => {
            data += chunk;
          });

          response.on("end", () => {
            // TODO: check unauthorized access, http reponse or no access allowed responses before triggering success
            if (data === "" || data.startsWith("<")) {
              reject(data);
              return;
            }
            resolve(data);
          });
        }
      );

      request.on("error", (e) => {
        reject(e);
      });
      request.end();
    });
  }

  async fetch(url) {
    const body = await this.load(url);

    if (body === "" || body == null) {
      throw new Error("Response body is empty or null!");
    }

    return JSON.parse(body);
  }

  async fetchUpdateXMLByUpdateSetQuery(query) {
    const response = await this.fetch(UPDATE_SET_BASE_URL + query);
    const ids = [];
    response.records.forEach((item) => {
      ids.push(item.sys_id);
    });

    return this.fetchUpdateXMLByUpdateSetIds(ids);
  }

  async fetchUpdateXMLByUpdateSetIds(ids) {
    return this.fetch(UPDATE_XML_BASE_URL + "update_setIN" + ids.join(","));
  }

  async fetchUpdateXMLByUpdateSetXMLIds(ids) {
    return this.fetch(UPDATE_XML_BASE_URL + "sys_idIN" + ids.join(","));
  }

  async fetchTableConfigurationData() {
    const response = await this.fetch(DICTIONARY_SCRIPTS_BASE_URL);
    const tables = {};
    // Parse fields into a table configuration
    response.records.forEach((record) => {
      if (!tables[record.name]) {
        tables[record.name] = [record.element];
      } else {
        tables[record.name].push(record.element);
      }
    });

    // Return table config
    return tables;
  }
}

module.exports = NowLoader;