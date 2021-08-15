import { Strategy, BHmixGrid, ValueFollower, PriceChaser, GridConstRatio, Chicken } from "./strategy.js";
import { Stock } from "./stock.js";
import { Order, OrderSet } from "./order.js";
import { MyMath } from "./myMath.js";
export class Individual {
    // attributes about the appearance
    public divControlled: HTMLElement;
    // attributes about the individual
    private _strategySetting: any;
    private _aggressiveness: number;
    private _aggressivenessChangable: boolean;
    private _initialCash: number;
    private _cashOwning: number;
    private _stockHolding: Stock[];
    private _initialHolding: number;
    private _initialTotalAsset: number;
    private _tradeAmount: number;
    private _strategy: Strategy;
    private _maxPayable: undefined | number;
    private _minSellable: undefined | number;
    private _orderSetToday: OrderSet;
    // daily market info
    private _today: undefined | number;
    private _valueAssessed: undefined | number;
    private _mktPriceAcquired: undefined | number;
    // others
    private _strategyColor: any = {
        "ValueFollower": "#D00",
        "PriceChaser": "#000",
        "BHmixGrid": "#0A0",
        "GridConstRatio": "#00A",
        "Chicken": "#A0A"
    };
    private _allStrategies: any = { ValueFollower, PriceChaser, BHmixGrid, GridConstRatio, Chicken };
    public constructor(aDiv: HTMLElement, strayegySetting: any, initCash: number, stockHolding: Stock[], aggr: number = Math.random(), aggrChangeable: boolean = true) {
        this.divControlled = aDiv;
        this._strategySetting = strayegySetting;
        this._aggressiveness = aggr;
        this._aggressivenessChangable = aggrChangeable;
        this._initialCash = initCash;
        this._cashOwning = initCash;
        this._stockHolding = stockHolding;
        this._initialHolding = stockHolding.length;
        this._initialTotalAsset = this.calcTotalAsset();
        this._tradeAmount = 0;
        this._strategy = this.chooseStrayegy(strayegySetting.name);
        this._today = undefined;
        this._valueAssessed = undefined;
        this._mktPriceAcquired = undefined;
        this._maxPayable = undefined;
        this._minSellable = undefined;
        this._orderSetToday = {
            "buyOrder": new Order("buy", NaN, NaN, NaN),
            "sellOrder": new Order("sell", NaN, NaN, NaN)
        };
    }
    public get orderSetToday(): OrderSet {
        return this._orderSetToday;
    }
    public get initialCash(): number {
        return this._initialCash;
    }
    public get cashOwning(): number {
        return this._cashOwning;
    }
    public get stockHolding(): Stock[] {
        return this._stockHolding;
    }
    public get initialHolding(): number {
        return this._initialHolding;
    }
    public get initialTotalAsset(): number {
        return this._initialTotalAsset;
    }
    public get tradeAmount(): number {
        return this._tradeAmount;
    }
    public calcReturn(stockPrice: number): number {
        return Math.round((this.calcTotalAsset(stockPrice) / this._initialTotalAsset - 1) * 1000) / 1000;
    }
    public calcTotalAsset(stockPrice: number | undefined = undefined): number {
        return this._cashOwning + this.calcStockMktVal(stockPrice);
    }
    public calcStockMktVal(stockPrice: number | undefined = undefined): number {
        let totalStockVal = 0;
        for (let each of this._stockHolding) {
            if (stockPrice !== undefined) totalStockVal += stockPrice;
            else totalStockVal += each.buyInCost;
        }
        return totalStockVal;
    }
    private chooseStrayegy(strategyName: string): Strategy {
        this.divControlled.style.backgroundColor = this._strategyColor[strategyName];
        try {
            return new this._allStrategies[strategyName]();
        } catch {
            throw "Strategy undefined.";
        }
    }
    public updateMktInfo(today: number, valueToday: number, priceToday: number, dailyEconGrowthRate: number): void {
        this._today = today;
        this._valueAssessed = valueToday;
        this._mktPriceAcquired = priceToday;
        this._cashOwning += (this._initialCash * dailyEconGrowthRate);
    }
    public makeOrder(): OrderSet {
        // The prices inthe orders that _strategy made is min-sellable and max-payable (i.e. just for reference)
        // The individuals need to bid themselves
        if (this._today !== undefined && this._mktPriceAcquired !== undefined && this._valueAssessed !== undefined) {
            let strategyResult = this._strategy.followStrategy(
                this._today,
                this._cashOwning,
                this._stockHolding,
                this._valueAssessed,
                this._mktPriceAcquired,
                this._strategySetting.params
            );
            let qd = strategyResult["buyQ"];
            let qs = strategyResult["sellQ"];
            this._maxPayable = strategyResult["buyP"];
            this._minSellable = strategyResult["sellP"];
            let bidPrice: number = this.bid();
            let askPrice: number = this.ask();
            this.decreaseAggressiveness();
            if (this._today !== undefined) {
                this._orderSetToday = {
                    "buyOrder": new Order("buy", this._today, bidPrice, qd),
                    "sellOrder": new Order("sell", this._today, askPrice, qs)
                }
                return this._orderSetToday;
            } else throw "_today is undefined, try updateMktInfo() first.";
        } else throw "market info not sufficient when making order";
    }
    private bid(): number {
        if (this._maxPayable !== undefined) {
            return this._maxPayable * (1 - this._aggressiveness);
        } else throw "The _maxPayable is undefined.";
    }
    private ask(): number {
        if (this._minSellable !== undefined) {
            return this._minSellable * (1 / (1 - this._aggressiveness + Number.EPSILON));
        } else throw "The _minSellable is undefined.";
    }
    public buyIn(stockIn: Stock[], dealPrice: number, today: number): void {
        this.increaseAggressiveness();
        // revise stock info
        for (let eachStock of stockIn) {
            eachStock.buyInCost = dealPrice;
            eachStock.buyInDay = today;
        }
        this._stockHolding = this._stockHolding.concat(stockIn);
        this._cashOwning -= stockIn.length * dealPrice;
        this._tradeAmount += stockIn.length;
    }
    public sellOut(qOut: number, dealPrice: number): Stock[] {
        this.increaseAggressiveness();
        // Use FIFO
        this._stockHolding.sort((a: Stock, b: Stock) => a.buyInDay - b.buyInDay);
        let stockOut: Stock[] = this._stockHolding.splice(0, qOut);
        this._cashOwning += qOut * dealPrice;
        this._tradeAmount += qOut;
        return stockOut;
    }
    private decreaseAggressiveness(): void {
        if (this._aggressivenessChangable) {
            this._aggressiveness += Math.max(-1 * this._aggressiveness,
                MyMath.oneTailNormalSample(0, this._aggressiveness / 3, "left"));
        }
    }
    private increaseAggressiveness(): void {
        if (this._aggressivenessChangable) {
            this._aggressiveness += Math.min(1 - this._aggressiveness,
                MyMath.oneTailNormalSample(0, (1 - this._aggressiveness) / 3, "right"));
        }
    }
}