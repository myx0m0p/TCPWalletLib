const ACTIVITY__FOLLOW = 1;
const ACTIVITY__UNFOLLOW = 5;

const ACTIVITY__UPVOTE = 2; // Like
const ACTIVITY__DOWNVOTE = 4; // Dislike

const ACTIVITY_JOIN = 3;

const ACTIVITY__INVITED_TO_ORG_TEAM = 20;

const ACTIVITY__TRUST = 30;
const ACTIVITY__UNTRUST = 31;

class InteractionTypesDictionary {
  /**
     *
     * @returns {number}
     */
  static getTrustId() {
    return ACTIVITY__TRUST;
  }

  /**
     *
     * @returns {number}
     */
  static getUntrustId() {
    return ACTIVITY__UNTRUST;
  }

  /**
     *
     * @returns {number}
     */
  static getFollowId() {
    return ACTIVITY__FOLLOW;
  }

  /**
     *
     * @returns {number}
     */
  static getUpvoteId() {
    return ACTIVITY__UPVOTE;
  }

  /**
     *
     * @returns {number}
     */
  static getJoinId() {
    return ACTIVITY_JOIN;
  }

  /**
     *
     * @returns {number}
     */
  static getDownvoteId() {
    return ACTIVITY__DOWNVOTE;
  }

  /**
     *
     * @returns {number}
     */
  static getUnfollowId() {
    return ACTIVITY__UNFOLLOW;
  }

  /**
     *
     * @returns {number}
     */
  static getOrgTeamInvitation() {
    return ACTIVITY__INVITED_TO_ORG_TEAM;
  }

  /**
     *
     * @param {Object} model
     * @return {boolean}
     */
  static isJoinActivity(model) {
    return model.activity_type_id === this.getJoinId();
  }

  static isUpvoteActivity(model) {
    return model.activity_type_id === this.getUpvoteId();
  }

  static isFollowActivity(model) {
    return model.activity_type_id === this.getFollowId();
  }

  /**
     *
     * @param {number} activityTypeId
     * @returns {number}
     */
  static getOppositeFollowActivityTypeId(activityTypeId) {
    if (activityTypeId === this.getFollowId()) {
      return this.getUnfollowId();
    }

    return this.getFollowId();
  }

  /**
     *
     * @param {number} activityTypeId
     * @returns {boolean}
     */
  static isOppositeActivityRequired(activityTypeId) {
    const required = [
      this.getUnfollowId(),
    ];

    return required.includes(activityTypeId);
  }

  /**
     *
     * @param {Object} model
     * @returns {boolean}
     */
  static isDownvoteActivity(model) {
    return model.activity_type_id === this.getDownvoteId();
  }
}

export = InteractionTypesDictionary;
