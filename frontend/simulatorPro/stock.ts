export class Stock {
    private _buyInCost: number;
    private _buyInDay: number;
    constructor(cost: number, inDay: number) {
        this._buyInCost = cost;
        this._buyInDay = inDay;
    }
    public get buyInCost(): number {
        return this._buyInCost;
    }
    public set buyInCost(cost: number) {
        this._buyInCost = cost;
    }
    public get buyInDay(): number {
        return this._buyInDay;
    }
    public set buyInDay(day: number) {
        this._buyInDay = day;
    }
}