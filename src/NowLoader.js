
const http = require("https");
const Assert = require("./Assert.js");

/**
 * Base URL to load the update set xml changes ordered descending by updated on field
 */
// eslint-disable-next-line max-len
const UPDATE_XML_BASE_URL = "api/now/table/sys_update_xml?sysparm_display_value=false&sysparm_exclude_reference_link=true&sysparm_fields=name,sys_id,action,sys_created_by,sys_created_on,sys_updated_by,sys_updated_on,type,target_name,update_set,payload&sysparm_query=ORDERBYDESCsys_updated_on^";

/**
 * Base URL to load the update sets ordered descending by created on field
 */
// eslint-disable-next-line max-len
const UPDATE_SET_BASE_URL = "api/now/table/sys_update_set?sysparm_display_value=false&sysparm_exclude_reference_link=true&sysparm_fields=sys_id&sysparm_query=ORDERBYDESCsys_created_on^";

/**
 * Base URL to load the fields of type script from the dictionary
 */
// eslint-disable-next-line max-len
const DICTIONARY_SCRIPTS_BASE_URL = "api/now/table/sys_dictionary?sysparm_display_value=false&sysparm_exclude_reference_link=true&sysparm_query=internal_type=script^ORinternal_type=script_plain^ORinternal_type=script_server^GROUPBYname^ORDERBYelement&sysparm_fields=name,element";

/**
 * Base URL to load the tables that have parent which is not empty or not "Application File" order ascending by name
 */
// eslint-disable-next-line max-len
const DB_OBJECT_CHILDREN_BASE_URL = "api/now/table/sys_db_object?sysparm_display_value=false&sysparm_exclude_reference_link=true&sysparm_query=super_class.name!=sys_metadata^ORDERBYname&sysparm_fields=name,super_class.name";

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
   * @param  {String} url the URL to load
   * @return {Promise} Promise
   */
  async load(url) {
    // Cleanup; remove starting slash
    if (url && url.startsWith("/")) {
      url = url.substring(1);
    }

    // TODO: Set headers, such as agent, timeout etc.
    const options = {
      "auth": [this.username, this.password].join(":"),
      "headers": {
        "Accept": "application/json",
        "Content-Type": "application/json"
      },
      "rejectUnauthorized": false,
      "timeout": 10000
    };

    /*
     * TODO: Proxy configuration
     */
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
    response.result.forEach((item) => {
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
    const response = await this.fetch(DB_OBJECT_CHILDREN_BASE_URL);
    const toReturn = {};

    response.result.forEach((table) => {
      toReturn[table["name"]] = table["super_class.name"];
    });

    return toReturn;
  }

  async fetchTableConfigurationData() {
    const response = await this.fetch(DICTIONARY_SCRIPTS_BASE_URL);
    const toReturn = {};

    response.result.forEach((record) => {
      if (!toReturn[record.name]) {
        toReturn[record.name] = [record.element];
      } else {
        toReturn[record.name].push(record.element);
      }
    });

    return toReturn;
  }
}

module.exports = NowLoader;