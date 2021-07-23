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
    private _orderToday: undefined | OrderSet;
    private _maxPayable: undefined | number;
    private _minSellable: undefined | number;
    private _bidPrice: undefined | number;
    private _askPrice: undefined | number;
    // daily market info
    private _today: undefined | number;
    private _valueAssessed: undefined | number;
    private _mktPriceAcquired: undefined | number;

    constructor(aDiv: HTMLElement, name: string, strayegySetting: any, initCash: number, stockHolding: Stock[]) {
        this.divControlled = aDiv;
        this._strategySetting = strayegySetting;
        this._aggressiveness = 0;
        this._initialCash = initCash;
        this._cashOwning = initCash;
        this._stockHolding = stockHolding;
        this._initialHolding = stockHolding.length;
        this._initialTotalAsset = this.calcTotalAsset();
        this._tradeAmount = 0;
        this._strategy = this.chooseStrayegy(strayegySetting);
        this._today = undefined;
        this._valueAssessed = undefined;
        this._mktPriceAcquired = undefined;
        this._orderToday = undefined;
        this._maxPayable = undefined;
        this._minSellable = undefined;
        this._bidPrice = undefined;
        this._askPrice = undefined;
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
    public get orderToday(): OrderSet | undefined {
        return this._orderToday;
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
    protected chooseStrayegy(setting: any): Strategy {
        if (setting.name === "ValueFollower") {
            this.divControlled.style.backgroundColor = "#D00";
            return new ValueFollower(setting.name, this);
        } else if (setting.name === "PriceChaser") {
            this.divControlled.style.backgroundColor = "#000";
            return new PriceChaser(setting.name, this);
        } else if (setting.name === "BHmixGrid") {
            this.divControlled.style.backgroundColor = "#0A0";
            return new BHmixGrid(setting.name, this);
        } else if (setting.name === "GridConstRatio") {
            this.divControlled.style.backgroundColor = "#00A";
            return new GridConstRatio(setting.name, this);
        } else if (setting.name === "Chicken") {
            this.divControlled.style.backgroundColor = "#A0A";
            return new Chicken(setting.name, this);
        }
        else throw "Strategy undefined.";
    }
    public updateMktInfo(today: number, valueToday: number, priceToday: number): void {
        this._today = today;
        this._valueAssessed = valueToday;
        this._mktPriceAcquired = priceToday;
    }
    public makeOrder(): void {
        // The prices inthe orders that _strategy made is min-sellable and max-payable (i.e. just for reference)
        // The individuals need to bid themselves
        if (this._today !== undefined && this._mktPriceAcquired !== undefined && this._valueAssessed !== undefined) {
            let orderSetForRef: OrderSet = this._strategy.followStrategy(
                this._today,
                this._cashOwning,
                this._stockHolding,
                this._valueAssessed,
                this._mktPriceAcquired,
                this._strategySetting.params
            );
            const qd = orderSetForRef.buyOrder.quantity;
            const qs = orderSetForRef.sellOrder.quantity;
            this._maxPayable = orderSetForRef.buyOrder.price;
            this._minSellable = orderSetForRef.sellOrder.price;
            this.bid();
            this.ask();
            if (this._bidPrice !== undefined && this._askPrice !== undefined && this._today !== undefined) {
                this._orderToday = {
                    "buyOrder": new Order(this, "buy", this._today, this._bidPrice, qd),
                    "sellOrder": new Order(this, "sell", this._today, this._askPrice, qs)
                }
            } else throw "_bidPrice/_askPrice/_today is undefined yet, you probably need to do updateMktInfo() first.";
        } else throw "market info not sufficient when making order";
    }
    public initBidPrice(): void {
        this._aggressiveness = MyMath.oneTailNormalSample(this._aggressiveness, 0.25, "right");
        if (this._maxPayable !== undefined) {
            this._bidPrice = this._maxPayable * Math.max(0, (1 - this._aggressiveness));
        } else throw "The _maxPayable is still undefined.";
    }
    public bid(): void {
        if (this._maxPayable !== undefined && this._bidPrice !== undefined) {
            let delta = this._maxPayable - this._bidPrice;
            if (delta > 0) {
                this._bidPrice += Math.min(delta, delta * MyMath.oneTailNormalSample(0, 0.5, "right"));
                this._aggressiveness = 1 - this._bidPrice / this._maxPayable;
            } else if (delta < 0) this.initBidPrice();
        } else this.initBidPrice();
    }
    public initAskPrice(): void {
        this._aggressiveness = MyMath.oneTailNormalSample(this._aggressiveness, 0.25, "right");
        if (this._minSellable !== undefined) this._askPrice = this._minSellable * (1 + this._aggressiveness);
        else throw "The _minSellable is still undefined.";
    }
    public ask(): void {
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
        this._stockHolding.sort(function (a, b) {
            if (a.buyInDay !== undefined && b.buyInDay !== undefined) return a.buyInDay - b.buyInDay;
            else throw "buyInDay info not sufficient.";
        })
        let stockOut: Stock[] = this._stockHolding.splice(0, qOut);
        this._cashOwning += qOut * dealPrice;
        this._tradeAmount += qOut;
        return stockOut;
    }
}