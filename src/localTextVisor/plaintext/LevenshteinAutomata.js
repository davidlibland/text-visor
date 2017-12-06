"use strict";
/**
 * @file LevenshteinAutomata.ts
 * @desc An implementation of a levenstein automata.
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
var AbstractAutomata_1 = require("./AbstractAutomata");
var LevenshteinEditCostModule = (function () {
    function LevenshteinEditCostModule() {
    }
    return LevenshteinEditCostModule;
}());
exports.LevenshteinEditCostModule = LevenshteinEditCostModule;
var FlatLevenshteinCostModule = (function (_super) {
    __extends(FlatLevenshteinCostModule, _super);
    function FlatLevenshteinCostModule(rejectCostThreshold, flatWeight) {
        if (flatWeight === void 0) { flatWeight = 1; }
        var _this = _super.call(this) || this;
        _this.rejectCostThreshold = rejectCostThreshold;
        _this.flatWeight = flatWeight;
        return _this;
    }
    /**
     * @public
     * @method swapCost
     * @desc this is the cost of swapping alpha for beta; must be non-negative.
     * @param {A} alpha
     * @param {A} beta
     * @returns {number}
     */
    FlatLevenshteinCostModule.prototype.swapCost = function (alpha, beta) {
        return alpha === beta ? 0 : this.flatWeight;
    };
    /**
     * @public
     * @method deleteCost
     * @desc this is the cost of deleting alpha; must be non-negative.
     * @param {A} alpha
     * @returns {number}
     */
    FlatLevenshteinCostModule.prototype.deleteCost = function (alpha) {
        return this.flatWeight;
    };
    /**
     * @public
     * @method insertCost
     * @desc this is the cost of inserting alpha; must be non-negative.
     * @param {A} alpha
     * @returns {number}
     */
    FlatLevenshteinCostModule.prototype.insertCost = function (alpha) {
        return this.flatWeight;
    };
    /**
     * @public
     * @method editCostAcceptor
     * @desc This returns true if an editCost is acceptable at a given step.
     * @param {number} editCost
     * @param {number} step
     * @returns {boolean}
     */
    FlatLevenshteinCostModule.prototype.editCostAcceptor = function (editCost, step) {
        return (editCost < this.rejectCostThreshold);
    };
    return FlatLevenshteinCostModule;
}(LevenshteinEditCostModule));
exports.FlatLevenshteinCostModule = FlatLevenshteinCostModule;
var FlatLevenshteinRelativeCostModule = (function (_super) {
    __extends(FlatLevenshteinRelativeCostModule, _super);
    function FlatLevenshteinRelativeCostModule(relativeAcceptanceThreshold, rejectCostThreshold, flatWeight) {
        if (flatWeight === void 0) { flatWeight = 1; }
        var _this = _super.call(this, rejectCostThreshold, flatWeight) || this;
        _this.relativeAcceptanceThreshold = relativeAcceptanceThreshold;
        return _this;
    }
    /**
     * @public
     * @method editCostAcceptor
     * @desc This returns true if an editCost is acceptable at a given step.
     * @param {number} editCost
     * @param {number} step
     * @returns {boolean}
     */
    FlatLevenshteinRelativeCostModule.prototype.editCostAcceptor = function (editCost, step) {
        return (editCost < this.rejectCostThreshold) && (editCost <= this.relativeAcceptanceThreshold * step);
    };
    return FlatLevenshteinRelativeCostModule;
}(FlatLevenshteinCostModule));
exports.FlatLevenshteinRelativeCostModule = FlatLevenshteinRelativeCostModule;
var LevenshteinAutomaton = (function (_super) {
    __extends(LevenshteinAutomaton, _super);
    function LevenshteinAutomaton(str, costModule) {
        var _this = _super.call(this) || this;
        _this.str = str;
        _this.costModule = costModule;
        _this.stateIdLookup = {};
        _this.hiddenStateLookup = [];
        _this.editCostLookup = [];
        _this.editCostLowerBoundLookup = [];
        _this.stateIdTransitions = [];
        var initialHiddenState = str.reduce(function (accState, char) {
            var prevValue = accState[accState.length - 1];
            costModule.insertCost(char);
            return __spread(accState, [
                Math.min(prevValue + costModule.deleteCost(char), _this.costModule.rejectCostThreshold)
            ]);
        }, [0]);
        var initialStateId = _this.getStateId(initialHiddenState);
        var prefixEditCost = _this.costModule.editCostAcceptor(initialHiddenState[initialHiddenState.length - 1], 0) ?
            { editCost: initialHiddenState[initialHiddenState.length - 1], step: 0 } : undefined;
        _this.initialState = {
            acceptedPrefixData: prefixEditCost,
            stateId: initialStateId,
            step: 0,
        };
        return _this;
    }
    LevenshteinAutomaton.prototype.start = function () {
        return this.initialState;
    };
    LevenshteinAutomaton.prototype.step = function (sourceState, nextChar) {
        var sourceStateId = sourceState.stateId;
        if (sourceStateId >= this.hiddenStateLookup.length) {
            console.warn("The State " + sourceStateId + " has never been seen before." +
                "Pass only allowed states to the automaton's step method.");
            return sourceState;
        }
        var targetStateId = this.stateIdTransitions[sourceStateId].get(nextChar);
        var targetEditCost;
        if (targetStateId !== undefined) {
            targetEditCost = this.editCostLookup[targetStateId];
        }
        else {
            var sourceHiddenState = this.hiddenStateLookup[sourceStateId];
            var targetHiddenState = new Array(sourceHiddenState.length);
            targetHiddenState[0] = Math.min(sourceHiddenState[0] + this.costModule.insertCost(nextChar), this.costModule.rejectCostThreshold);
            for (var i = 0; i < sourceHiddenState.length - 1; i++) {
                targetHiddenState[i + 1] = (Math.min(targetHiddenState[i] + this.costModule.deleteCost(this.str[i]), sourceHiddenState[i] + this.costModule.swapCost(this.str[i], nextChar), sourceHiddenState[i + 1] + this.costModule.insertCost(nextChar), this.costModule.rejectCostThreshold));
            }
            targetStateId = this.getStateId(targetHiddenState);
            targetEditCost = targetHiddenState[targetHiddenState.length - 1];
            this.stateIdTransitions[sourceStateId].set(nextChar, targetStateId);
        }
        var targetStep = sourceState.step + 1;
        var targetLAStateProposal = {
            acceptedPrefixData: sourceState.acceptedPrefixData,
            stateId: targetStateId,
            step: targetStep,
        };
        var targetStateAccepted = this.costModule.editCostAcceptor(targetEditCost, targetStep);
        if (targetStateAccepted) {
            var sourceStateAccepted = sourceState.acceptedPrefixData !== undefined;
            var targetStateCloser = sourceStateAccepted ?
                targetEditCost <= sourceState.acceptedPrefixData.editCost : true;
            if (targetStateCloser) {
                targetLAStateProposal.acceptedPrefixData = {
                    editCost: targetEditCost,
                    step: targetStep,
                };
            }
        }
        return targetLAStateProposal;
    };
    LevenshteinAutomaton.prototype.status = function (state) {
        if (state.stateId >= this.hiddenStateLookup.length) {
            console.warn("The State " + state.stateId + " has never been seen before." +
                "Pass only allowed states to the automaton's step method.");
            return {
                editCost: this.costModule.rejectCostThreshold,
                prefixEditCost: this.costModule.rejectCostThreshold,
                status: AbstractAutomata_1.STATUS_TYPE.REJECT,
                step: state.step,
            };
        }
        if (state.acceptedPrefixData !== undefined) {
            return {
                editCost: this.editCostLookup[state.stateId],
                prefixEditCost: state.acceptedPrefixData.editCost,
                status: AbstractAutomata_1.STATUS_TYPE.ACCEPT,
                step: state.acceptedPrefixData.step,
            };
        }
        else if (this.costModule.editCostAcceptor(this.editCostLowerBoundLookup[state.stateId], state.step)) {
            var editCost = this.editCostLookup[state.stateId];
            return {
                editCost: editCost,
                prefixEditCost: editCost,
                status: AbstractAutomata_1.STATUS_TYPE.UNKNOWN,
                step: state.step,
            };
        }
        else {
            return {
                editCost: this.editCostLookup[state.stateId],
                prefixEditCost: this.costModule.rejectCostThreshold,
                status: AbstractAutomata_1.STATUS_TYPE.REJECT,
                step: state.step,
            };
        }
    };
    LevenshteinAutomaton.prototype.getStateId = function (state) {
        var stateId = this.stateIdLookup[state.toString()];
        if (stateId === undefined) {
            var newStateId = this.hiddenStateLookup.length;
            this.stateIdLookup[state.toString()] = newStateId;
            this.hiddenStateLookup.push(state);
            this.editCostLookup.push(state[state.length - 1]);
            this.editCostLowerBoundLookup.push(Math.min.apply(Math, __spread(state)));
            this.stateIdTransitions.push(new Map());
            return newStateId;
        }
        return stateId;
    };
    return LevenshteinAutomaton;
}(AbstractAutomata_1.AbstractAutomaton));
exports.LevenshteinAutomaton = LevenshteinAutomaton;
//# sourceMappingURL=LevenshteinAutomata.js.map