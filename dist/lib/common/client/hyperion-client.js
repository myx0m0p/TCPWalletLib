"use strict";
const HyperionRpc = require("./hyperion-rpc");
const ConfigService = require("../../../config/config-service");
class HyperionClient {
    /**
     *
     * @return {HyperionRpc}
     */
    static getRpcClient() {
        const config = ConfigService.getConfig();
        if (ConfigService.isNode()) {
            // eslint-disable-next-line global-require
            const fetch = require('node-fetch');
            return new HyperionRpc(config.hyperionUrl, { fetch });
        }
        return new HyperionRpc(config.hyperionUrl);
    }
}
module.exports = HyperionClient;
