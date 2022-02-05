/**
 * Abstract report generator
 */
class AbstractReportGenerator {
  build(data) {
    throw new Error("abstract; implement in child class");
  }

  generate(data, path) {
    throw new Error("abstract; implement in child class");
  }
}

module.exports = AbstractReportGenerator;