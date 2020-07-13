"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.symmetricDifference = void 0;
exports.symmetricDifference = (arrayA, arrayB) => arrayA
    .filter((x) => !arrayB.includes(x))
    .concat(arrayB.filter((x) => !arrayA.includes(x)));
