import { BHmixGrid, ValueFollower, PriceChaser, GridConstRatio, Chicken } from "./strategy.js";
import { Order } from "./order.js";
import { MyMath } from "./myMath.js";
export class Individual {
    constructor(aDiv, strayegySetting, initCash, stockHolding) {
        // others
        this._strategyColor = {
            "ValueFollower": "#D00",
            "PriceChaser": "#000",
            "BHmixGrid": "#0A0",
            "GridConstRatio": "#00A",
            "Chicken": "#A0A"
        };
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
        this._orderSetToday = undefined;
    }
    get orderSetToday() {
        return this._orderSetToday;
    }
    get initialCash() {
        return this._initialCash;
    }
    get cashOwning() {
        return this._cashOwning;
    }
    get stockHolding() {
        return this._stockHolding;
    }
    get initialHolding() {
        return this._initialHolding;
    }
    get initialTotalAsset() {
        return this._initialTotalAsset;
    }
    get tradeAmount() {
        return this._tradeAmount;
    }
    calcReturn(stockPrice) {
        return Math.round((this.calcTotalAsset(stockPrice) / this._initialTotalAsset - 1) * 1000) / 1000;
    }
    calcTotalAsset(stockPrice = undefined) {
        return this._cashOwning + this.calcStockMktVal(stockPrice);
    }
    calcStockMktVal(stockPrice = undefined) {
        let totalStockVal = 0;
        for (let each of this._stockHolding) {
            if (stockPrice !== undefined)
                totalStockVal += stockPrice;
            else
                totalStockVal += each.buyInCost;
        }
        return totalStockVal;
    }
    chooseStrayegy(strategyName) {
        this.divControlled.style.backgroundColor = this._strategyColor[strategyName];
        if (strategyName === "ValueFollower")
            return new ValueFollower(strategyName);
        else if (strategyName === "PriceChaser")
            return new PriceChaser(strategyName);
        else if (strategyName === "BHmixGrid")
            return new BHmixGrid(strategyName);
        else if (strategyName === "GridConstRatio")
            return new GridConstRatio(strategyName);
        else if (strategyName === "Chicken")
            return new Chicken(strategyName);
        else
            throw "Strategy undefined.";
    }
    updateMktInfo(today, valueToday, priceToday) {
        this._today = today;
        this._valueAssessed = valueToday;
        this._mktPriceAcquired = priceToday;
    }
    makeOrder() {
        // The prices inthe orders that _strategy made is min-sellable and max-payable (i.e. just for reference)
        // The individuals need to bid themselves
        if (this._today !== undefined && this._mktPriceAcquired !== undefined && this._valueAssessed !== undefined) {
            let strategyResult = this._strategy.followStrategy(this._today, this._cashOwning, this._stockHolding, this._valueAssessed, this._mktPriceAcquired, this._strategySetting.params);
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
                };
                return this._orderSetToday;
            }
            else
                throw "_bidPrice/_askPrice/_today is undefined, try updateMktInfo() first.";
        }
        else
            throw "market info not sufficient when making order";
    }
    initBidPrice() {
        this._aggressiveness = MyMath.oneTailNormalSample(this._aggressiveness, 0.25, "right");
        if (this._maxPayable !== undefined) {
            this._bidPrice = this._maxPayable * Math.max(0, (1 - this._aggressiveness));
        }
        else
            throw "The _maxPayable is still undefined.";
    }
    bid() {
        if (this._maxPayable !== undefined && this._bidPrice !== undefined) {
            let delta = this._maxPayable - this._bidPrice;
            if (delta > 0) {
                this._bidPrice += Math.min(delta, delta * MyMath.oneTailNormalSample(0, 0.5, "right"));
                this._aggressiveness = 1 - this._bidPrice / this._maxPayable;
            }
            else if (delta < 0)
                this.initBidPrice();
        }
        else
            this.initBidPrice();
    }
    initAskPrice() {
        this._aggressiveness = MyMath.oneTailNormalSample(this._aggressiveness, 0.25, "right");
        if (this._minSellable !== undefined)
            this._askPrice = this._minSellable * (1 + this._aggressiveness);
        else
            throw "The _minSellable is still undefined.";
    }
    ask() {
        if (this._minSellable !== undefined && this._askPrice !== undefined) {
            let delta = this._askPrice - this._minSellable;
            if (delta > 0) {
                this._askPrice -= Math.min(delta, delta * MyMath.oneTailNormalSample(0, 0.5, "right"));
                this._aggressiveness = this._askPrice / this._minSellable - 1;
            }
            else if (delta < 0)
                this.initAskPrice();
        }
        else
            this.initAskPrice();
    }
    buyIn(stockIn, dealPrice, today) {
        // revise stock info
        for (let eachStock of stockIn) {
            eachStock.buyInCost = dealPrice;
            eachStock.buyInDay = today;
        }
        this._stockHolding = this._stockHolding.concat(stockIn);
        this._cashOwning -= stockIn.length * dealPrice;
        this._tradeAmount += stockIn.length;
    }
    sellOut(qOut, dealPrice) {
        // Use FIFO
        this._stockHolding.sort((a, b) => a.buyInDay - b.buyInDay);
        let stockOut = this._stockHolding.splice(0, qOut);
        this._cashOwning += qOut * dealPrice;
        this._tradeAmount += qOut;
        return stockOut;
    }
}
