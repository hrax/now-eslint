import https from "https";
import agentS from "https-proxy-agent";
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

/**
 * https.request wrapper
 * 
 * Note:
 * See https://support.servicenow.com/kb?id=kb_article_view&sysparm_article=KB0534905
 * In the REST world, PUT and PATCH have different semantics. PUT means replace the entire resource with given data
 * (so null out fields if they are not provided in the request), while PATCH means replace only specified fields.
 * For the Table API, however, PUT and PATCH mean the same thing.  PUT and PATCH modify only the fields specified in the request.
 */
export class Request {

  static readonly ENCODING: BufferEncoding = "utf8";

  static readonly TIMEOUT: number = 10000;

  static createHttpsProxy(proxy: URL): agentS.HttpsProxyAgent<string> {
    return new agentS.HttpsProxyAgent(proxy);
  }

  /**
   * Unless Error is thrown, rejects promise with ResponseError
   * 
   * @param url 
   * @param options 
   * @param body 
   * @returns 
   */
  static async execute(url: URL, options: https.RequestOptions, body?: string): Promise<Response> {
    return new Promise((resolve, reject) => {
      if (url.protocol !== "https:") {
        reject(Response.empty("URL protocol must be https!"));
      }
      const request = https.request(
        url,
        options,
        (message: IncomingMessage) => {
          let data = "";
          message.setEncoding(Request.ENCODING);
          message.setTimeout(Request.TIMEOUT);

          message.on("data", (chunk: string) => {
            data += chunk;
          });

          message.on("end", () => {
            const response = new Response(message, data);
            // If response status code is not 200 reject promise
            if (!response.isOK()) {
              reject(response);
              return;
            }

            resolve(response);
          });
        }
      );

      request.on("error", (e) => {
        reject(Response.empty(`Unexpected error occured. Error: ${e}`));
      });

      request.on('timeout', function () {
        // It will emit 'error' message as well (with ECONNRESET code).
        reject(Response.empty("Request has timed out."));
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
  static async json(url: URL, options: https.RequestOptions, body?: string): Promise<any> {
    const response: Response = await Request.execute(url, options, body);
    if (!response.hasData()) {
      return Promise.reject(new Error("Response body is empty."));
    }

    const parsed: any = JSON.parse(response.data);
    if (!response.isOK()) {
      return Promise.reject(parsed)
    }
    return parsed;
  }

}

export class Response {
  readonly http: IncomingMessage | null;
  readonly data: string;
  
  constructor(httpResponse: IncomingMessage | null, data: string) {
    this.http = httpResponse;
    this.data = data;
  }

  static empty(data: string): Response {
    return new Response(null, data);
  }

  isEmpty(): boolean {
    return this.http == null;
  }

  hasData(): boolean {
    return this.data !== "";
  }

  private isStatus(message: IncomingMessage | null, status: ResponseStatus) {
    if (message == null) {
      return false;
    }
    return message.statusCode === status;
  }
  
  isOK(): boolean {
    return this.isStatus(this.http, ResponseStatus.OK);
  }

  isNotFound(): boolean {
    return this.isStatus(this.http, ResponseStatus.NOT_FOUND);
  }
  
  isUnauthorized(): boolean {
    return this.isStatus(this.http, ResponseStatus.UNAUTHORIZED);
  }
  
  isForbidden(): boolean {
    return this.isStatus(this.http, ResponseStatus.FORBIDDEN);
  }
  
  isError(): boolean {
    return this.isStatus(this.http, ResponseStatus.ERROR);
  }
}

export class ResponseError extends Error {
  readonly response: Response;
  constructor(message: string, response: Response | null, e?: any) {
    super(message, e);
    if (response == null) {
      response = new Response(null, "");
    }
    this.response = response;
  }
}