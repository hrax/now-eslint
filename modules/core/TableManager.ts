export default class TableManager implements TableConfig {
  tables: { [key: string]: SNTable; } = {};
  
  constructor(data?: TableConfig) {
    if (data != null) {
      this.setUpFromConfig(data);
    }
  }

  setUpFromConfig(data: TableConfig): void {
    Object.values<SNTable>(data.tables).forEach((table) => {
      
    });
  }
}