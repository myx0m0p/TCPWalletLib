/* eslint-disable no-console */
import { BadRequestError } from './errors/errors';
import { TOKEN_SYMBOL } from './dictionary/currency-dictionary';
import { IAccountData } from './account/interfaces/account-data-interfaces';

import EosClient = require('./common/client/eos-client');
import HyperionClient = require('./common/client/hyperion-client');
import ConverterHelper = require('./helpers/converter-helper');
import AccountInfo = require('./account-info');

const SMART_CONTRACT__EMISSION  = 'uos.calcs';
const TABLE_NAME__EMISSION      = 'account';
const TABLE_NAME__EMISSION_TOTAL = 'totals';
const TABLE_NAME__RAM_MARKET    = 'rammarket';

const SMART_CONTRACT__EOSIO = 'eosio';

const TABLE_ROWS_LIMIT_ALL = 999999;

const SMART_CONTRACT__TIME_LOCK  = 'uostimelock1';
const SMART_CONTRACT__ACTIVITY_LOCK  = 'uosactvlock1';
const TABLE_NAME__BALANCE      = 'balance';
const TOKEN_SYMBOL_TIMELOCK_START = '2020-01-01';
const TOKEN_SYMBOL_TIMELOCK_END = '2021-01-01';
const TOKEN_SYMBOL_ACTIVITY_LOCK_MULTIPLIER = 2;
const TOKEN_SYMBOL_TOKEN_DECIMALS = 4;

const _ = require('lodash');

class BlockchainRegistry {
  /**
   *
   * @param {string} accountName
   * @param {number} amount
   * @return {Promise<void>}
   */
  static async isEnoughBalance(accountName, amount) {
    const balance = await this.getAccountBalance(accountName);

    return +balance.toFixed(4) >= +amount.toFixed(4);
  }

  /**
   *
   * @param {string} accountName
   * @return {Promise<Object>}
   */
  static async getRawVoteInfo(accountName) {
    const rpc = EosClient.getRpcClient();

    const response = await rpc.get_account(accountName);

    return response.voter_info;
  }

  /**
   *
   * @param {string} accountName
   * @return {Promise<boolean>}
   */
  static async doesAccountExist(accountName) {
    const rpc = EosClient.getRpcClient();

    try {
      await rpc.get_account(accountName);

      return true;
    } catch (error) {
      throw new BadRequestError('Probably account does not exist. Please check spelling.');
    }
  }

  /**
   *
   * @param {string} accountName
   * @return {Promise<void>}
   */
  static async isSelfDelegatedStake(accountName) {
    const info = await this.getAccountInfo(accountName);

    if (Object.keys(info).length === 0) {
      throw new BadRequestError('Probably account does not exist. Please check spelling.');
    }

    if (info.tokens.staked === 0) {
      throw new BadRequestError('It is possible to vote only if you have self-staked tokens.');
    }
  }

  /**
   *
   * @param {string[]} producers
   * @return {Promise<void>}
   */
  static async doBlockProducersExist(producers) {
    const rpc = EosClient.getRpcClient();

    const allProducers = await rpc.get_producers(true, '', TABLE_ROWS_LIMIT_ALL);

    const producersIndex: any[] = [];
    for (let i = 0; i < allProducers.rows.length; i += 1) {
      const producer = allProducers.rows[i];

      producersIndex.push(producer.owner);
    }

    const notExisted = _.difference(producers, producersIndex);

    if (notExisted.length > 0) {
      throw new BadRequestError(`There is no such block producers: ${notExisted.join(', ')}`);
    }
  }

  /**
   *
   * @param {string} accountName
   * @param {number} bytesAmount
   * @return {Promise<void>}
   */
  static async isEnoughRam(accountName, bytesAmount) {
    const balance = await this.getFreeRamAmountInBytes(accountName);

    return balance >= bytesAmount;
  }

  /**
   *
   * @param {string} accountName
   * @param {number} bytesAmount
   * @return {Promise<boolean>}
   */
  static async isEnoughRamOrException(accountName, bytesAmount) {
    const isEnough = await this.isEnoughRam(accountName, bytesAmount);

    if (isEnough) {
      return true;
    }

    throw new BadRequestError('Not enough free RAM. Please correct input data');
  }

