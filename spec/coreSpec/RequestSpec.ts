/* eslint-disable no-magic-numbers */
import { RequestOptions } from "https";
import { Request, Response } from "../../modules/core/Request";

describe("Request", () => {
  it("throws exception on wrong protocol", async () => {
    const url = new URL("http://example.com");
    const options: RequestOptions = {
      method: "GET"
    }
    await expectAsync(Request.execute(url, options)).toBeRejectedWithError("URL protocol must be https!");
  })

  it("Returns response on 200 OK status code", async () => {
    const url = new URL("https://example.com");
    const options: RequestOptions = {
      method: "GET"
    }

    const response = await Request.execute(url, options);
    expect(response.isEmpty()).toBeFalse();
    expect(response.isOK()).toBeTrue();
    expect(response.hasData()).toBeTrue();
  });
});