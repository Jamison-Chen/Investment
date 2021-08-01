import { MyMath } from "./myMath.js";
export class PriceMachine {
    constructor(initialEq, priceChangeSpeed) {
        this._numOfPairOut = 0;
        this._equilibrium = initialEq;
        this._priceChangeSpeed = priceChangeSpeed;
    }
    get numOfPairOut() {
        return this._numOfPairOut;
    }
    set numOfPairOut(num) {
        this._numOfPairOut = num;
    }
    get equilibrium() {
        return this._equilibrium;
    }
    genAssessedVal(needCount) {
        if (this._numOfPairOut > 0 && this._numOfPairOut % this._priceChangeSpeed === 0) {
            // random walking equilibrium
            this._equilibrium *= MyMath.normalSample(1, 0.001);
            this._numOfPairOut++;
        }
        else if (needCount)
            this._numOfPairOut++;
        return this._equilibrium * MyMath.normalSample(1, 0.033);
    }
}
