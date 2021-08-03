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
    private _initialCash: number;
    private _cashOwning: number;
    private _stockHolding: Stock[];
    private _initialHolding: number;
    private _initialTotalAsset: number;
    private _tradeAmount: number;
    private _strategy: Strategy;
    private _maxPayable: undefined | number;
    private _minSellable: undefined | number;
    private _bidPrice: undefined | number;
    private _askPrice: undefined | number;
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
    public constructor(aDiv: HTMLElement, strayegySetting: any, initCash: number, stockHolding: Stock[]) {
        this.divControlled = aDiv;
        this._strategySetting = strayegySetting;
        this._aggressiveness = 0;
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
        this._bidPrice = undefined;
        this._askPrice = undefined;
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
        if (strategyName === "ValueFollower") return new ValueFollower(strategyName);
        else if (strategyName === "PriceChaser") return new PriceChaser(strategyName);
        else if (strategyName === "BHmixGrid") return new BHmixGrid(strategyName);
        else if (strategyName === "GridConstRatio") return new GridConstRatio(strategyName);
        else if (strategyName === "Chicken") return new Chicken(strategyName);
        else throw "Strategy undefined.";
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
            const qd = strategyResult["buyQ"];
            const qs = strategyResult["sellQ"];
            this._maxPayable = strategyResult["buyP"];
            this._minSellable = strategyResult["sellP"];
            this.bid();
            this.ask();
            if (this._bidPrice !== undefined && this._askPrice !== undefined && this._today !== undefined) {
                this._orderSetToday = {
                    "buyOrder": new Order("buy", this._today, this._bidPrice, qd),
                    "sellOrder": new Order("sell", this._today, this._askPrice, qs)
                }
                return this._orderSetToday;
            } else throw "_bidPrice/_askPrice/_today is undefined, try updateMktInfo() first.";
        } else throw "market info not sufficient when making order";
    }
    private initBidPrice(): void {
        this._aggressiveness = MyMath.oneTailNormalSample(this._aggressiveness, 0.25, "right");
        if (this._maxPayable !== undefined) {
            this._bidPrice = this._maxPayable * Math.max(0, (1 - this._aggressiveness));
        } else throw "The _maxPayable is still undefined.";
    }
    private bid(): void {
        if (this._maxPayable !== undefined && this._bidPrice !== undefined) {
            let delta = this._maxPayable - this._bidPrice;
            if (delta > 0) {
                this._bidPrice += Math.min(delta, delta * MyMath.oneTailNormalSample(0, 0.5, "right"));
                this._aggressiveness = 1 - this._bidPrice / this._maxPayable;
            } else if (delta < 0) this.initBidPrice();
        } else this.initBidPrice();
    }
    private initAskPrice(): void {
        this._aggressiveness = MyMath.oneTailNormalSample(this._aggressiveness, 0.25, "right");
        if (this._minSellable !== undefined) this._askPrice = this._minSellable * (1 + this._aggressiveness);
        else throw "The _minSellable is still undefined.";
    }
    private ask(): void {
        if (this._minSellable !== undefined && this._askPrice !== undefined) {
            let delta = this._askPrice - this._minSellable;
            if (delta > 0) {
                this._askPrice -= Math.min(delta, delta * MyMath.oneTailNormalSample(0, 0.5, "right"));
                this._aggressiveness = this._askPrice / this._minSellable - 1;
            } else if (delta < 0) this.initAskPrice();
        } else this.initAskPrice();
    }
    public buyIn(stockIn: Stock[], dealPrice: number, today: number): void {
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
        // Use FIFO
        this._stockHolding.sort((a: Stock, b: Stock) => a.buyInDay - b.buyInDay);
        let stockOut: Stock[] = this._stockHolding.splice(0, qOut);
        this._cashOwning += qOut * dealPrice;
        this._tradeAmount += qOut;
        return stockOut;
    }
}