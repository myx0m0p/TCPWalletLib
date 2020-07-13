const ConfigStorage = {
  test: {
    env: 'test',

    nodeUrl: 'https://api.uos.network',
    hyperionUrl: 'https://api.uos.network',
    tableRows: {
      airdropsReceipt: {
        smartContract: 'testairdrop1',
        scope: 'testairdrop1',
        table: 'receipt',
      },
    },

    calculatorUrl: 'https://web-calculator-node.ucommunity.io:6879',
  },
  dev: {
    env: 'dev',

    nodeUrl: 'https://api.uos.network',
    hyperionUrl: 'https://api.uos.network',
    tableRows: {
      airdropsReceipt: {
        smartContract: 'testairdrop1',
        scope: 'testairdrop1',
        table: 'receipt',
      },
    },

    calculatorUrl: 'https://web-calculator-node.ucommunity.io:6879',
  },
  staging: {
    env: 'staging',

    nodeUrl: 'https://api.uos.network',
    hyperionUrl: 'https://api.uos.network',
    tableRows: {
      airdropsReceipt: {
        smartContract: 'testairdrop1',
        scope: 'testairdrop1',
        table: 'receipt',
      },
    },

    calculatorUrl: 'https://web-calculator-node.ucommunity.io:6879',
  },
  production: {
    env: 'production',

    nodeUrl: 'https://api.uos.network',
    hyperionUrl: 'https://api.uos.network',
    tableRows: {
      airdropsReceipt: {
        smartContract: 'airdrop11111',
        scope: 'airdrop11111',
        table: 'receipt',
      },
    },
    calculatorUrl: 'https://web-calculator-node.ucommunity.io:6879',
  },
};

export = ConfigStorage;
