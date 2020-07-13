"use strict";
const tcp_common_lib_1 = require("@myx0m0p/tcp-common-lib");
const moment = require("moment");
class ContentHelper {
    static getCommentParentEntityName(isReply) {
        return isReply ? tcp_common_lib_1.EntityNames.COMMENTS : tcp_common_lib_1.EntityNames.POSTS;
    }
    static getDateTimeFields(createdAt, updatedAt) {
        const data = {};
        if (createdAt) {
            data.created_at = moment().utc().format();
        }
        if (updatedAt) {
            data.updated_at = moment().utc().format();
        }
        return data;
    }
    static getMetadata(accountNameFrom, contentId, extraMetaData = {}) {
        return Object.assign({ account_from: accountNameFrom, content_id: contentId }, extraMetaData);
    }
    static checkCreatedAt(content) {
        if (!content.created_at) {
            throw new TypeError('created_at must exist inside a content');
        }
        if (!content.created_at.includes('Z')) {
            throw new TypeError('created_at be an UTC string');
        }
        const momentDate = moment(content.created_at);
        if (!momentDate.isValid()) {
            throw new TypeError(`Provided created_at value is not a valid datetime string: ${content.created_at}`);
        }
    }
    static getContentWithExtraFields(givenContent, contentId, entityNameFor, entityBlockchainIdFor, authorAccountName) {
        const data = {
            blockchain_id: contentId,
            entity_name_for: entityNameFor,
            entity_blockchain_id_for: entityBlockchainIdFor,
            author_account_name: authorAccountName,
        };
        return Object.assign(Object.assign({}, givenContent), data);
    }
}
module.exports = ContentHelper;
