/* eslint-disable no-useless-escape */
import ContentPostsGenerator = require('./content-posts-generator');
import SmartContractsActionsDictionary = require('../../../../src/lib/dictionary/smart-contracts-actions-dictionary');
import InteractionsDictionary = require('../../../../src/lib/dictionary/interactions-dictionary');
import ContentCommentsGenerator = require('./content-comments-generator');
import ContentOrganizationsGenerator = require('./content-organizations-generator');

const { EntityNames } = require('@myx0m0p/tcp-common-lib').Common.Dictionary;

class ContentChecker {
  public static checkPostPushingFromUserResponse(
    response: any,
    accountNameFrom: string,
    interactionName: string,
    contentId: string,
  ): void {
    const samplePost = ContentPostsGenerator.getSamplePostInputFields();

    const expectedData = {
      acc: accountNameFrom,
      action_json: `{\"interaction\":\"${interactionName}\",\"data\":{\"account_from\":\"${accountNameFrom}\",\"content_id\":\"${contentId}\"}}`,
      // #task - some fields are hardcoded
      action_data: `{\"title\":\"${samplePost.title}\",\"description\":\"${samplePost.description}\",\"leading_text\":\"${samplePost.leading_text}\",\"entity_images\":{},\"entity_tags\":[\"winter\",\"summer\"],`,
    };

    const expectedActName = SmartContractsActionsDictionary.socialAction();
    this.checkProcessedResponsePart(response, expectedData, expectedActName);
  }

  public static checkDirectPostPushingResponse(
    response: any,
    interaction: string,
    accountFrom: string,
    contentId: string,
    entityNameFor: string,
    entityBlockchainIdFor: string,
    createdAt: string | null = null,
    expectedActName: string = SmartContractsActionsDictionary.socialAction(),
    acc: string | null = null,
  ): void {
    const samplePost = ContentPostsGenerator.getDirectPostOrRepostInputFields();

    const entityToKey = entityNameFor === EntityNames.USERS ? 'account_to' : 'organization_id_to';

    const expectedData = {
      acc: acc || accountFrom,
      actionJson: {
        interaction,
        data: {
          account_from: accountFrom,
          content_id: contentId,
          [entityToKey]: entityBlockchainIdFor,
        },
      },
      actionData: {
        description: samplePost.description,
        entity_images: {},
        entity_tags: [
          'winter',
          'summer',
        ],
        blockchain_id: contentId,
        entity_name_for: entityNameFor,
        entity_blockchain_id_for: entityBlockchainIdFor,
        author_account_name: accountFrom,
      },
    };

    this.checkProcessedResponsePartAsObject(response, expectedData, expectedActName, createdAt);
  }

  public static checkOrganizationPushingResponse(
    response: any,
    interaction: string,
    accountFrom: string,
    organizationBlockchainId: string,
    createdAt: string | null = null,
    expectedActName: string = SmartContractsActionsDictionary.socialAction(),
    acc: string | null = null,
  ): void {
    const sampleOrganization = ContentOrganizationsGenerator.getFormFields();

    const expectedData = {
      acc: acc || accountFrom,
      actionJson: {
        interaction,
        data: {
          account_from: accountFrom,
          organization_id: organizationBlockchainId,
        },
      },
      actionData: {
        about: sampleOrganization.about,
        entity_images: {},
        blockchain_id: organizationBlockchainId,
        author_account_name: accountFrom,
      },
    };

    this.checkProcessedResponsePartAsObject(response, expectedData, expectedActName, createdAt);
  }

  public static checkCommentPushingResponse(
    response: any,
    interaction: string,
    accountFrom: string,
    contentId: string,
    parentContentId: string,
    entityNameFor: string,
    entityBlockchainIdFor: string,
    organizationBlockchainId: string | null = null,
    createdAt: string | null = null,
    expectedActName: string = SmartContractsActionsDictionary.socialAction(),
    acc: string | null = null,
  ): void {
    const content = ContentCommentsGenerator.getCommentInputFields();

    const data: any = {
      account_from: accountFrom,
      parent_content_id: parentContentId,
      content_id: contentId,
    };

    const actionData: any = {
      description: content.description,
      entity_images: content.entity_images,
      blockchain_id: contentId,
      entity_name_for: entityNameFor,
      entity_blockchain_id_for: entityBlockchainIdFor,
      author_account_name: accountFrom,
    };

    if (organizationBlockchainId) {
      data.organization_id_from = organizationBlockchainId;
      actionData.organization_blockchain_id = organizationBlockchainId;
    }

    const expectedData = {
      acc: acc || accountFrom,
      actionJson: {
        interaction,
        data,
      },
      actionData,
    };

    this.checkProcessedResponsePartAsObject(response, expectedData, expectedActName, createdAt);
  }

  public static checkRepostPushingResponse(
    response: any,
    accountFrom: string,
    contentId: string,
    parentContentId: string,
    createdAt: string | null = null,
    expectedActName: string = SmartContractsActionsDictionary.socialAction(),
    acc: string | null = null,
  ): void {
    const samplePost = ContentPostsGenerator.getDirectPostOrRepostInputFields();
    const interaction = InteractionsDictionary.createRepostFromAccount();

    const expectedData = {
      acc: acc || accountFrom,
      actionJson: {
        interaction,
        data: {
          account_from: accountFrom,
          content_id: contentId,
          parent_content_id: parentContentId,
        },
      },
      actionData: {
        description: samplePost.description,
        entity_images: {},
        entity_tags: [
          'winter',
          'summer',
        ],
        blockchain_id: contentId,
        entity_name_for: EntityNames.USERS,
        entity_blockchain_id_for: accountFrom,
        author_account_name: accountFrom,
      },
    };

    this.checkProcessedResponsePartAsObject(response, expectedData, expectedActName, createdAt);
  }

