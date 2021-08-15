import { MyMath } from "./myMath.js";
export class ValueFollower {
    constructor() {
        this.name = "ValueFollower";
    }
    followStrategy(today, cashOwning, stockHolding, valAssessed, pToday, otherParams) {
        let pd = valAssessed;
        let ps = pd;
        // let qd: number = Math.max(0, Math.floor((cashOwning / pd) * this.mySigmoid((pd - pToday) / pd)));
        // let qs: number = Math.max(0, Math.floor(stockHolding.length * this.mySigmoid((pToday - ps) / ps)));
        // let qd: number = Math.max(0, Math.floor((cashOwning / pd) * ((pd - pToday) / pd)));
        // let qs: number = Math.max(0, Math.floor(stockHolding.length * ((pToday - ps) / ps)));
        let qd = Math.max(0, Math.round((cashOwning / pd) * (1 - pToday / pd)));
        let qs = Math.max(0, Math.round(stockHolding.length * (1 - ps / pToday)));
        // let qd: number = Math.floor(Math.random() * (Math.floor(cashOwning / pd) + 1));
        // let qs: number = Math.floor(Math.random() * (stockHolding.length + 1));
        return {
            "today": today,
            "buyP": pd,
            "buyQ": qd,
            "sellP": ps,
            "sellQ": qs
        };
    }
}
export class PriceChaser {
    // public attitude: number;
    constructor() {
        this.name = "PriceChaser";
        // this.attitude = 1;
    }
    followStrategy(today, cashOwning, stockHolding, valAssessed, pToday, otherParams) {
        // this.attitude *= Math.max(0, MyMath.normalSample(1, 0.033));
        let pd = pToday * Math.max(0.9, Math.min(1.1, MyMath.normalSample(1, 0.033)));
        // let pd: number = pToday * Math.max(0.9, Math.min(1.1, this.attitude));
        let ps = pd;
        // if pd and ps > pToday, it means you expect the price to rise
        // else it means you expect it to fall
        let qd = Math.max(0, Math.round((cashOwning / pd) * (1 - pToday / pd)));
        let qs = Math.max(0, Math.round(stockHolding.length * (1 - ps / pToday)));
        return {
            "today": today,
            "buyP": pd,
            "buyQ": qd,
            "sellP": ps,
            "sellQ": qs
        };
    }
}
export class BHmixGrid {
    constructor() {
        this.name = "BHmixGrid";
        this.latestMaxP = -1 * Infinity;
        this.latestMinP = Infinity;
    }
    followStrategy(today, cashOwning, stockHolding, valAssessed, pToday, otherParams) {
        let r = otherParams.r;
        if (stockHolding.length === 0 || today === 1) {
            // this.latestMaxP = pToday* this.normalSample(1, 0.033)
            this.latestMaxP = pToday;
            this.latestMinP = this.latestMaxP;
        }
        else {
            for (let eachStock of stockHolding) {
                if (eachStock.buyInCost > this.latestMaxP)
                    this.latestMaxP = eachStock.buyInCost;
                if (eachStock.buyInCost < this.latestMinP)
                    this.latestMinP = eachStock.buyInCost;
            }
        }
        let ps = this.latestMaxP;
        let pd = this.latestMinP;
        let qd = 0;
        let qs = 0;
        if (stockHolding.length === 0)
            qd = this.calcQToday(cashOwning, pToday, r);
        else {
            // If price record low, buy in
            if (pToday < this.latestMaxP && pToday < this.latestMinP) {
                qd = this.calcQToday(cashOwning, pToday, r);
                // Sell all out
            }
            else if (pToday > this.latestMaxP)
                qs = stockHolding.length;
        }
        return {
            "today": today,
            "buyP": pd,
            "buyQ": qd,
            "sellP": ps,
            "sellQ": qs
        };
    }
    calcQToday(cashOwned, pToday, r) {
        let qIfAllIn = cashOwned / pToday;
        return Math.floor(r * qIfAllIn);
    }
}
export class GridConstRatio {
    constructor() {
        this.name = "CRG";
        this.latestTradePrice = 0;
    }
    followStrategy(today, cashOwning, stockHolding, valAssessed, pToday, otherParams) {
        let sensitivity = otherParams["sensitivity"];
        let stockRatio = otherParams["stock-ratio"];
        let pd = pToday * Math.max(0.9, Math.min(1.1, MyMath.normalSample(1, 0.033)));
        let ps = pd;
        let qd = 0;
        let qs = 0;
        if (stockHolding.length >= 2) {
            this.latestTradePrice = stockHolding.reduce((a, b) => a.buyInDay > b.buyInDay ? a : b).buyInCost;
        }
        else if (stockHolding.length === 1) {
            this.latestTradePrice = stockHolding[0].buyInCost;
        }
        if (today === 1 || stockHolding.length === 0) {
            qd = Math.floor(cashOwning * stockRatio / pd);
        }
        else {
            let priceRiseRate = (pd - this.latestTradePrice) / this.latestTradePrice;
            let priceFallRate = (pd - this.latestTradePrice) / pd;
            if (priceRiseRate >= sensitivity) { // If price rises,
                if (stockHolding.length > 0) {
                    while ((stockHolding.length - qs) * ps > cashOwning + qs * ps)
                        qs++;
                    qs = Math.min(stockHolding.length, qs);
                }
            }
            else if (priceFallRate <= sensitivity * -1) { // If price falls,
                while ((stockHolding.length + qd) * pd < cashOwning - qd * pd)
                    qd++;
            }
        }
        return {
            "today": today,
            "buyP": pd,
            "buyQ": qd,
            "sellP": ps,
            "sellQ": qs
        };
    }
}
export class Chicken {
    constructor() {
        this.name = "Chicken";
        this.latestMaxP = -1 * Infinity;
        this.latestMinP = Infinity;
    }
    followStrategy(today, cashOwning, stockHolding, valAssessed, pToday, otherParams) {
        let r = otherParams["r"];
        let runawayRate = otherParams["runaway-rate"];
        let ps = pToday * Math.max(0.9, Math.min(1.1, MyMath.normalSample(1, 0.033)));
        let pd = ps;
        let qd = 0;
        let qs = 0;
        if (stockHolding.length === 0) {
            if (pd > pToday) {
                this.latestMinP = pd;
                this.latestMaxP = pd;
                qd = this.calcQToday(r, cashOwning, pd);
            }
        }
        else {
            let maxCostHolding = Math.max(...stockHolding.map(e => e.buyInCost));
            // If price rises, and higher than maxCostHolding, buy in.
            if (pd > Math.max(maxCostHolding, this.latestMaxP)) {
                this.latestMaxP = pd;
                qd = this.calcQToday(r, cashOwning, pd);
            }
            else if (pd < Math.max(maxCostHolding, this.latestMaxP) * runawayRate) {
                qs = stockHolding.length; // sell all out
            }
        }
        return {
            "today": today,
            "buyP": pd,
            "buyQ": qd,
            "sellP": ps,
            "sellQ": qs
        };
    }
    calcQToday(r, cashOwned, pToday) {
        const qIfAllIn = cashOwned / pToday;
        if (qIfAllIn < 1)
            return 0;
        let multiplier = r;
        let qToday = Math.floor(qIfAllIn * multiplier);
        return qToday > 1 ? qToday : 1;
    }
}
