const Assert = require("./Assert");

const NowUpdateXMLAction = {
  INSERT_OR_UPDATE: "INSERT_OR_UPDATE",
  DELETE: "DELETE"
};
Object.freeze(NowUpdateXMLAction);

class NowUpdateXML {
  constructor(data) {
    Assert.notNull(data, "Data must not be null.");
    Assert.isObject(data, "Data must be an Object.");
    Assert.objectContainsAllProperties(data, ["sysId", "name", "action", "createdBy", "createdOn", "updatedBy", "updatedOn", "type", "targetName", "updateSet", "payload"], "Data object must contain all of the following properties {0}.");

    const propertyConfig = {
      configurable: false,
      writable: false,
      enumerable: true
    };

    // Immutable properties
    Object.defineProperty(this, "name", Object.assign({}, propertyConfig, {value: data.name}));
    Object.defineProperty(this, "id", Object.assign({}, propertyConfig, {value: data.sysId}));
    Object.defineProperty(this, "action", Object.assign({}, propertyConfig, {value: data.action}));
    Object.defineProperty(this, "type", Object.assign({}, propertyConfig, {value: data.type}));
    Object.defineProperty(this, "targetName", Object.assign({}, propertyConfig, {value: data.targetName}));
    Object.defineProperty(this, "updateSet", Object.assign({}, propertyConfig, {value: data.updateSet}));
    Object.defineProperty(this, "payload", Object.assign({}, propertyConfig, {value: data.payload}));
    Object.defineProperty(this, "createdBy", Object.assign({}, propertyConfig, {value: data.createdBy}));
    Object.defineProperty(this, "createdOn", Object.assign({}, propertyConfig, {value: data.createdOn}));
    Object.defineProperty(this, "updatedBy", Object.assign({}, propertyConfig, {value: data.updatedBy}));
    Object.defineProperty(this, "updatedOn", Object.assign({}, propertyConfig, {value: data.updatedOn}));

    // These 2 properties should be scanned from the payload, if not provided set null
    Object.defineProperty(this, "targetTable", Object.assign({}, propertyConfig, {value: data.targetTable || null}));
    Object.defineProperty(this, "targetId", Object.assign({}, propertyConfig, {value: data.targetId || null}));
  }

  toJSON() {
    // Lazy, deep copy of all enumerable properties
    return JSON.parse(JSON.stringify(this));
  }
}

module.exports = NowUpdateXML;