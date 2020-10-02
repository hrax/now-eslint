/* eslint-disable no-console, max-len */
const http = require("https");
const Assert = require("./Assert.js");
const crypto = require("crypto");

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
const DICTIONARY_SCRIPTS_BASE_URL = "api/now/table/sys_dictionary?sysparm_display_value=false&sysparm_exclude_reference_link=true&sysparm_query=internal_type=script^ORinternal_type=script_plain^ORinternal_type=script_server^GROUPBYname^ORDERBYelement&sysparm_fields=name,element,default_value";

/**
 * Base URL to load the tables that have parent which is not empty or not "Application File" order ascending by name
 */
const DB_OBJECT_CHILDREN_BASE_URL = "api/now/table/sys_db_object?sysparm_display_value=false&sysparm_exclude_reference_link=true&sysparm_query=super_class.name!=sys_metadata^ORDERBYname&sysparm_fields=name,super_class.name";

class NowLoader {
  /**
   * Create new instance of NowLoader to load the data from the Service Now instance
   * @param {String} domain The domain to connect to
   * @param {String} username The username to use to login
   * @param {String} password The password to use to login
   */
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
   * @return {Promise} Promise The Promise will be rejected in case of: reponse status code is not 200, response is empty or response starts with "<" character
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
   * @param  {String} url the URL to fetch w/o domain
   * @return {Object} parsed JSON object
   * @throws {Error} when fetched response cannot be parsed into JSON
   */
  async fetch(url) {
    const body = await this.load(url);
    try {
      return JSON.parse(body);
    } catch (e) {
      throw new Error("Unable to parse JSON in provided format.");
    }
  }

  /**
   * Test the connection to the configured instance by loading one update set with name=Default.
   * Even per mutiple application scopes there should be at least one update set wiuth given name.
   * @returns {boolean} true if connection was sucessfull and we managed to load the details, false if something above failed
   * @throws {Error} if an error occurs during the connection
   */
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

  /**
   * Fetches and returns update set changes, based on provided update set query
   * @param {String} query The update set query to load changes by
   * @returns {Object} parsed JSON response
   */
  async fetchUpdateXMLByUpdateSetQuery(query) {
    const response = await this.fetch(UPDATE_SET_BASE_URL + query);
    const ids = [];
    response.result.forEach((item) => {
      ids.push(item.sys_id);
    });

    return this.fetchUpdateXMLByUpdateSetIds(ids);
  }

  /**
   * Fetches and returns update set changes, based on provided update set id array
   * @param {Array} ids The id array of update set changes to load
   * @returns {Object} parsed JSON response
   */
  async fetchUpdateXMLByUpdateSetIds(ids) {
    return this.fetch(UPDATE_XML_BASE_URL + "update_setIN" + ids.join(","));
  }

  /**
   * Fetches and returns update xml changes, based on provided id array
   * @param {Array} ids The id array of update xmls to load
   * @returns {Object} parsed JSON response
   */
  async fetchUpdateXMLByUpdateXMLIds(ids) {
    return this.fetch(UPDATE_XML_BASE_URL + "sys_idIN" + ids.join(","));
  }

  /**
   * Fetch table parent data and returns it in following format:
   * {
   *  "table1": "table1parent",
   *  "table2": "table2parent"
   * }
   * @returns {Object} table-parent JSON object
   */
  async fetchTableParentData() {
    const response = await this.fetch(DB_OBJECT_CHILDREN_BASE_URL);
    const toReturn = {};

    response.result.forEach((table) => {
      toReturn[table["name"]] = table["super_class.name"];
    });

    return toReturn;
  }

  /**
   * Fetch table field data (all fields of type script for given table, no parents check) and returns it in following format:
   * {
   *  "table1": {
   *    fields: ["field1", "field2"],
   *    defaults: {
   *      "field1": "default_value_hash"
   *    }
   *  },
   *  "table2": {
   *    fields: ["field1", "field2"],
   *    defaults: {
   *      "field2": "default_value_hash"
   *    }
   * }
   * @returns {Object} table-parent JSON object
   */
  async fetchTableFieldData() {
    const response = await this.fetch(DICTIONARY_SCRIPTS_BASE_URL);
    const toReturn = {};

    response.result.forEach((record) => {
      if (!toReturn[record.name]) {
        toReturn[record.name] = {
          fields: [],
          defaults: {}
        };
      }
      
      toReturn[record.name].fields.push(record.element);
      if (record.default_value && record.default_value.trim() !== "") {
        const hash = crypto.createHash("sha256")
          .update(record.default_value)
          .digest("hex");
        toReturn[record.name].defaults[record.element] = hash;
      }
    });

    return toReturn;
  }

  /**
   * Fetched table-field data including the fields from the defined parent tables and returns an object in format:
   * {
   *  "table1": {
   *    fields: ["field1", "parentfield1"],
   *    defaults: {
   *      "field1": "default_value_hash",
   *      "parentfield1": "default_value_hash"
   *    }
   *  },
   *  "table2": {
   *    fields: ["field1", "field2"],
   *    defaults: {
   *      "field1": "default_value_hash"
   *    }
   *  }
   * }
   * @returns {Object} table-field JSON object
   * @see fetchTableParentData
   * @see fetchTableFieldData
   */
  async fetchTableAndParentFieldData() {
    const fields = await this.fetchTableFieldData();
    const parents = await this.fetchTableParentData();
    const tables = {};
    
    const getParentFields = function(table, fields, parents, toReturn) {
      toReturn = toReturn || {
        "fields": [],
        "defaults": {}
      };
      if (fields[table] != null) {
        toReturn.fields = toReturn.fields.concat(fields[table].fields);
        toReturn.defaults = Object.assign(toReturn.defaults, fields[table].defaults);
        if (parents[table]) {
          return getParentFields(parents[table], fields, parents, toReturn);
        }
      }

      // Return unique set as array
      return toReturn;
    };

    Object.keys(fields).forEach(table => {
      tables[table] = getParentFields(table, fields, parents);
    });

    return tables;
  }
}

module.exports = NowLoader;