export class Stock {
    constructor(cost, inDay) {
        this._buyInCost = cost;
        this._buyInDay = inDay;
    }
    get buyInCost() {
        return this._buyInCost;
    }
    set buyInCost(cost) {
        this._buyInCost = cost;
    }
    get buyInDay() {
        return this._buyInDay;
    }
    set buyInDay(day) {
        this._buyInDay = day;
    }
}
