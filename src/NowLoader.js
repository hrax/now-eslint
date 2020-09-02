/* eslint-disable no-console, max-len */
const http = require("https");
const Assert = require("./Assert.js");

/**
 * Base URL to load the update set xml changes ordered descending by updated on field
 */
const UPDATE_XML_BASE_URL = "api/now/table/sys_update_xml?sysparm_display_value=false&sysparm_exclude_reference_link=true&sysparm_fields=name,sys_id,action,sys_created_by,sys_created_on,sys_updated_by,sys_updated_on,type,target_name,update_set,payload&sysparm_query=ORDERBYDESCsys_updated_on^";

/**
 * Base URL to load the update sets ordered descending by created on field
 */
const UPDATE_SET_BASE_URL = "api/now/table/sys_update_set?sysparm_display_value=false&sysparm_exclude_reference_link=true&sysparm_fields=sys_id&sysparm_query=ORDERBYDESCsys_created_on^";

/**
 * Base URL to load the fields of type script from the dictionary
 */
const DICTIONARY_SCRIPTS_BASE_URL = "api/now/table/sys_dictionary?sysparm_display_value=false&sysparm_exclude_reference_link=true&sysparm_query=internal_type=script^ORinternal_type=script_plain^ORinternal_type=script_server^GROUPBYname^ORDERBYelement&sysparm_fields=name,element";

/**
 * Base URL to load the tables that have parent which is not empty or not "Application File" order ascending by name
 */
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

    const RESPONSE_STATUS_OK = 200;

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
            // If response status code is not 200 we are not processing any data from the response body
            if (response.statusCode !== RESPONSE_STATUS_OK) {
              return;
            }
            data += chunk;
          });

          response.on("end", () => {
            // If response status code is not 200 resolve reject promise with an error
            if (response.statusCode !== RESPONSE_STATUS_OK) {
              reject("Received response status code is '" + response.statusCode + "' expected '" + RESPONSE_STATUS_OK + "'");
              return;
            }

            // If response body is empty resolve reject promise with an error
            if (data == null || data === "") {
              reject("Received response body is empty");
              return;
            }

            // If response body starts with an '<' (HTML/XML) character, reject promise with an error
            if (data.startsWith("<")) {
              reject("Received response body starts with an '<' expected JSON formatted response");
              return;
            }

            // TODO: check unauthorized access, http reponse or no access allowed responses before triggering success
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
    try {
      return JSON.parse(body);
    } catch (e) {
      throw new Error("Unable to parse JSON in provided format.");
    }
  }

  async testConnection() {
    try {
      // Load one update set named default; every instance should have one
      const response = await this.fetch(UPDATE_SET_BASE_URL + "name=Default&sysparm_limit=1");
      if (response.result && response.result.length && response.result[0].sys_id) {
        // We have a result of a single record with a sys_id, assume connection is OK
        return true;
      }
    } catch (err) {
      throw new Error("An error occured during testConnection.");
    }
    return false;
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

  async fetchUpdateXMLByUpdateXMLIds(ids) {
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

  async fetchTableFieldData() {
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

  async fetchTableAndParentFieldData() {
    const fields = await this.fetchTableFieldData();
    const parents = await this.fetchTableParentData();
    const tables = {};
    const getParentFields = function(table, fields, parents, toReturn) {
      toReturn = toReturn || [];
      if (fields[table] != null) {
        toReturn = toReturn.concat(fields[table]);
        if (parents[table]) {
          return getParentFields(parents[table], fields, parents, toReturn);
        }
      }

      // Return unique set as array
      return [...new Set(toReturn)];
    };

    Object.keys(fields).forEach(table => {
      tables[table] = getParentFields(table, fields, parents);
    });

    return tables;
  }
}

module.exports = NowLoader;