  /**
   *
   * @param {string} accountName
   * @return {Promise<number>}
   */
  static async getFreeRamAmountInBytes(accountName) {
    const rpc = EosClient.getRpcClient();

    const response = await rpc.get_account(accountName);

    if (+response.ram_usage && +response.ram_quota) {
      return +response.ram_quota - +response.ram_usage;
    }

    return 0;
  }

  /**
   *
   * @param {string} accountName
   * @return {Promise<number>}
   */
  static async getTotalRamAmount(accountName) {
    const rpc = EosClient.getRpcClient();

    const response = await rpc.get_account(accountName);

    return +response.ram_quota;
  }

  /**
   *
   * @param {string} accountName
   * @param {number} amount
   * @return {Promise<boolean>}
   */
  static async isEnoughBalanceOrException(accountName, amount) {
    const isEnoughBalance = await this.isEnoughBalance(accountName, amount);

    if (isEnoughBalance) {
      return true;
    }

    throw new BadRequestError('Not enough tokens. Please correct input data');
  }

  /**
   * @return {Promise<number>} TOKEN_SYMBOL/RAM_BYTE
   *
   * @link https://eosio.stackexchange.com/questions/847/how-to-get-current-last-ram-price
   */
  static async getCurrentTokenPerRamByte() {
    const rpc = EosClient.getRpcClient();

    const response = await rpc.get_table_rows({
      code:   SMART_CONTRACT__EOSIO,
      scope:  SMART_CONTRACT__EOSIO,
      table:  TABLE_NAME__RAM_MARKET,
    });

    const data = response.rows[0];

    const connectorBalance            = ConverterHelper.getTokensAmountFromString(data.quote.balance);
    const smartTokenOutstandingSupply = ConverterHelper.getRamAmountFromString(data.base.balance);
    const connectorWeight             = 1; // +data.quote.weight; this weight leads to wrong price calculations

    return connectorBalance / (smartTokenOutstandingSupply * connectorWeight);
  }

  /**
   *
   * @param {string} accountName
   * @return {Promise<number>}
   */
  static async getTotalEmissionAmount(accountName) {
    const rpc = EosClient.getRpcClient();

    const response = await rpc.get_table_rows({
      code:   SMART_CONTRACT__EMISSION,
      scope:  SMART_CONTRACT__EMISSION,
      table:  TABLE_NAME__EMISSION_TOTAL,
      lower_bound: accountName,
      upper_bound: accountName,
      limit: 1,
      json:   true,
    });

    if (response.rows.length === 0) {
      return 0;
    }

    return parseFloat(response.rows[0].total_emission);
  }

  /**
   *
   * @param {string} accountName
   * @return {Promise<number>}
   */
  static async getUnclaimedEmissionAmount(accountName) {
    const rpc = EosClient.getRpcClient();

    const response = await rpc.get_table_rows({
      code:   SMART_CONTRACT__EMISSION,
      scope:  accountName,
      table:  TABLE_NAME__EMISSION,
      json:   true,
    });

    if (response.rows.length === 0) {
      return 0;
    }

    const em = response.rows[0].account_sum;

    return Math.trunc(em * 100) / 100;
  }

  /**
   *
   * @param {string} accountName
   * @param {string} contractName
   * @return {Promise<object>}
   */
  static async getVestedLockedBalance(accountName, contractName) {
    const rpc = EosClient.getRpcClient();

    const response = await rpc.get_table_rows({
      code:   contractName,
      scope:  contractName,
      table:  TABLE_NAME__BALANCE,
      lower_bound: accountName,
      upper_bound: accountName,
      limit: 1,
      json:   true,
    });

    let r = {
      total: 0,
      withdrawal: 0,
    };

    if (response.rows.length === 0) {
      return r;
    }

    r = {
      total: response.rows[0].deposit,
      withdrawal: response.rows[0].withdrawal,
    };

    return r;
  }