  public static checkPostPushingFromOrganizationResponse(
    response: any,
    accountNameFrom: string,
    interactionName: string,
    contentId: string,
    orgBlockchainId: string,
  ): void {
    const expectedData = {
      acc: accountNameFrom,
      action_json: `{\"interaction\":\"${interactionName}\",\"data\":{\"account_from\":\"${accountNameFrom}\",\"content_id\":\"${contentId}\",\"organization_id_from\":\"${orgBlockchainId}\"}}`,
      action_data: '{\"title\":\"Cool sample post\",\"description\":\"Cool sample post description #winter #summer\",\"leading_text\":\"\",\"entity_images\":{},\"entity_tags\":[\"winter\",\"summer\"],',
    };

    const expectedActName = SmartContractsActionsDictionary.socialAction();
    this.checkProcessedResponsePart(response, expectedData, expectedActName);
  }

  public static checkResendPostPushingFromUserResponse(
    response: any,
    acc: string,
    accountNameFrom: string,
    interactionName: string,
    blockchainId: string,
    createdAt: string,
  ): void {
    const samplePost = ContentPostsGenerator.getSamplePostInputFields();

    const expectedData = {
      acc,
      action_json: `{\"interaction\":\"${interactionName}\",\"data\":{\"account_from\":\"${accountNameFrom}\",\"content_id\":\"${blockchainId}\"}}`,
      // #task - some fields are hardcoded
      action_data: `{\"title\":\"${samplePost.title}\",\"description\":\"${samplePost.description}\",\"leading_text\":\"${samplePost.leading_text}\",\"entity_images\":{},\"entity_tags\":[\"winter\",\"summer\"],\"created_at\":\"${createdAt}\",\"blockchain_id\":\"${blockchainId}\",\"entity_name_for\":\"users     \",\"entity_blockchain_id_for\":\"${accountNameFrom}\",\"author_account_name\":\"${accountNameFrom}\"}`,
    };

    const expectedActName = SmartContractsActionsDictionary.historicalSocialAction();
    this.checkProcessedResponsePart(response, expectedData, expectedActName, createdAt);
  }

  public static checkResendPostPushingFromOrganization(
    response: any,
    acc: string,
    accountNameFrom: string,
    interactionName: string,
    blockchainId: string,
    orgBlockchainId: string,
    createdAt: string,
  ): void {
    const samplePost = ContentPostsGenerator.getSamplePostInputFields();

    const expectedData = {
      acc,
      action_json: `{\"interaction\":\"${interactionName}\",\"data\":{\"account_from\":\"${accountNameFrom}\",\"content_id\":\"${blockchainId}\",\"organization_id_from\":\"${orgBlockchainId}\"}}`,
      action_data: `{\"title\":\"${samplePost.title}\",\"description\":\"${samplePost.description}\",\"leading_text\":\"${samplePost.leading_text}\",\"entity_images\":{},\"entity_tags\":[\"winter\",\"summer\"],\"created_at\":\"${createdAt}\",\"organization_blockchain_id\":\"${orgBlockchainId}\",\"blockchain_id\":\"${blockchainId}\",\"entity_name_for\":\"org       \",\"entity_blockchain_id_for\":\"${orgBlockchainId}\",\"author_account_name\":\"${accountNameFrom}\"}`,
    };

    const expectedActName = SmartContractsActionsDictionary.historicalSocialAction();

    this.checkProcessedResponsePart(response, expectedData, expectedActName, createdAt);
  }

  private static checkProcessedResponsePart(
    response,
    expectedData,
    expectedActName: string,
    createdAt: string | null = null,
  ): void {
    const { action_traces } = response.processed;
    expect(action_traces.length).toBe(1);

    const { act } = action_traces[0];
    expect(act.name).toBe(expectedActName);

    const { data } = act;

    expect(data.acc).toBe(expectedData.acc);
    expect(data.action_json).toBe(expectedData.action_json);
    expect(data.action_data).toMatch(expectedData.action_data);

    if (createdAt !== null) {
      expect(data.timestamp).toBe(createdAt);
    }
  }

  private static checkProcessedResponsePartAsObject(
    response,
    expectedData,
    expectedActName: string,
    createdAt: string | null = null,
  ): void {
    const { action_traces } = response.processed;
    expect(action_traces.length).toBe(1);

    const { act } = action_traces[0];
    expect(act.name).toBe(expectedActName);

    const { data } = act;

    const actionJson = JSON.parse(data.action_json);
    const actionData = JSON.parse(data.action_data);

    expect(data.acc).toBe(expectedData.acc);
    expect(actionJson).toMatchObject(expectedData.actionJson);
    expect(actionData).toMatchObject(expectedData.actionData);

    if (createdAt !== null) {
      expect(data.timestamp).toBe(createdAt);
    }
  }
}

export = ContentChecker;
