import { TOKEN_SYMBOL } from './currency-dictionary';

class ActionResourcesDictionary {
  public static basicResourceRam(): number {
    return 8192;
  }

  public static basicResourceRamForMultiSignature(): number {
    return ActionResourcesDictionary.basicResourceRam() * 2;
  }

  public static basicResourceNetTokensNumber(): number {
    return 1;
  }

  public static basicResourceCpuTokensNumber(): number {
    return 1;
  }

  public static basicResourceCpuTokens(): string {
    return `${this.basicResourceCpuTokensNumber()}.0000 ${TOKEN_SYMBOL}`;
  }

  public static basicResourceNetTokens(): string {
    return `${this.basicResourceNetTokensNumber()}.0000 ${TOKEN_SYMBOL}`;
  }
}

export = ActionResourcesDictionary;