  /**
   *
   * @param {string} accountName
   * @return {Promise<object>}
   */
  static async getTimeLockedBalance(accountName) {
    return this.getVestedLockedBalance(accountName, SMART_CONTRACT__TIME_LOCK);
  }

  /**
   *
   * @param {string} accountName
   * @return {Promise<object>}
   */
  static async getActivityLockedBalance(accountName) {
    return this.getVestedLockedBalance(accountName, SMART_CONTRACT__ACTIVITY_LOCK);
  }

  /**
   *
   * @param {string} accountName
   * @return {Promise<{net: number, cpu: number, currency: string}>}
   */
  static async getCurrentNetAndCpuStakedTokens(accountName) {
    const rpc = EosClient.getRpcClient();

    const data = {
      net: 0,
      cpu: 0,

      currency: TOKEN_SYMBOL,
    };

    const response = await rpc.get_account(accountName);

    if (response.self_delegated_bandwidth) {
      data.net =
        ConverterHelper.getTokensAmountFromString(response.self_delegated_bandwidth.net_weight);
      data.cpu =
        ConverterHelper.getTokensAmountFromString(response.self_delegated_bandwidth.cpu_weight);
    }

    return data;
  }

  public static async getAccountBalance(accountName: string, symbol: string = TOKEN_SYMBOL): Promise<number> {
    const rpc = EosClient.getRpcClient();

    const balanceResponse = await rpc.get_currency_balance('eosio.token', accountName, symbol);
    if (balanceResponse.length === 0) {
      return 0;
    }

    return ConverterHelper.getTokensAmountFromString(balanceResponse[0], symbol);
  }

  /**
   *
   * @param {string} accountName
   * @return {Promise<number>}
   */
  static async getEmission(accountName) {
    try {
      return await BlockchainRegistry.getUnclaimedEmissionAmount(accountName);
    } catch (error) {
      console.error('Get unclaimed emission amount error. Emission will be set to 0 for GET response. Error is:', error);

      return 0;
    }
  }

  /**
   *
   * @param {string} accountName
   * @return {Promise<number>}
   */
  static async getTotalEmission(accountName) {
    try {
      return await BlockchainRegistry.getTotalEmissionAmount(accountName);
    } catch (error) {
      console.error('Get unclaimed emission amount error. Emission will be set to 0 for GET response. Error is:', error);

      return 0;
    }
  }

  /**
   *
   * @param {string} accountName
   * @return {Promise<object>}
   */
  static async getTimeUnlocked(accountName) {
    try {
      const timeBalance = await BlockchainRegistry.getTimeLockedBalance(accountName);
      const totalAmount = {
        total: 0,
        unlocked: 0,
      };
      if (timeBalance.total > 0) {
        const start = new Date(TOKEN_SYMBOL_TIMELOCK_START).getTime();
        const end = new Date(TOKEN_SYMBOL_TIMELOCK_END).getTime();
        const now = new Date().getTime();

        let unlocked = Math.ceil(timeBalance.total * ((now - start) / (end - start)) - timeBalance.withdrawal);

        if (unlocked < 0) unlocked = 0;

        totalAmount.total = Math.trunc((timeBalance.total / 10 ** TOKEN_SYMBOL_TOKEN_DECIMALS) * 100) / 100;
        totalAmount.unlocked = Math.trunc((unlocked / 10 ** TOKEN_SYMBOL_TOKEN_DECIMALS) * 100) / 100;
      }

      return totalAmount;
    } catch (error) {
      console.error('Get unclaimed time locked amount error. Amount will be set to 0 for GET response. Error is:', error);

      return {
        total: 0,
        unlocked: 0,
      };
    }
  }

