import { RequestOptions } from "https";
import { Request, Response } from "../../src/core/Request";

describe("RequestSpec", () => {
  it("throws exception on wrong protocol", async () => {
    const url = new URL("http://example.com");
    const options: RequestOptions = {
      method: "GET"
    }
    await expect(Request.execute(url, options)).rejects.toStrictEqual(Response.empty("URL protocol must be https!"));
  })

  it("Returns response on 200 OK status code", async () => {
    const url = new URL("https://example.com");
    const options: RequestOptions = {
      method: "GET"
    }

    const response = await Request.execute(url, options);
    expect(response.isEmpty()).toBe(false);
    expect(response.isOK()).toBe(true);
    expect(response.hasData()).toBe(true);
  });
});