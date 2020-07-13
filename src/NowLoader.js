
const http = require("https");
const Assert = require("./Assert");

/**
 * Base URL to load the update set xml changes ordered descending by updated on field
 */
// eslint-disable-next-line max-len
const UPDATE_XML_BASE_URL = "sys_update_xml_list.do?JSONv2&sysparm_query=ORDERBYDESCsys_updated_on^";

/**
 * Base URL to load the update sets ordered descending by created on field
 */
// eslint-disable-next-line max-len
const UPDATE_SET_BASE_URL = "sys_update_set_list.do?JSONv2&sysparm_query=ORDERBYDESCsys_created_on^";

/**
 * Base URL to load the fields of type script from the dictionary
 */
// eslint-disable-next-line max-len
const DICTIONARY_SCRIPTS_BASE_URL = "sys_dictionary_list.do?JSONv2&sysparm_query=internal_type=script^ORinternal_type=script_plain^ORinternal_type=script_server^GROUPBYname^ORDERBYelement";

/**
 * Base URL to load the tables that have parent which is not empty or not "Application File" order ascending by name
 */
// eslint-disable-next-line max-len
const DB_OBJECT_CHILDREN_BASE_URL = "sys_db_object_list.do?JSONv2&sysparm_query=super_class!=b06a1330db101010ccc9c4ab0b961964^ORsuper_class=NULL^super_class!=NULL^ORDERBYname";

class NowLoader {
  constructor(domain, username, password) {
    Assert.notEmpty(domain, "Domain must be specified");
    Assert.notEmpty(username, "Username must be specified");
    Assert.notEmpty(password, "Password must be specified");

    // Cleanup; add ending slash
    if (!domain.endsWith("/")) {
      domain = domain + "/";
    }

    this.domain = domain;
    this.username = username;
    this.password = password;
  }

  /**
   * Load JSON data url from the domain using the username and password
   * @param  {[type]} url the URL to load
   * @return {[type]}     Promise
   */
  async load(url) {
    // Cleanup; remove starting slash
    if (url && url.startsWith("/")) {
      url = url.substring(1);
    }

    const options = {
      "auth": [this.username, this.password].join(":"),
      "rejectUnauthorized": false
    };

    return new Promise((resolve, reject) => {
      const request = http.request(
        this.domain + url,
        options,
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

  /**
   * Fetch the data from the url as a JSON object
   * @param  {[type]} url the URL to fetch
   * @return {[type]} parsed JSON object
   */
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

  async fetchTableParentData() {
    return null;
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