export class PriceMachine {
    private _numOfPairOut: number;
    private _equilibrium: number;
    private _priceChangeSpeed: number;
    constructor(initialEq: number, priceChangeSpeed: number) {
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
    private normalSample(mu: number, std: number): number {
        let u = 0, v = 0;
        while (u === 0) u = Math.random(); //Converting [0,1) to (0,1)
        while (v === 0) v = Math.random();
        return std * Math.sqrt(-2.0 * Math.log(u)) * Math.cos(2.0 * Math.PI * v) + mu;
    }
    public genAssessedVal(needCount: boolean): number {
        if (this._numOfPairOut > 0 && this._numOfPairOut % this._priceChangeSpeed == 0) {
            // random walking equilibrium
            this._equilibrium *= this.normalSample(1, 0.001);
            this._numOfPairOut++;
        } else if (needCount) this._numOfPairOut++;
        return this._equilibrium * this.normalSample(1, 0.033);
    }
}