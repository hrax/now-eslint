import http, { RequestOptions } from "https";
import agent, { HttpsProxyAgent } from "https-proxy-agent";
import Assert from "../util/Assert.js";
import { IncomingMessage } from "http";

export enum RESPONSE_STATUS {
  OK = 200,
  NOT_FOUND = 400,
  UNAUTHORIZED = 401,
  FORBIDDEN = 403,
  ERROR = 500
};

/* export type RequestOptions = HttpRequestOptions & {

} */

/**
 * See https://support.servicenow.com/kb?id=kb_article_view&sysparm_article=KB0534905
 * In the REST world, PUT and PATCH have different semantics. PUT means replace the entire resource with given data
 * (so null out fields if they are not provided in the request), while PATCH means replace only specified fields.
 * For the Table API, however, PUT and PATCH mean the same thing.  PUT and PATCH modify only the fields specified in the request.
 */
export default class Request {

  static readonly ENCODING: BufferEncoding = "utf8";

  static createProxy(proxy: string): HttpsProxyAgent {
    return new HttpsProxyAgent(proxy);
  }

  static async request(url: URL, options: RequestOptions, body?: string): Promise<string> {
    return new Promise((resolve, reject) => {
      const request = http.request(
        url,
        options,
        (response: IncomingMessage) => {
          let data: string = "";
          response.setEncoding(Request.ENCODING);

          response.on("data", (chunk: string) => {
            data += chunk;
          });

          response.on("end", () => {
            // If response status code is not 200 resolve reject promise with an error
            if (response.statusCode !== RESPONSE_STATUS.OK) {
              reject([response, data]);
              return;
            }

            resolve(data);
          });
        }
      );

      request.on("error", (e) => {
        reject([null, e]);
      });

      request.on('timeout', function () {
        // Timeout happend. Server received request, but not handled it
        // (i.e. doesn't send any response or it took to long).
        // You don't know what happend.
        // It will emit 'error' message as well (with ECONNRESET code).
    
        request.destroy();
      });

      if (body != null) {
        request.write(body, Request.ENCODING);
      }

      request.end();
    });
  }

  static async json<T>(url: URL, options: RequestOptions, body?: string): Promise<T> {
    const data = await Request.request(url, options, body);
    return JSON.parse(data);
  }
}