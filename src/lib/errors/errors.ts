/* eslint-disable max-classes-per-file */
class AppError extends Error {
  public status;

  constructor(message, status) {
    // noinspection JSCheckFunctionSignatures
    super(message);

    this.name = this.constructor.name;
    // noinspection JSUnresolvedFunction
    // Error.captureStackTrace(this, this.constructor); // #task - research and enable. Does not work in Safari

    // noinspection JSUnusedGlobalSymbols
    this.status = status;
  }
}

class BadRequestError extends Error {
  public status;

  constructor(fieldsAndMessages) {
    if (typeof fieldsAndMessages === 'string') {
      fieldsAndMessages = [{
        field:    'general',
        message:  fieldsAndMessages,
      }];
    }

    const message = {
      errors: fieldsAndMessages,
    };

    // noinspection JSCheckFunctionSignatures
    super(JSON.stringify(message));

    this.name = this.constructor.name;
    // noinspection JSUnresolvedFunction
    // Error.captureStackTrace(this, this.constructor); // #task - research and enable. Does not work in Safari

    // noinspection JSUnusedGlobalSymbols
    this.status = 400;
  }
}

export {
  AppError,
  BadRequestError,
};
