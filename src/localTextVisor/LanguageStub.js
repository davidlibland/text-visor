"use strict";
/**
 * @file LanguageStub.ts
 * @desc A minimal stub for the language model.
 */
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
Object.defineProperty(exports, "__esModule", { value: true });
var AbstractPredictor_1 = require("./abstract/AbstractPredictor");
/**
 * @class MapPredictor
 * @desc given a map, this applies it to every input to yield a single prediction.
 * @typeparam S the type of the input to the predictor
 * @typeparam T the type of the prediction.
 */
var MapPredictor = (function (_super) {
    __extends(MapPredictor, _super);
    /**
     * @constructor
     * @param {(S) => T} map this map is applied to the input and it's return value is
     * taken as the prediction.
     */
    function MapPredictor(map) {
        var _this = _super.call(this) || this;
        _this.map = map;
        return _this;
    }
    MapPredictor.prototype.predict = function (prior, input) {
        return Promise.resolve([{ weight: 1, prediction: this.map(input) }]);
    };
    return MapPredictor;
}(AbstractPredictor_1.default));
exports.default = MapPredictor;
//# sourceMappingURL=LanguageStub.js.map