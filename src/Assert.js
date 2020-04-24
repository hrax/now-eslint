
class Assert {
  static notEmpty(value, message) {
    if (value == null || value === "") {
      throw new Error(message);
    }
  }
}

module.exports = Assert;