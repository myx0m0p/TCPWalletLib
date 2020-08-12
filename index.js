/* eslint-disable global-require */
module.exports = {
  WalletApi: require('./dist/lib/wallet/api/wallet-api'),
  SocialApi: require('./dist/lib/social-transactions/api/social-api'),
  SocialActionsApi: require('./dist/lib/social-transactions/api/social-actions-api'),

  ContentApi: require('./dist/lib/content/api/content-api'),

  Content: {
    ProfileApi:       require('./dist/lib/content/api/content-api'),
    PublicationsApi:  require('./dist/lib/content/api/content-publications-api'),
    OrganizationsApi: require('./dist/lib/content/api/content-organizations-api'),

    ContentInteractionsApi: require('./dist/lib/social-transactions/api/content-interactions-api'),
  },
  ContentIdGenerator: require('./dist/lib/content/service/content-id-generator'),

  ContentPublicationsActionsApi: require('./dist/lib/content/api/content-publications-actions-api'),
  ContentCommentsActionsApi: require('./dist/lib/content/api/content-comments-actions-api'),

  SocialKeyApi: require('./dist/lib/social-key/api/social-key-api'),
  RegistrationApi: require('./dist/lib/registration/api/registration-api'),

  TransactionSender: require('./dist/lib/transaction-sender'),
  UosAccountsPropertiesApi: require('./dist/lib/uos-accounts-properties/uos-accounts-properties-api'),
  EosClient: require('./dist/lib/common/client/eos-client'),
  ConfigService: require('./dist/config/config-service'),
  PrepareTransactionApi: require('./dist/lib/common/api/prepare-transaction-api'),
  MultiSignatureApi: require('./dist/lib/multi-signature/api/multi-signature-api'),

  BlockchainNodes: require('./dist/lib/governance/api/blockchain-nodes-api'),
  Dictionary: {
    BlockchainTrTraces: require('./dist/lib/dictionary/blockchain-tr-traces-dictionary'),
    BlockchainNodes: require('./dist/lib/governance/dictionary/blockchain-nodes-dictionary'),
    Interactions: require('./dist/lib/dictionary/interactions-dictionary'),
    InteractionTypes: require('./dist/lib/dictionary/interaction-types-dictionary'),
    SmartContractsDictionary: require('./dist/lib/dictionary/smart-contracts-dictionary'),
    SmartContractsActionsDictionary: require('./dist/lib/dictionary/smart-contracts-actions-dictionary'),
  },
};