  /**
   *
   * @param {string} accountName
   * @return {Promise<object>}
   */
  static async getActivityUnlocked(accountName) {
    try {
      const activityBalance = await BlockchainRegistry.getActivityLockedBalance(accountName);
      const totalAmount = {
        total: 0,
        unlocked: 0,
      };

      if (activityBalance.total > 0) {
        let totalEmission = await BlockchainRegistry.getTotalEmission(accountName);
        totalEmission = Math.ceil(totalEmission * 10 ** TOKEN_SYMBOL_TOKEN_DECIMALS);

        const start = new Date(TOKEN_SYMBOL_TIMELOCK_START).getTime();
        const end = new Date(TOKEN_SYMBOL_TIMELOCK_END).getTime();
        const now = new Date().getTime();

        const amountByTime = activityBalance.total * ((now - start) / (end - start));

        const totalEmissionUnlocked = totalEmission * TOKEN_SYMBOL_ACTIVITY_LOCK_MULTIPLIER;

        let unlocked = amountByTime;

        if (totalEmissionUnlocked < unlocked) unlocked = totalEmissionUnlocked;

        unlocked -= activityBalance.withdrawal;

        if (unlocked < 0) unlocked = 0;

        totalAmount.total = Math.trunc((activityBalance.total / 10 ** TOKEN_SYMBOL_TOKEN_DECIMALS) * 100) / 100;
        totalAmount.unlocked = Math.trunc((unlocked / 10 ** TOKEN_SYMBOL_TOKEN_DECIMALS) * 100) / 100;
      }

      return totalAmount;
    } catch (error) {
      console.error('Get unclaimed activity locked amount error. Amount will be set to 0 for GET response. Error is:', error);

      return {
        total: 0,
        unlocked: 0,
      };
    }
  }

  public static async getRawAccountData(accountName: string): Promise<IAccountData> {
    const rpc = EosClient.getRpcClient();

    return rpc.get_account(accountName);
  }

  /**
   *
   * @param {string} accountName
   * @return {Promise<Object>}
   */
  static async getAccountInfo(accountName) {
    const rpc = EosClient.getRpcClient();

    const info = new AccountInfo();

    const balance = await this.getAccountBalance(accountName);
    info.setActiveTokens(balance);

    //const emission = await this.getEmission(accountName);
    //info.setEmission(emission);

    //const timelock = await this.getTimeUnlocked(accountName);
    //info.setTimeLock(timelock);

    //const activitylock = await this.getActivityUnlocked(accountName);
    //info.setActivityLock(activitylock);

    let response;
    try {
      response = await rpc.get_account(accountName);
    } catch (error) {
      console.warn(`Probably there is no account with name: ${accountName}`);
      return {};
    }

    if (response.ram_usage && response.ram_quota) {
      info.setRamInKb(+response.ram_quota, +response.ram_usage);
    }

    if (response.net_limit) {
      info.setNetLimitInKb(+response.net_limit.max, +response.net_limit.used);
    }

    if (response.cpu_limit) {
      info.setCpuLimitInSec(+response.cpu_limit.max, +response.cpu_limit.used);
    }

    if (response.self_delegated_bandwidth) {
      info.setResourcesTokens(
        response.self_delegated_bandwidth.net_weight,
        response.self_delegated_bandwidth.cpu_weight,

        response.total_resources.net_weight,
        response.total_resources.cpu_weight,
      );
    }

    if (response.self_delegated_bandwidth === null && response.total_resources) {
      info.setNonSelfDelegatedResourcesOnly(response.total_resources.net_weight, response.total_resources.cpu_weight);
    }

    if (response.refund_request) {
      info.setUnstakedRequestData(
        response.refund_request.request_time,
        response.refund_request.net_amount,
        response.refund_request.cpu_amount,
      );
    }

    return info.getInfo();
  }

  /**
   *
   * @param {string} accountName
   * @param {number} pos
   * @param {number} offset
   * @return {Promise<Object>}
   */
  static async getHistoryActions(accountName: string, skip: number = 0, limit: number = 20) {
    const rpc = HyperionClient.getRpcClient();
    return rpc.history_get_actions(accountName, skip, limit);
  }

  /**
 *
 * @param {string} accountName
 * @param {number} pos
 * @param {number} offset
 * @return {Promise<Object>}
 */
  static async getHistorySimpleActions(accountName: string, skip: number = 0, limit: number = 20) {
    const rpc = HyperionClient.getRpcClient();
    return rpc.history_get_simple_actions(accountName, skip, limit);
  }
}

export = BlockchainRegistry;
