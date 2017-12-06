"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = Object.setPrototypeOf ||
        ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
        function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
var __read = (this && this.__read) || function (o, n) {
    var m = typeof Symbol === "function" && o[Symbol.iterator];
    if (!m) return o;
    var i = m.call(o), r, ar = [], e;
    try {
        while ((n === void 0 || n-- > 0) && !(r = i.next()).done) ar.push(r.value);
    }
    catch (error) { e = { error: error }; }
    finally {
        try {
            if (r && !r.done && (m = i["return"])) m.call(i);
        }
        finally { if (e) throw e.error; }
    }
    return ar;
};
var __spread = (this && this.__spread) || function () {
    for (var ar = [], i = 0; i < arguments.length; i++) ar = ar.concat(__read(arguments[i]));
    return ar;
};
Object.defineProperty(exports, "__esModule", { value: true });
/**
 * @file TokenizingPredictor.ts
 * @desc A tokenizing predictor takes a input and position within that input,
 * it then splits the input into smaller chunks (using a tokenizer), isolates the
 * chunk around the indicated position and passes that to another predictor
 * to get corrections/completions relevant to that chunk.
 */
var AbstractPredictor_1 = require("../abstract/AbstractPredictor");
/**
 * @class TokenizingPredictor
 * @extends AbstractPredictor
 * @desc A TokenizingPredictor takes a input and position within that input,
 * it then splits the input into smaller chunks (using a tokenizer), isolates the
 * chunk around the indicated position and passes that to another predictor
 * to get corrections/completions relevant to that chunk.
 *
 * A standard example would be a TokenizingPredictor which takes a paragraph along with
 * a cursor position as it's input, and returns auto-corrections/completions for the
 * word closest to that cursor position.
 * @typeparam T The type for the input to the TokenizingPredictor.
 * It must have a length property.
 * @typeparam A The type for the tokens.
 * @typeparam V A type extending CursorPositionType which the childPredictor returns.
 * @typeparam P The type for the prior to be used by the childPredictor.
 */
var TokenizingPredictor = (function (_super) {
    __extends(TokenizingPredictor, _super);
    /**
     *
     * @param {SplitterType<T extends HasLengthType, A>} splitter A function which
     * splits (or tokenizes) the input, this will be used to isolate the chunk to be
     * sent to the child predictor.
     * @param {CombinerType<T extends HasLengthType, A>} combiner A function which
     * recombines chunks. It post-composing it with the splitter should yield the identity
     * function.
     * @param {AbstractPredictor<A, A, P, WeightedPrediction<A> & V>} childPredictor
     * An AbstractPredictor used to make auto-complete/correct predictions for the
     * chunk of input nearest the cursorPosition.
     */
    function TokenizingPredictor(splitter, combiner, childPredictor) {
        var _this = _super.call(this) || this;
        _this.splitter = splitter;
        _this.combiner = combiner;
        _this.childPredictor = childPredictor;
        return _this;
    }
    TokenizingPredictor.prototype.predict = function (prior, wrappedInput) {
        var _this = this;
        var suffix = this.splitter(wrappedInput.input);
        var prefix = [];
        var token = suffix.shift();
        while (token !== undefined) {
            if (this.combiner.apply(this, __spread(prefix, [token])).length >= wrappedInput.cursorPosition) {
                break;
            }
            prefix.push(token);
            token = suffix.shift();
        }
        if (token === undefined) {
            return Promise.resolve([]);
        }
        var resultsP = this.childPredictor.predict(prior, token);
        var contextifyResult = function (result) {
            var cursPos = _this.combiner.apply(_this, __spread(prefix, [result.prediction])).length
                - _this.combiner(result.prediction).length + result.cursorPosition;
            return Object.assign({}, result, {
                cursorPosition: cursPos,
                prediction: _this.combiner.apply(_this, __spread(prefix, [result.prediction], suffix)),
            });
        };
        return resultsP.then(function (results) { return (results.map(contextifyResult)); });
    };
    return TokenizingPredictor;
}(AbstractPredictor_1.default));
exports.default = TokenizingPredictor;
//# sourceMappingURL=TokenizingPredictor.js.map