"use strict";
/**
 * @file AbstractValueDifferential.ts
 * @desc Abstractions for value differentials, which measure the value of a
 * correct prediction of an auto-completion/correction to a given input. For example
 * predictions which correct a number of typos may be more considered more
 * valuable than predictions which add a single trailing letter.
 */
Object.defineProperty(exports, "__esModule", { value: true });
/**
 * @desc An abstract class, subclasses of which measure the value of a
 * correct prediction of an auto-completion/correction to a given input. For example
 * predictions which correct a number of typos may be more considered more
 * valuable than predictions which add a single trailing letter.
 * @typeparam S the type of the input. Defaults to string.
 * @typeparam T the type of the prediction. Defaults to string.
 */
class AbstractValueDifferential {
}
exports.default = AbstractValueDifferential;
//# sourceMappingURL=AbstractValueDifferential.js.map