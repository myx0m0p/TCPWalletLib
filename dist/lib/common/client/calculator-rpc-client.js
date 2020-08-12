"use strict";
/* eslint-disable global-require */
const ConfigService = require("../../../config/config-service");
const { JsonRpc } = require('eosjs');
class CalculatorRpcClient {
    static getClient() {
        const url = ConfigService.getConfig().calculatorEndpoint;
        if (ConfigService.isNode()) {
            const fetch = require('node-fetch');
            return new JsonRpc(url, { fetch });
        }
        return new JsonRpc(url);
    }
}
module.exports = CalculatorRpcClient;
