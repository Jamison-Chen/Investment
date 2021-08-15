import { Stock } from "./stock.js";
import { MyMath } from "./myMath.js";
export interface Strategy {
    name: string;
    followStrategy(
        today: number,
        cashOwning: number,
        stockHolding: Stock[],
        valAssessed: number,
        pToday: number,
        otherParams: any): any;
}
export class ValueFollower implements Strategy {
    public name: string;
    public constructor() {
        this.name = "ValueFollower";
    }
    public followStrategy(today: number, cashOwning: number, stockHolding: Stock[], valAssessed: number, pToday: number, otherParams: any): any {
        let pd: number = valAssessed;
        let ps: number = pd;
        // let qd: number = Math.max(0, Math.floor((cashOwning / pd) * this.mySigmoid((pd - pToday) / pd)));
        // let qs: number = Math.max(0, Math.floor(stockHolding.length * this.mySigmoid((pToday - ps) / ps)));
        // let qd: number = Math.max(0, Math.floor((cashOwning / pd) * ((pd - pToday) / pd)));
        // let qs: number = Math.max(0, Math.floor(stockHolding.length * ((pToday - ps) / ps)));
        let qd: number = Math.max(0, Math.round((cashOwning / pd) * (1 - pToday / pd)));
        let qs: number = Math.max(0, Math.round(stockHolding.length * (1 - ps / pToday)));
        // let qd: number = Math.floor(Math.random() * (Math.floor(cashOwning / pd) + 1));
        // let qs: number = Math.floor(Math.random() * (stockHolding.length + 1));
        return {
            "today": today,
            "buyP": pd,
            "buyQ": qd,
            "sellP": ps,
            "sellQ": qs
        }
    }
}
export class PriceChaser implements Strategy {
    public name: string;
    // public attitude: number;
    public constructor() {
        this.name = "PriceChaser";
        // this.attitude = 1;
    }
    public followStrategy(today: number, cashOwning: number, stockHolding: Stock[], valAssessed: number, pToday: number, otherParams: any): any {
        // this.attitude *= Math.max(0, MyMath.normalSample(1, 0.033));
        let pd: number = pToday * Math.max(0.9, Math.min(1.1, MyMath.normalSample(1, 0.033)));
        // let pd: number = pToday * Math.max(0.9, Math.min(1.1, this.attitude));
        let ps: number = pd;
        // if pd and ps > pToday, it means you expect the price to rise
        // else it means you expect it to fall
        let qd: number = Math.max(0, Math.round((cashOwning / pd) * (1 - pToday / pd)));
        let qs: number = Math.max(0, Math.round(stockHolding.length * (1 - ps / pToday)));
        return {
            "today": today,
            "buyP": pd,
            "buyQ": qd,
            "sellP": ps,
            "sellQ": qs
        }
    }
}
export class BHmixGrid implements Strategy {
    protected latestMaxP: number;
    protected latestMinP: number;
    public name: string;
    public constructor() {
        this.name = "BHmixGrid";
        this.latestMaxP = -1 * Infinity;
        this.latestMinP = Infinity;
    }
    public followStrategy(today: number, cashOwning: number, stockHolding: Stock[], valAssessed: number, pToday: number, otherParams: any): any {
        let r = otherParams.r;
        if (stockHolding.length === 0 || today === 1) {
            // this.latestMaxP = pToday* this.normalSample(1, 0.033)
            this.latestMaxP = pToday;
            this.latestMinP = this.latestMaxP;
        } else {
            for (let eachStock of stockHolding) {
                if (eachStock.buyInCost > this.latestMaxP) this.latestMaxP = eachStock.buyInCost;
                if (eachStock.buyInCost < this.latestMinP) this.latestMinP = eachStock.buyInCost;
            }
        }
        let ps: number = this.latestMaxP;
        let pd: number = this.latestMinP;
        let qd: number = 0;
        let qs: number = 0;
        if (stockHolding.length === 0) qd = this.calcQToday(cashOwning, pToday, r);
        else {
            // If price record low, buy in
            if (pToday < this.latestMaxP && pToday < this.latestMinP) {
                qd = this.calcQToday(cashOwning, pToday, r);
                // Sell all out
            } else if (pToday > this.latestMaxP) qs = stockHolding.length;
        }
        return {
            "today": today,
            "buyP": pd,
            "buyQ": qd,
            "sellP": ps,
            "sellQ": qs
        }
    }
    protected calcQToday(cashOwned: number, pToday: number, r: number): number {
        let qIfAllIn = cashOwned / pToday;
        return Math.floor(r * qIfAllIn);
    }
}
export class GridConstRatio implements Strategy {
    private latestTradePrice: number;
    public name: string;
    public constructor() {
        this.name = "CRG";
        this.latestTradePrice = 0;
    }
    public followStrategy(today: number, cashOwning: number, stockHolding: Stock[], valAssessed: number, pToday: number, otherParams: any): any {
        let sensitivity = otherParams["sensitivity"];
        let stockRatio = otherParams["stock-ratio"];

        let pd: number = pToday * Math.max(0.9, Math.min(1.1, MyMath.normalSample(1, 0.033)));
        let ps: number = pd;
        let qd: number = 0;
        let qs: number = 0;

        if (stockHolding.length >= 2) {
            this.latestTradePrice = stockHolding.reduce((a, b) => a.buyInDay > b.buyInDay ? a : b).buyInCost;
        } else if (stockHolding.length === 1) {
            this.latestTradePrice = stockHolding[0].buyInCost;
        }
        if (today === 1 || stockHolding.length === 0) {
            qd = Math.floor(cashOwning * stockRatio / pd);
        } else {
            let priceRiseRate = (pd - this.latestTradePrice) / this.latestTradePrice;
            let priceFallRate = (pd - this.latestTradePrice) / pd;
            if (priceRiseRate >= sensitivity) { // If price rises,
                if (stockHolding.length > 0) {
                    while ((stockHolding.length - qs) * ps > cashOwning + qs * ps) qs++;
                    qs = Math.min(stockHolding.length, qs);
                }
            } else if (priceFallRate <= sensitivity * -1) {  // If price falls,
                while ((stockHolding.length + qd) * pd < cashOwning - qd * pd) qd++;
            }
        }
        return {
            "today": today,
            "buyP": pd,
            "buyQ": qd,
            "sellP": ps,
            "sellQ": qs
        }
    }
}
export class Chicken implements Strategy {
    private latestMaxP: number;
    private latestMinP: number;
    public name: string;
    public constructor() {
        this.name = "Chicken";
        this.latestMaxP = -1 * Infinity;
        this.latestMinP = Infinity;
    }
    public followStrategy(today: number, cashOwning: number, stockHolding: Stock[], valAssessed: number, pToday: number, otherParams: any): any {
        let r = otherParams["r"];
        let runawayRate = otherParams["runaway-rate"];

        let ps: number = pToday * Math.max(0.9, Math.min(1.1, MyMath.normalSample(1, 0.033)));
        let pd: number = ps;
        let qd: number = 0;
        let qs: number = 0;
        if (stockHolding.length === 0) {
            if (pd > pToday) {
                this.latestMinP = pd;
                this.latestMaxP = pd;
                qd = this.calcQToday(r, cashOwning, pd);
            }
        } else {
            let maxCostHolding = Math.max(...stockHolding.map(e => e.buyInCost));
            // If price rises, and higher than maxCostHolding, buy in.
            if (pd > Math.max(maxCostHolding, this.latestMaxP)) {
                this.latestMaxP = pd;
                qd = this.calcQToday(r, cashOwning, pd);
            } else if (pd < Math.max(maxCostHolding, this.latestMaxP) * runawayRate) {
                qs = stockHolding.length;   // sell all out
            }
        }
        return {
            "today": today,
            "buyP": pd,
            "buyQ": qd,
            "sellP": ps,
            "sellQ": qs
        }
    }
    private calcQToday(r: number, cashOwned: number, pToday: number): number {
        const qIfAllIn = cashOwned / pToday;
        if (qIfAllIn < 1) return 0;
        let multiplier = r;
        let qToday = Math.floor(qIfAllIn * multiplier)
        return qToday > 1 ? qToday : 1;
    }
}
