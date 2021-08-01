import { MyMath } from "./myMath.js";
export class PriceMachine {
    private _numOfPairOut: number;
    private _equilibrium: number;
    private _priceChangeSpeed: number;
    public constructor(initialEq: number, priceChangeSpeed: number) {
        this._numOfPairOut = 0;
        this._equilibrium = initialEq;
        this._priceChangeSpeed = priceChangeSpeed;
    }
    public get numOfPairOut(): number {
        return this._numOfPairOut;
    }
    public set numOfPairOut(num: number) {
        this._numOfPairOut = num;
    }
    public get equilibrium(): number {
        return this._equilibrium;
    }
    public genAssessedVal(needCount: boolean): number {
        if (this._numOfPairOut > 0 && this._numOfPairOut % this._priceChangeSpeed === 0) {
            // random walking equilibrium
            this._equilibrium *= MyMath.normalSample(1, 0.001);
            this._numOfPairOut++;
        } else if (needCount) this._numOfPairOut++;
        return this._equilibrium * MyMath.normalSample(1, 0.033);
    }
}