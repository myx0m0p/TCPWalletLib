"use strict";
const ConfigStorage = require("./config-storage");
const TEST_ENV = 'test';
const DEV_ENV = 'dev';
const STAGING_ENV = 'staging';
const PRODUCTION_ENV = 'production';
let isNode = false;
let env = DEV_ENV;
class ConfigService {
    static getConfig() {
        return ConfigStorage[env];
    }
    /**
     *
     * @return {void}
     */
    static initNodeJsEnv() {
        isNode = true;
    }
    static initForTestEnv() {
        env = TEST_ENV;
    }
    static initForDevEnv() {
        env = DEV_ENV;
    }
    static initForStagingEnv() {
        env = STAGING_ENV;
    }
    static initForProductionEnv() {
        env = PRODUCTION_ENV;
    }
    static isNode() {
        return isNode;
    }
}
module.exports = ConfigService;
