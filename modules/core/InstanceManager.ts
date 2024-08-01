import fs from "fs";

export default class InstanceManager {
  private readonly root: string;
  private config: InstanceConfig | null = null;

  static loadConfig(root: string, name: string): InstanceConfig {
    const configPath: string = `${root}/${name}-instance.json`;
    if (fs.existsSync(configPath)) {
      const data: string = fs.readFileSync(configPath, {
        encoding: "utf-8"
      });
      const config: InstanceConfig = JSON.parse(data);
      if (config.name !== name) {
        throw new Error(`Parsed config name does not match name provided.`);
      }
      return config;
    }
    throw new Error(`Parsed config name does not match name provided.`);
  }

  static saveConfig(root: string, config: InstanceConfig): void {
    if (!fs.existsSync(root)) {
      fs.mkdirSync(root, {
        recursive: true
      });
    }

    fs.writeFileSync(`${root}/${config.name}-instance.json`, JSON.stringify(config, undefined, 2), {
      encoding: "utf-8"
    });
  }

  constructor(root: string) {
    this.root = root;
    this.setupRoot();
  }

  private setupRoot() {
    if (!fs.existsSync(this.root)) {
      fs.mkdirSync(this.root, {
        recursive: true
      })
    }
  }

  loadCurrent(name: string): void {
    const config: InstanceConfig = InstanceManager.loadConfig(this.root, name);
    this.setCurrent(config);
  }

  saveCurrent(): void {
    if (this.config != null) {
      InstanceManager.saveConfig(this.root, this.config);
    }
  }

  setCurrent(config: InstanceConfig): void {
    this.config = config;
  }

}