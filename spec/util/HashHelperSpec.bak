/* eslint-disable no-magic-numbers */
const HashHelper = require("../../modules/util/HashHelper.js");

describe("HashHelper", () => {
  it("#cleanup", () => {
    const msg = `A text to be cleaned up
    in multiple lines
      and tabulators`;
    const expected = "atexttobecleanedupinmultiplelinesandtabulators";

    expect(HashHelper.cleanup(msg)).toBe(expected);
    expect(HashHelper.cleanup(expected)).toBe(expected);
  });

  it("#hash", () => {
    const msg = `A text to be cleaned up
    in multiple lines
      and tabulators`;
    const len = HashHelper.cleanup(msg).length;

    // check that generated hash starts with "quick check"
    expect(HashHelper.hash(msg)).toMatch(new RegExp("^8e" + len));
  });

  it("#matches", () => {
    const msg = `A text to be cleaned up
    in multiple lines
      and tabulators`;
    const msg2 = `A text to be cleaned up           in
      multiple   
      lines and             tabulators`;
    const hash = "8e46e5a5007c799266449cbc6ac780b9c4da67fba1e4d055b17fc8150c06cda75fa7";
    const hash2 = "8e55e5a5007c799266449cbc6ac780b9c4da67fba1e4d055b17fc8150c06cda75fa7";

    expect(HashHelper.matches(msg, hash)).toBeTrue();
    expect(HashHelper.matches(msg2, hash)).toBeTrue();
    expect(HashHelper.matches(msg, "somehash")).toBeFalse();
    expect(HashHelper.matches(msg, "8es46somehash")).toBeFalse();
    expect(HashHelper.matches(msg, "8e46somehash")).toBeFalse();
    expect(HashHelper.matches(msg, hash2)).toBeFalse();
  
  });
});