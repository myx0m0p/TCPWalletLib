const ENV__TEST = 'test';
const ENV__DEV = 'dev';
const ENV__STAGING = 'staging';
const ENV__PRODUCTION = 'production';

const envList: string[] = [
  ENV__TEST,
  ENV__DEV,
  ENV__STAGING,
  ENV__PRODUCTION,
];

class EnvHelper {
  public static executeByEnvironment(executors) {
    const env = this.getNodeEnvOrException();
    const func = executors[env];

    if (!func) {
      throw new TypeError(`There is no executor for env: ${env}`);
    }

    func();
  }

  public static testEnv(): string {
    return ENV__TEST;
  }

  public static devEnv(): string {
    return ENV__DEV;
  }

  public static stagingEnv(): string {
    return ENV__STAGING;
  }

  public static productionEnv(): string {
    return ENV__PRODUCTION;
  }

  public static getPortOrException(): number {
    const port = process.env.PORT;

    if (!port) {
      throw new Error('There is no port argument inside process.env');
    }

    return +port;
  }

  public static getNodeEnvOrException(): string {
    const env = this.getNodeEnv();

    if (!env) {
      throw new TypeError('There is no NODE_ENV but must be');
    }

    if (!envList.includes(env)) {
      throw new TypeError(`Unsupported env: ${env}`);
    }

    return env;
  }

  public static getNodeEnv(): string | undefined {
    return process.env.NODE_ENV;
  }

  public static isTestEnv(): boolean {
    return this.isExpectedEnv(ENV__TEST);
  }

  public static isDevEnv(): boolean {
    return this.isExpectedEnv(ENV__DEV);
  }

  public static isStagingEnv(): boolean {
    return this.isExpectedEnv(ENV__STAGING);
  }

  public static isProductionEnv(): boolean {
    return this.isExpectedEnv(ENV__PRODUCTION);
  }

  public static isNotTestEnv(): boolean {
    return this.isNotExpectedEnv(ENV__TEST);
  }

  public static isNotAProductionEnv(): boolean {
    return this.isNotExpectedEnv(ENV__PRODUCTION);
  }

  private static isExpectedEnv(env: string): boolean {
    return process.env.NODE_ENV === env;
  }

  private static isNotExpectedEnv(env: string): boolean {
    return process.env.NODE_ENV !== env;
  }
}

export = EnvHelper;
