import HyperionRpc = require('./hyperion-rpc');
import ConfigService = require('../../../config/config-service');

class HyperionClient {
  /**
   *
   * @return {HyperionRpc}
   */
  static getRpcClient() {
    const url: string = ConfigService.getConfig().historyEndpoint;

    if (ConfigService.isNode())  {
      // eslint-disable-next-line global-require
      const fetch = require('node-fetch');

      return new HyperionRpc(url, { fetch });
    }

    return new HyperionRpc(url);
  }
}

export = HyperionClient;
