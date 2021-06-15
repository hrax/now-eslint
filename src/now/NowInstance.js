/* eslint-disable no-console */
const crypto = require("crypto");

const Assert = require("../util/Assert");
const NowRequest = require("./NowRequest");

/**
 * Base URL to load the update set xml changes ordered descending by updated on field
 */
const UPDATE_XML_API_PATH = "/api/now/table/sys_update_xml?sysparm_display_value=false&sysparm_exclude_reference_link=true&sysparm_fields=name,sys_id,action,sys_created_by,sys_created_on,sys_updated_by,sys_updated_on,type,target_name,update_set,payload&sysparm_query=ORDERBYDESCsys_updated_on^";

/**
 * Base URL to load the update sets ordered descending by created on field
 */
const UPDATE_SET_API_PATH = "/api/now/table/sys_update_set?sysparm_display_value=false&sysparm_exclude_reference_link=true&sysparm_fields=sys_id&sysparm_query=ORDERBYDESCsys_created_on^";

/**
 * Base URL to load the fields of type script from the dictionary
 * TODO: skip wf_workflow_version table for now
 */
const DICTIONARY_SCRIPTS_API_PATH = "/api/now/table/sys_dictionary?sysparm_display_value=false&sysparm_exclude_reference_link=true&sysparm_query=internal_type=script^ORinternal_type=script_plain^ORinternal_type=script_server^GROUPBYname^ORDERBYelement&sysparm_fields=name,element,default_value";

/**
 * Base URL to load the tables that have parent which is not empty or not "Application File" order ascending by name
 */
const DB_OBJECT_CHILDREN_API_PATH = "/api/now/table/sys_db_object?sysparm_display_value=false&sysparm_exclude_reference_link=true&sysparm_query=super_class.name!=sys_metadata^ORDERBYname&sysparm_fields=name,super_class.name";

class NowInstance {
  /**
   * Create new instance of NowInstance to load the data from the Service Now instance
   *
   * @param {String} domain The Service Now domain url starting with https://
   * @param {String} username The name of the user used to autheticate
   * @param {String} password The password of the user used
   * @param {String} proxy The proxy connection string
   */
  constructor(domain, username, password, proxy) {
    Assert.notEmpty(domain);
    Assert.notEmpty(username);
    Assert.notEmpty(password);
    this.request = new NowRequest({
      domain: domain,
      username: username,
      password: password,
      proxy: proxy || null
    });
  }

  /**
   * Fetches and returns update set changes, based on provided update set query
   * @param {String} query The update set query to load changes by
   * @returns {Object} parsed JSON response
   */
  async requestUpdateXMLByUpdateSetQuery(query) {
    const response = await this.request.json(UPDATE_SET_API_PATH + query);
    const ids = response.result.map((item) => item.sys_id);
    return this.requestUpdateXMLByUpdateSetIds(ids);
  }

  /**
   * Fetches and returns update set changes, based on provided update set id array
   * @param {Array} ids The id array of update set changes to load
   * @returns {Object} parsed JSON response
   */
  async requestUpdateXMLByUpdateSetIds(ids) {
    return this.request.json(UPDATE_XML_API_PATH + "update_setIN" + ids.join(","));
  }

  /**
   * Fetches and returns update xml changes, based on provided id array
   * @param {Array} ids The id array of update xmls to load
   * @returns {Object} parsed JSON response
   */
  async requestUpdateXMLByUpdateXMLIds(ids) {
    return this.request.json(UPDATE_XML_API_PATH + "sys_idIN" + ids.join(","));
  }

  /**
   * Fetch table parent data and returns it in following format:
   * {
   *  "table1": "table1parent",
   *  "table2": "table2parent"
   * }
   * @returns {Object} table-parent JSON object
   */
  async requestTableParentData() {
    const response = await this.request.json(DB_OBJECT_CHILDREN_API_PATH);
    return Object.fromEntries(response.result.map((table) => [table["name"], table["super_class.name"]]));
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
  async requestTableFieldData() {
    const response = await this.request.json(DICTIONARY_SCRIPTS_API_PATH);
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
        // FIXME: issues with newlines, hashes are not properly detecting defaults
        // Strip all whitespaces
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
   *    "fields": ["field1", "parentfield1", "field2"],
   *    "defaults": {
   *      "field1": "default_value_hash",
   *      "parentfield1": "default_value_hash"
   *    }
   *  }...
   * }
   * @returns {Object} table-field JSON object
   * @see fetchTableParentData
   * @see fetchTableFieldData
   */
  async requestTableAndParentFieldData() {
    const fields = await this.requestTableFieldData();
    const parents = await this.requestTableParentData();
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

  async testConnection() {
    return await this.request.testConnection();
  }
}

module.exports = NowInstance;