export enum UpdateXMLAction {
  INSERT_OR_UPDATE = "INSERT_OR_UPDATE",
  DELETE = "DELETE"
};

export default interface UpdateXML {
  name: string;
  id: string;
  action: UpdateXMLAction;
  type: string;
  targetName: string;
  updateSet: string;
  payload: string;
  createdBy: string;
  createdOn: string;
  updatedBy: string;
  updatedOn: string;

  // These 2 properties should be scanned from the payload, if not provided set null
  targetTable: string | null;
  targetId: string | null;
  
  toJSON(): any
}