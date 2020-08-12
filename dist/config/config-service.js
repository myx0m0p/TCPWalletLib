"use strict";
let isNode = false;
let isInit = false;
let config = {
    apiEndpoint: '',
    historyEndpoint: '',
    calculatorEndpoint: '',
};
class ConfigService {
    static getConfig() {
        return config;
    }
    static initNodeJsEnv() {
        isNode = true;
    }
    static isNode() {
        return isNode;
    }
    static iInit() {
        return isInit;
    }
    static init(object) {
        config = object;
        isInit = true;
    }
}
module.exports = ConfigService;
