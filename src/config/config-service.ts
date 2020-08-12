interface BlockchainConfig {
  apiEndpoint: string,
  historyEndpoint: string,
  calculatorEndpoint: string,
}

let isNode = false;
let isInit = false;

let config: BlockchainConfig = {
  apiEndpoint: '',
  historyEndpoint: '',
  calculatorEndpoint: '',
};

class ConfigService {
  public static getConfig(): BlockchainConfig {
    return config;
  }

  public static initNodeJsEnv(): void {
    isNode = true;
  }

  public static isNode(): boolean {
    return isNode;
  }

  public static iInit(): boolean {
    return isInit;
  }

  public static init(object: BlockchainConfig): void {
    config = object;
    isInit = true;
  }
}

export = ConfigService;
