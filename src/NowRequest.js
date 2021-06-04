/* eslint-disable no-console, max-len */
const http = require("https");
const HttpsProxyAgent = require("https-proxy-agent");
const Assert = require("./Assert.js");

const PATH_SEPARATOR = "/";

/**
 * Base URL to load the update sets ordered descending by created on field
 */
const TEST_CONNECTION_PATH = "/api/now/table/sys_update_set?sysparm_display_value=false&sysparm_exclude_reference_link=true&sysparm_fields=sys_id&sysparm_query=ORDERBYDESCsys_created_on^name=Default&sysparm_limit=1";

const RESPONSE_STATUS_OK = 200;

/**
 * See https://support.servicenow.com/kb?id=kb_article_view&sysparm_article=KB0534905
 * In the REST world, PUT and PATCH have different semantics. PUT means replace the entire resource with given data
 * (so null out fields if they are not provided in the request), while PATCH means replace only specified fields.
 * For the Table API, however, PUT and PATCH mean the same thing.  PUT and PATCH modify only the fields specified in the request.
 */
class NowRequest {
  /**
   * Create new instance of NowRequest to load the data from the Service Now instance
   */
  constructor(options) {
    this.options = Object.assign({
      proxy: null,
      domain: "",
      username: "",
      password: "",
      encoding: "utf8",
      timeout: 10000,
      headers: {
        "Accept": "application/json",
        "Content-Type": "application/json",
        "User-Agent": "X-Now-ESLint"
      }
    }, options || {});

    Assert.notEmpty(this.options.domain, "Service Now domain cannot be empty!");
    Assert.notEmpty(this.options.username, "Service Now username cannot be empty!");
    Assert.notEmpty(this.options.password, "Service Now password cannot be empty!");

    // Cleanup domain; remove ending SEPARATOR
    if (this.options.domain.endsWith(PATH_SEPARATOR)) {
      this.options.domain = this.options.domain.slice(0, -1);
    }
  }

  request(path, method, headers, body) {
    Assert.notEmpty(path, "Provided path to fetch cannot be empty!");
    Assert.notEmpty(method, "Provided method cannot be empty!");
    // TODO: Check method is one of GET, POST, PATCH, DELETE, PUT?

    // Cleanup path; add starting SEPARATOR
    if (path && !path.startsWith("/")) {
      path = PATH_SEPARATOR + path;
    }

    const options = {
      "auth": [this.options.username, this.options.password].join(":"),
      "method": method,
      "headers": Object.assign({}, this.options.headers, headers || {}),
      "rejectUnauthorized": false,
      "timeout": this.options.timeout
    };

    if (this.options.proxy != null) {
      options.agent = new HttpsProxyAgent(this.options.proxy);
    }

    return new Promise((resolve, reject) => {
      const request = http.request(
        this.options.domain + path,
        options,
        (response) => {
          let data = "";
          response.setEncoding(this.options.encoding);

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
              reject(new Error("Received response status code is '" + response.statusCode + "' expected '" + RESPONSE_STATUS_OK + "'"));
              return;
            }

            // TODO: rejectEmptyResponse as an option per request
            // If response body is empty resolve reject promise with an error
            if (data == null || data === "") {
              reject(new Error("Received response body is empty"));
              return;
            }

            // TODO: check unauthorized access, http reponse or no access allowed responses before triggering success
            resolve(data);
          });
        }
      );

      request.on("error", (e) => {
        reject(new Error(e));
      });

      if (body != null) {
        request.write(body, this.options.encoding);
      }

      request.end();
    });
  }

  /**
   * Retrieves data from the specified {@code path} using GET method request. Path is appended to the domain specified in {@code this.options.domain}
   *
   * @param  {String} path the path to retrieve data from
   * @param  {Object} headers the headers to be used to override the global configuration just for this request
   * @return {Promise} The Promise will be rejected with error in case of: reponse status code is not 200 or response is empty
   */
  async get(path, headers) {
    return await this.request(path, "GET", headers);
  }

  async post(path, headers, body) {
    return await this.request(path, "POST", headers, body);
  }

  async patch(path, headers, body) {
    return await this.request(path, "PATCH", headers, body);
  }

  async delete(path, headers) {
    return await this.request(path, "DELETE", headers);
  }

  /**
   * Retrieves data from the specified {@code path} using GET method request. Path is appended to the domain specified in {@code this.options.domain}
   * Request is not via forced "application/json" header, only response is expected to be a JSON object.
   *
   * @param  {String} path the path to retrieve data from
   * @return {Object} parsed JSON object
   * @throws {Error} when fetched response cannot be parsed into JSON
   */
  async json(path) {
    const body = await this.get(path);
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
      const response = await this.json(TEST_CONNECTION_PATH);
      if (response.result && response.result.length && response.result[0].sys_id) {
        // We have a result of a single record with a sys_id, assume connection is OK
        return true;
      }
    } catch (err) {
      throw new Error("An error occured during connection test.");
    }
    return false;
  }
}

module.exports = NowRequest;