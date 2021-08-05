import { Stock } from "./stock.js";
import { MyMath } from "./myMath.js";
export interface Strategy {
    name: string;
    followStrategy(today: number, cashOwning: number, stockHolding: Stock[], valAssessed: number, pToday: number, otherParams: any): any;
}
export class ValueFollower implements Strategy {
    public name: string;
    public constructor(strategyName: string) {
        this.name = strategyName;
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
    public attitude: number;
    public constructor(strategyName: string) {
        this.name = strategyName;
        this.attitude = 1;
    }
    public followStrategy(today: number, cashOwning: number, stockHolding: Stock[], valAssessed: number, pToday: number, otherParams: any): any {
        this.attitude *= Math.max(0, MyMath.normalSample(1, 0.033));
        let pd: number = pToday * MyMath.normalSample(1, 0.033);
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
    public constructor(strategyName: string) {
        this.name = strategyName;
        this.latestMaxP = -1 * Infinity;
        this.latestMinP = Infinity;
    }
    public followStrategy(today: number, cashOwning: number, stockHolding: Stock[], valAssessed: number, pToday: number, otherParams: any): any {
        let r = otherParams.r;
        // this.latestMaxP = -1 * Infinity;
        // this.latestMinP = Infinity;
        // let latestMaxP: number = -1 * Infinity;
        // let latestMinP: number = Infinity;
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
            if (pToday < this.latestMaxP && pToday < this.latestMinP) qd = this.calcQToday(cashOwning, pToday, r);
            // Sell all out
            else if (pToday > this.latestMaxP) qs = stockHolding.length;
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
        // if (latestMaxP !== undefined && latestMinP !== undefined) {
        //     // 2 strtegies are given:
        //     let baseQ = ((latestMinP - pToday) / latestMinP) * qIfAllIn;
        //     // let baseQ = r * qIfAllIn;

        //     // a few strtegies are given:
        //     // let multiplier = latestMaxP / pToday;

        //     // because 1.313 * tanh(1) ~= 1
        //     // let multiplier = latestMaxP / (1.313 * Math.tanh(pToday / latestMaxP) * pToday);
        //     // let multiplier = latestMaxP / (1.738 / Math.exp(1 / (1.81 * (pToday / latestMaxP))) * pToday);
        //     let multiplier = (40 * (((pToday / latestMaxP) - 1) ** 4)) + 1;
        //     // let multiplier = 1;
        //     // let multiplier = pToday/latestMaxP;
        //     return Math.floor(baseQ * multiplier);
        // } else return Math.floor(r * qIfAllIn);
        return Math.floor(r * qIfAllIn);
    }
}
// export class PlannedBHmixGrid extends BHmixGrid {
//     public followStrategy(r: number, today: number, cashOwning: number, stockHolding: Stock[], pToday: number): any {
//         if (stockHolding.length === 0 || today === 1) {
//             this.latestMaxP = pToday;
//             this.latestMinP = this.latestMaxP;
//         } else {
//             for (let eachStock of stockHolding) {
//                 if (eachStock.buyInCost > this.latestMaxP) this.latestMaxP = eachStock.buyInCost;
//                 if (eachStock.buyInCost < this.latestMinP) this.latestMinP = eachStock.buyInCost;
//             }
//         }
//         let ps: number = this.latestMaxP;
//         let pd: number = this.latestMinP;
//         let qd: number = 0;
//         let qs: number = 0;
//         if (stockHolding.length === 0) qd = this.calcQToday(cashOwning, pToday, r);
//         else {
//             // If price record low, buy in
//             if (pToday < this.latestMaxP && pToday < this.latestMinP) qd = this.calcQToday(cashOwning, pToday, r);
//             // Sell
//             for (let eachStock of stockHolding) {
//                 let eachCost = eachStock.buyInCost;
//                 let targetSellP = eachCost * (1 + (this.latestMaxP - eachCost) / this.latestMaxP);
//                 if (pToday > targetSellP) {
//                     if (eachCost > this.latestMinP) this.latestMinP = eachCost;
//                     qs += 1;
//                 }
//             }
//         }
//         return {
//     "today": today,
//     "buyP": pd,
//     "buyQ": qd,
//     "sellP": ps,
//     "sellQ": qs
// }
//     }
// }

// export class GridConstQ implements Strategy {
//     public followStrategy(maxPrice: number, minPrice: number, nTable: number, today: number, cashOwning: number, stockHolding: Stock[], pToday: number): any {
//         // Draw divide lines
//         // numbers in divideLines are in descending order
//         let divideLines: number[] = [];
//         for (let i = 0; i < nTable + 1; i++) {
//             divideLines.push((minPrice * i / nTable) + (maxPrice * (nTable - i) / nTable));
//         }
//     }
//     private calcStandAt(price: number, aList: number[]): number {
//         let result = 0;
//         for (let each of aList) {
//             if (price >= each) {
//                 return result;
//             }
//             result++;
//         }
//         return result;
//     }
// }
export class GridConstRatio implements Strategy {
    private standAt: number;
    private divideLines: number[]
    public name: string;
    public constructor(strategyName: string) {
        this.name = strategyName;
        this.standAt = 0
        this.divideLines = [];
    }
    public followStrategy(today: number, cashOwning: number, stockHolding: Stock[], valAssessed: number, pToday: number, otherParams: any): any {
        let maxPrice = otherParams["max-price"];
        let minPrice = otherParams["min-price"];
        let nTable = otherParams["n-table"];
        let stockRatio = otherParams["stock-ratio"];

        let ps: number = pToday * 0.952;    // ask a little bit lower for getting dealt more easily
        let pd: number = pToday * 1.05;    // bid a little bit higher for getting dealt more easily
        let qd: number = 0;
        let qs: number = 0;
        if (today === 1) {
            // Draw divide lines
            // numbers in divideLines are in descending order
            for (let i = 0; i < nTable + 1; i++) {
                this.divideLines.push((minPrice * i / nTable) + (maxPrice * (nTable - i) / nTable));
            }
            this.standAt = this.calcStandAt(pToday, this.divideLines);
            qd = Math.floor(cashOwning * stockRatio / pd);
        } else {
            let newStandAt = this.calcStandAt(pToday, this.divideLines);
            if (newStandAt < this.standAt) { // If price rises,
                if (stockHolding.length > 0) {
                    if (newStandAt > 0) {   // If price isn't too high, sell a part.
                        while ((stockHolding.length - qs) * ps > cashOwning + qs * ps) {
                            qs++;
                        }
                        qs = Math.min(stockHolding.length, qs);
                    } else qs = stockHolding.length;    // If price is too high, sell all out.
                }
            } else if (newStandAt > this.standAt) {  // If price falls,
                if (newStandAt <= nTable) {  // If price isn't too low, buy some.
                    while ((stockHolding.length + qd) * pd < cashOwning - qd * pd) {
                        qd++;
                    }
                } else qd = Math.floor(cashOwning / pd);  // If price is too low, buy all in.
            }
            this.standAt = newStandAt;
        }
        return {
            "today": today,
            "buyP": pd,
            "buyQ": qd,
            "sellP": ps,
            "sellQ": qs
        }
    }
    private calcStandAt(price: number, aList: number[]): number {
        let result = 0;
        for (let each of aList) {
            if (price >= each) return result;
            result++;
        }
        return result;
    }
}
export class Chicken implements Strategy {
    private latestMaxP: number;
    private latestMinP: number;
    public name: string;
    public constructor(strategyName: string) {
        this.name = strategyName;
        this.latestMaxP = -1 * Infinity;
        this.latestMinP = Infinity;
    }
    public followStrategy(today: number, cashOwning: number, stockHolding: Stock[], valAssessed: number, pToday: number, otherParams: any): any {
        let r = otherParams["r"];
        let runawayRate = otherParams["runaway-rate"];

        let ps: number = pToday * MyMath.normalSample(1, 0.033);
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
        // 3 strategies for deciding multiplier are given:
        let multiplier = r;
        // let multiplier = r * (this.latestMinP / pToday) ** 5;
        // let multiplier = r / (1 + pToday - this.latestMinP);
        let qToday = Math.floor(qIfAllIn * multiplier)
        return qToday > 1 ? qToday : 1;
    }
}
