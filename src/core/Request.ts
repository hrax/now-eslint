import https from "https";
import agentS from "https-proxy-agent";
import { IncomingMessage } from "http";

// eslint-disable-next-line no-magic-numbers
export type ResponseStatus = 200 | 400 | 401 | 403 | 500;
// eslint-disable-next-line id-length
export const OK: ResponseStatus = 200;
export const NOT_FOUND: ResponseStatus = 400;
export const UNAUTHORIZED: ResponseStatus = 401;
export const FORBIDDEN: ResponseStatus = 403;
export const ERROR: ResponseStatus = 500;

/*
 * Export type RequestOptions = HttpRequestOptions & {
 * 
 * } 
 */
const TIMEOUT = 10000;

/**
 * Https.request wrapper
 * 
 * Note:
 * See https://support.servicenow.com/kb?id=kb_article_view&sysparm_article=KB0534905
 * In the REST world, PUT and PATCH have different semantics. PUT means replace the entire resource with given data
 * (so null out fields if they are not provided in the request), while PATCH means replace only specified fields.
 * For the Table API, however, PUT and PATCH mean the same thing.  PUT and PATCH modify only the fields specified in the request.
 */
// eslint-disable-next-line @typescript-eslint/no-extraneous-class
export class Request {
  static readonly ENCODING: BufferEncoding = "utf8";

  static readonly TIMEOUT: number = TIMEOUT;

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

      request.on("timeout", function() {
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
  static async json(url: URL, options: https.RequestOptions, body?: string): Promise<unknown> {
    const response: Response = await Request.execute(url, options, body);
    if (!response.hasData()) {
      return Promise.reject(new Error("Response body is empty."));
    }

    return response.dataAsJSON();
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

  dataAsJSON(): unknown {
    if (!this.hasData()) {
      return null;
    }
    return JSON.parse(this.data);
  }

  private isStatus(message: IncomingMessage | null, status: ResponseStatus) {
    if (message == null) {
      return false;
    }
    return message.statusCode === status;
  }
  
  isOK(): boolean {
    return this.isStatus(this.http, OK);
  }

  isNotFound(): boolean {
    return this.isStatus(this.http, NOT_FOUND);
  }
  
  isUnauthorized(): boolean {
    return this.isStatus(this.http, UNAUTHORIZED);
  }
  
  isForbidden(): boolean {
    return this.isStatus(this.http, FORBIDDEN);
  }
  
  isError(): boolean {
    return this.isStatus(this.http, ERROR);
  }
}

export class ResponseError extends Error {
  readonly response: Response;
  constructor(message: string, response: Response | null, e?: ErrorOptions) {
    super(message, e);
    if (response == null) {
      response = new Response(null, "");
    }
    this.response = response;
  }
}