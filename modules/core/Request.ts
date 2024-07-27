import http, { RequestOptions } from "https";
import agent, { HttpsProxyAgent } from "https-proxy-agent";
import Assert from "../util/Assert.js";
import { IncomingMessage } from "http";

export enum ResponseStatus {
  OK = 200,
  NOT_FOUND = 400,
  UNAUTHORIZED = 401,
  FORBIDDEN = 403,
  ERROR = 500
};

/* export type RequestOptions = HttpRequestOptions & {

} */

export class Response {
  readonly http: IncomingMessage | null;
  readonly data: string;
  constructor(httpResponse: IncomingMessage | null, data: string) {
    this.http = httpResponse;
    this.data = data;
  }

  private static isStatus(message: IncomingMessage | null, status: ResponseStatus) {
    if (message == null) {
      return false;
    }
    return message.statusCode === status;
  }
  
  static isOK(response: Response): boolean {
    return Response.isStatus(response.http, ResponseStatus.OK);
  }

  static isNotFound(response: Response): boolean {
    return Response.isStatus(response.http, ResponseStatus.NOT_FOUND);
  }
  
  static isUnauthorized(response: Response): boolean {
    return Response.isStatus(response.http, ResponseStatus.UNAUTHORIZED);
  }
  
  static isForbidden(response: Response): boolean {
    return Response.isStatus(response.http, ResponseStatus.FORBIDDEN);
  }
  
  static isError(response: Response): boolean {
    return Response.isStatus(response.http, ResponseStatus.ERROR);
  }
}

export class ResponseError extends Error {
  readonly response: Response;
  constructor(message: string, response: Response, e?: any) {
    super(message, e);
    this.response = response;
  }
}

/**
 * https.request wrapper
 * 
 * Note:
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

  /**
   * Unless Error is thrown, rejects promise with ResponseError
   * 
   * @param url 
   * @param options 
   * @param body 
   * @returns 
   */
  static async request(url: URL, options: RequestOptions, body?: string): Promise<Response> {
    return new Promise((resolve, reject) => {
      const request = http.request(
        url,
        options,
        (res: IncomingMessage) => {
          let data = "";
          res.setEncoding(Request.ENCODING);

          res.on("data", (chunk: string) => {
            data += chunk;
          });

          res.on("end", () => {
            const response = new Response(res, data);
            // If response status code is not 200 resolve reject promise with an error
            if (!Response.isOK(response)) {
              reject(response);
              return;
            }

            resolve(response);
          });
        }
      );

      request.on("error", (e) => {
        reject(`Unexpected error occured. Error: ${e}`);
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

  /**
   * Perform request and parse JSON from successfull response. Otherwise handle with Promise.catch
   * @param url {URL} URL to perform request to
   * @param options {RequestOptions} Request options
   * @param body {string} optional; Request body
   * @returns {T} parsed JSON
   */
  static async json<T>(url: URL, options: RequestOptions, body?: string): Promise<T> {
    const {data: data} = await Request.request(url, options, body);
    if (data == null) {
      return null as T;
    }
    return JSON.parse(data);
  }
}