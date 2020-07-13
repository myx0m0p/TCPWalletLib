import { CheckManyObjectsOptionsDto, ObjectInterfaceRulesDto } from './interfaces/options-interfaces';

const _ = require('lodash');

require('jest-expect-message');

class CommonChecker {
  public static expectIsNotEmptyArray(array: any[]): void {
    this.expectNotEmpty(array);

    expect(Array.isArray(array)).toBeTruthy();

    expect(array.length).toBeGreaterThan(0);
  }

  public static expectNotEmpty(object: any) {
    expect(_.isEmpty(object)).toBeFalsy();
  }

  // eslint-disable-next-line sonarjs/cognitive-complexity
  public static checkManyObjectsInterface(
    manyActualObjects: any,
    objectInterfaceRules: ObjectInterfaceRulesDto,
    options: CheckManyObjectsOptionsDto,
  ): void {
    expect(typeof manyActualObjects).toBe('object');
    expect(Array.isArray(manyActualObjects)).toBeFalsy();

    this.expectNotEmpty(manyActualObjects);

    for (const actualKey in manyActualObjects) {
      if (!manyActualObjects.hasOwnProperty(actualKey)) {
        continue;
      }

      const oneObject = manyActualObjects[actualKey];

      if (options.exactKeysAmount) {
        expect(Object.keys(oneObject).sort()).toEqual(Object.keys(objectInterfaceRules).sort());
      }

      expect(actualKey).toBe(oneObject[options.keyIs]);
      for (const key in objectInterfaceRules) {
        if (!objectInterfaceRules.hasOwnProperty(key)) {
          continue;
        }

        switch (objectInterfaceRules[key].type) {
          case 'number':
            expect(oneObject[key]).toBeGreaterThanOrEqual(objectInterfaceRules[key].length);
            expect(Number.isFinite(oneObject[key])).toBeTruthy();
            // @ts-ignore
            expect(typeof oneObject[key], `Wrong type of key ${key}. Object: ${JSON.stringify(oneObject)}`)
              .toBe(objectInterfaceRules[key].type);
            break;
          case 'string':
            expect(oneObject[key].length).toBeGreaterThanOrEqual(objectInterfaceRules[key].length);
            // @ts-ignore
            expect(typeof oneObject[key], `Wrong type of key ${key}. Object: ${JSON.stringify(oneObject)}`)
              .toBe(objectInterfaceRules[key].type);
            break;
          case 'string_array':
            expect(oneObject[key].length).toBeGreaterThanOrEqual(objectInterfaceRules[key].length);
            expect(Array.isArray(oneObject[key])).toBeTruthy();
            break;
          default:
            throw new TypeError(`Unsupported expected type: ${objectInterfaceRules[key].type}`);
        }

        if (typeof objectInterfaceRules[key].value !== 'undefined') {
          expect(oneObject[key]).toBe(objectInterfaceRules[key].value);
        }
      }
    }
  }
}

export = CommonChecker;
