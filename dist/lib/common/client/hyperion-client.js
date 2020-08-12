"use strict";
const HyperionRpc = require("./hyperion-rpc");
const ConfigService = require("../../../config/config-service");
class HyperionClient {
    /**
     *
     * @return {HyperionRpc}
     */
    static getRpcClient() {
        const url = ConfigService.getConfig().historyEndpoint;
        if (ConfigService.isNode()) {
            // eslint-disable-next-line global-require
            const fetch = require('node-fetch');
            return new HyperionRpc(url, { fetch });
        }
        return new HyperionRpc(url);
    }
}
module.exports = HyperionClient;
