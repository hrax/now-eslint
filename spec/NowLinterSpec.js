const NowLinter = require("../src/NowLinter.js");

xdescribe("NowLinter", () => {
  const _createLinter = (options) => {
    new NowLinter({
      "domain": "???",
      "username": "???",
      "password": "???"
    }, options);
  };

  it("Fetch and prepare NowUpdateXML records", async() => {
    // TODO:
  });
});