/**
 * Abstract report generator
 */
class AbstractReportGenerator {
  build(data) {
    throw new Error("abstract; implement in child class");
  }

  extension() {
    throw new Error("abstract; implement in child class");
  }

  save(folder, fileName, data) {
    throw new Error("abstract; implement in child class");
  }
}

module.exports = AbstractReportGenerator;