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
    normalSample(mu, std) {
        let u = 0, v = 0;
        while (u === 0)
            u = Math.random(); //Converting [0,1) to (0,1)
        while (v === 0)
            v = Math.random();
        return std * Math.sqrt(-2.0 * Math.log(u)) * Math.cos(2.0 * Math.PI * v) + mu;
    }
    genAssessedVal(needCount) {
        if (this._numOfPairOut > 0 && this._numOfPairOut % this._priceChangeSpeed == 0) {
            // random walking equilibrium
            this._equilibrium *= this.normalSample(1, 0.001);
            this._numOfPairOut++;
        }
        else if (needCount)
            this._numOfPairOut++;
        return this._equilibrium * this.normalSample(1, 0.033);
    }
}
