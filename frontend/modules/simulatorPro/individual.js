import { BHmixGrid, ValueFollower, PriceChaser, GridConstRatio, Chicken } from "./strategy.js";
import { Order } from "./order.js";
import { MyMath } from "./myMath.js";
export class Individual {
    constructor(aDiv, strayegySetting, initCash, stockHolding, aggr = Math.random(), aggrChangeable = true) {
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
    updateMktInfo(today, valueToday, priceToday, dailyEconGrowthRate) {
        this._today = today;
        this._valueAssessed = valueToday;
        this._mktPriceAcquired = priceToday;
        this._cashOwning += (this._initialCash * dailyEconGrowthRate);
    }
    makeOrder() {
        // The prices inthe orders that _strategy made is min-sellable and max-payable (i.e. just for reference)
        // The individuals need to bid themselves
        if (this._today !== undefined && this._mktPriceAcquired !== undefined && this._valueAssessed !== undefined) {
            let strategyResult = this._strategy.followStrategy(this._today, this._cashOwning, this._stockHolding, this._valueAssessed, this._mktPriceAcquired, this._strategySetting.params);
            let qd = strategyResult["buyQ"];
            let qs = strategyResult["sellQ"];
            this._maxPayable = strategyResult["buyP"];
            this._minSellable = strategyResult["sellP"];
            let bidPrice = this.bid();
            let askPrice = this.ask();
            this.decreaseAggressiveness();
            if (this._today !== undefined) {
                this._orderSetToday = {
                    "buyOrder": new Order("buy", this._today, bidPrice, qd),
                    "sellOrder": new Order("sell", this._today, askPrice, qs)
                };
                return this._orderSetToday;
            }
            else
                throw "_today is undefined, try updateMktInfo() first.";
        }
        else
            throw "market info not sufficient when making order";
    }
    bid() {
        if (this._maxPayable !== undefined) {
            return this._maxPayable * (1 - this._aggressiveness);
        }
        else
            throw "The _maxPayable is undefined.";
    }
    ask() {
        if (this._minSellable !== undefined) {
            return this._minSellable * (1 / (1 - this._aggressiveness + Number.EPSILON));
        }
        else
            throw "The _minSellable is undefined.";
    }
    buyIn(stockIn, dealPrice, today) {
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
    sellOut(qOut, dealPrice) {
        this.increaseAggressiveness();
        // Use FIFO
        this._stockHolding.sort((a, b) => a.buyInDay - b.buyInDay);
        let stockOut = this._stockHolding.splice(0, qOut);
        this._cashOwning += qOut * dealPrice;
        this._tradeAmount += qOut;
        return stockOut;
    }
    decreaseAggressiveness() {
        if (this._aggressivenessChangable) {
            this._aggressiveness += Math.max(-1 * this._aggressiveness, MyMath.oneTailNormalSample(0, this._aggressiveness / 3, "left"));
        }
    }
    increaseAggressiveness() {
        if (this._aggressivenessChangable) {
            this._aggressiveness += Math.min(1 - this._aggressiveness, MyMath.oneTailNormalSample(0, (1 - this._aggressiveness) / 3, "right"));
        }
    }
}
