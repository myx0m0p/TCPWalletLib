"use strict";
const errors_1 = require("../../errors/errors");
const transaction_dictionary_1 = require("../../dictionary/transaction-dictionary");
const ConverterHelper = require("../../helpers/converter-helper");
const ConfigService = require("../../../config/config-service");
const { Api, JsonRpc, RpcError } = require('eosjs');
const { JsSignatureProvider } = require('eosjs/dist/eosjs-jssig');
class EosClient {
    /**
     * @deprecated
     * @see ConfigService.initNodeJsEnv
     * @return {void}
     */
    static setNodeJsEnv() {
        ConfigService.initNodeJsEnv();
    }
    /**
     * @deprecated
     * @see ConfigService.initForTestEnv
     * @return void
     */
    static initForTestEnv() {
        ConfigService.initForTestEnv();
    }
    /**
     * @deprecated
     * @see ConfigService.initForStagingEnv()
     * @return void
     */
    static initForStagingEnv() {
        ConfigService.initForStagingEnv();
    }
    /**
     * @deprecated
     * @see ConfigService.initForProductionEnv()
     * @return void
     */
    static initForProductionEnv() {
        ConfigService.initForProductionEnv();
    }
    // noinspection JSUnusedGlobalSymbols
    /**
     *
     * @return {boolean}
     */
    static isProduction() {
        const config = ConfigService.getConfig();
        return config.env === 'production';
    }
    // noinspection JSUnusedGlobalSymbols
    /**
     *
     * @return {boolean}
     */
    static isStaging() {
        const config = ConfigService.getConfig();
        return config.env === 'staging';
    }
    static getCurrentConfigTableRows() {
        const config = ConfigService.getConfig();
        return config.tableRows;
    }
    /**
     *
     * @return {JsonRpc}
     */
    static getRpcClient() {
        const config = ConfigService.getConfig();
        if (ConfigService.isNode()) {
            // eslint-disable-next-line global-require
            const fetch = require('node-fetch');
            return new JsonRpc(config.nodeUrl, { fetch });
        }
        return new JsonRpc(config.nodeUrl);
    }
    /**
     *
     * @param {string}    actorPrivateKey
     * @param {Object[]}  actions
     *
     * @return {Promise<Object>}
     */
    static async getSignedTransaction(actorPrivateKey, actions) {
        const broadcast = false;
        return this.sendTransaction(actorPrivateKey, actions, broadcast);
    }
    static async pushTransaction(signedTransaction) {
        try {
            const rpc = this.getRpcClient();
            return rpc.push_transaction(signedTransaction);
        }
        catch (error) {
            if (error instanceof RpcError && error.json.code === 401) {
                throw new errors_1.BadRequestError('Private key is not valid');
            }
            if (error.message === 'Non-base58 character') {
                throw new errors_1.BadRequestError('Malformed private key');
            }
            throw error;
        }
    }
    static async sendSingleActionTransaction(privateKey, action, broadcast = true) {
        return this.sendTransaction(privateKey, [action], broadcast);
    }
    static async sendTransaction(actorPrivateKey, actions, broadcast = true) {
        try {
            const api = this.getApiClient(actorPrivateKey);
            const params = {
                broadcast,
                blocksBehind: transaction_dictionary_1.BLOCKS_BEHIND,
                expireSeconds: transaction_dictionary_1.EXPIRATION_IN_SECONDS,
            };
            return await api.transact({
                actions,
            }, params);
        }
        catch (error) {
            if (error.json) {
                // eslint-disable-next-line no-console
                console.dir(error.json.error);
            }
            if (error instanceof RpcError && error.json.code === 401) {
                throw new errors_1.BadRequestError('Private key is not valid');
            }
            if (error.message === 'Non-base58 character') {
                throw new errors_1.BadRequestError('Malformed private key');
            }
            throw error;
        }
    }
    static async serializeActionsByApi(actions) {
        const api = EosClient.getApiClientWithoutSignatures();
        return api.serializeActions(actions);
    }
    static async deserializeActionsByApi(privateKey, transactionParts) {
        // #opt - private key is not required here
        const api = EosClient.getApiClient(privateKey);
        return api.deserializeTransaction(transactionParts.serializedTransaction);
    }
    static getApiClient(privateKey) {
        const rpc = this.getRpcClient();
        const signatureProvider = new JsSignatureProvider([privateKey]);
        if (ConfigService.isNode()) {
            // eslint-disable-next-line global-require
            const { TextEncoder, TextDecoder } = require('util');
            return new Api({
                rpc, signatureProvider, textDecoder: new TextDecoder(), textEncoder: new TextEncoder(),
            });
        }
        return new Api({ rpc, signatureProvider });
    }
    static getApiClientWithoutSignatures() {
        const rpc = this.getRpcClient();
        if (ConfigService.isNode()) {
            // eslint-disable-next-line global-require
            const { TextEncoder, TextDecoder } = require('util');
            return new Api({
                rpc, textDecoder: new TextDecoder(), textEncoder: new TextEncoder(),
            });
        }
        return new Api({ rpc });
    }
    /**
     *
     * @param {string} smartContract
     * @param {string} scope
     * @param {string} table
     * @param {string} boundFieldName
     * @param {number} limit
     * @param {number | null} indexPosition
     * @param {string | null} keyType
     * @param {number | null }argLowerBound
     * @returns {Promise<*[]>}
     */
    static async getTableRowsWithBatching(smartContract, scope, table, boundFieldName, limit, indexPosition = null, keyType = null, argLowerBound = null) {
        let lowerBound = argLowerBound;
        let tableRows = await EosClient.getJsonTableRows(smartContract, scope, table, limit, lowerBound, indexPosition, keyType);
        let iterations = 0;
        const maxIterationsLimit = limit * 100;
        let result = [];
        while (tableRows.length !== 0) {
            if (lowerBound !== argLowerBound) {
                tableRows.shift(); // #task not very efficient
            }
            result = result.concat(tableRows);
            const lastBoundValue = tableRows[tableRows.length - 1][boundFieldName];
            if (boundFieldName === 'owner') {
                lowerBound = ConverterHelper.getAccountNameAsBoundString(lastBoundValue);
            }
            else {
                lowerBound = lastBoundValue;
            }
            tableRows = await EosClient.getJsonTableRows(smartContract, scope, table, limit, lowerBound, indexPosition, keyType);
            if (tableRows.length === 1 && result.length !== 0 && tableRows[0][boundFieldName] === lastBoundValue) {
                break;
            }
            iterations += 1;
            if (iterations >= maxIterationsLimit) {
                throw new Error('Max iterations number is exceeded');
            }
        }
        return result;
    }
    /**
     *
     * @param {string} smartContract
     * @param {string} scope
     * @param {string} table
     * @param {number} limit
     * @param {string | number | null} lowerBound
     * @param { number | null }indexPosition
     * @param {string | null} keyType
     * @returns {Promise<Object[]>}
     */
    static async getJsonTableRows(smartContract, scope, table, limit, lowerBound = null, indexPosition = null, keyType = null) {
        if (limit > 1000) {
            throw new Error('It is not recommended to have limit value more than 1000');
        }
        const rpc = EosClient.getRpcClient();
        const query = {
            limit,
            scope,
            table,
            code: smartContract,
            json: true,
        };
        if (lowerBound !== null) {
            query.lower_bound = lowerBound;
        }
        if (indexPosition !== null) {
            query.index_position = `${indexPosition}`;
        }
        if (keyType !== null) {
            query.key_type = keyType;
        }
        const data = await rpc.fetch('/v1/chain/get_table_rows', query);
        // const data = await rpc.get_table_rows(query);
        return data.rows;
    }
}
module.exports = EosClient;
