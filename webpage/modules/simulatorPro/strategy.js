import { Order } from "./order.js";
export class Strategy {
    constructor(strategyName, owner) {
        this.name = strategyName;
        this.owner = owner;
    }
    // protected recordQuantity(q: number): void {
    //     this.dailyQList.push(q);
    //     this.cumulQList.push(this.cumulQList[this.cumulQList.length - 1] + q);
    // }
    // protected recordCashFlow(q: number, p: number): void {
    //     let cashDeltaToday = q * p;
    //     if (q >= 0) {  // buying
    //         this.cumulInvestCashList.push(this.cumulInvestCashList[this.cumulInvestCashList.length - 1] + cashDeltaToday);
    //     } else {  // when selling, count average
    //         let cahngeRateInQ = this.cumulQList[this.cumulQList.length - 1] / this.cumulQList[this.cumulQList.length - 2];
    //         this.cumulInvestCashList.push(this.cumulInvestCashList[this.cumulInvestCashList.length - 1] * cahngeRateInQ);
    //     }
    //     this.cashList.push(this.cashList[this.cashList.length - 1] - cashDeltaToday);
    // }
    // protected calcRateOfReturn(i: number): void {
    //     if (this.cumulInvestCashList[i] > 0) {
    //         this.rateOfReturnList.push((this.securMktValList[i] - this.cumulInvestCashList[i]) / this.cumulInvestCashList[i]);
    //     } else this.rateOfReturnList.push(0);
    // }
    // protected recordBuyHistory(q: number, p: number): void {
    //     if (q > 0) {
    //         // round to the 3rd decimal
    //         let key = Math.round((p + Number.EPSILON) * 1000) / 1000;
    //         if (this.buyHistory[`${key}`] == undefined) this.buyHistory[`${key}`] = q;
    //         else this.buyHistory[`${key}`] += q;
    //     }
    // }
    normalSample(mu, std) {
        let u = 0, v = 0;
        while (u === 0)
            u = Math.random(); //Converting [0,1) to (0,1)
        while (v === 0)
            v = Math.random();
        return std * Math.sqrt(-2.0 * Math.log(u)) * Math.cos(2.0 * Math.PI * v) + mu;
    }
    avg(arr) {
        if (arr.length == 0)
            return 0;
        return arr.reduce((prev, curr) => prev + curr, 0) / arr.length;
    }
    mySigmoid(x) {
        return 1 / (1 + 150 * Math.pow(Math.E, -10 * x));
    }
}
export class ValueFollower extends Strategy {
    followStrategy(today, cashOwning, stockHolding, valAssessed, pToday) {
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
            "buyOrder": new Order(this.owner, "buy", today, pd, qd),
            "sellOrder": new Order(this.owner, "sell", today, ps, qs)
        };
    }
}
export class PriceChaser extends Strategy {
    followStrategy(today, cashOwning, stockHolding, pToday) {
        let pd = pToday * this.normalSample(1, 0.033);
        let ps = pd;
        // if pd and ps > pToday, it means you expect the price to rise
        // else it means you expect it to fall
        // let qd: number = Math.max(0, Math.floor((cashOwning / pd) * ((pd - pToday) / pd)));
        // let qs: number = Math.max(0, Math.ceil(stockHolding.length * ((pToday - ps) / ps)));
        let qd = Math.max(0, Math.round((cashOwning / pd) * (1 - pToday / pd)));
        let qs = Math.max(0, Math.round(stockHolding.length * (1 - ps / pToday)));
        return {
            "buyOrder": new Order(this.owner, "buy", today, pd, qd),
            "sellOrder": new Order(this.owner, "sell", today, ps, qs)
        };
    }
}
export class BHmixGrid extends Strategy {
    constructor(strategyName, owner) {
        super(strategyName, owner);
        this.latestMaxP = -1 * Infinity;
        this.latestMinP = Infinity;
    }
    followStrategy(r, today, cashOwning, stockHolding, pToday) {
        // this.latestMaxP = -1 * Infinity;
        // this.latestMinP = Infinity;
        // let latestMaxP: number = -1 * Infinity;
        // let latestMinP: number = Infinity;
        if (stockHolding.length == 0 || today == 1) {
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
        if (stockHolding.length == 0)
            qd = this.calcQToday(cashOwning, pToday, r);
        else {
            // If price record low, buy in
            if (pToday < this.latestMaxP && pToday < this.latestMinP)
                qd = this.calcQToday(cashOwning, pToday, r);
            // Sell all out
            else if (pToday > this.latestMaxP)
                qs = stockHolding.length;
        }
        return {
            "buyOrder": new Order(this.owner, "buy", today, pd, qd),
            "sellOrder": new Order(this.owner, "sell", today, ps, qs)
        };
    }
    calcQToday(cashOwned, pToday, r) {
        let qIfAllIn = cashOwned / pToday;
        // if (latestMaxP != undefined && latestMinP != undefined) {
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
//     public followStrategy(r: number, today: number, cashOwning: number, stockHolding: Stock[], pToday: number): OrderSet {
//         if (stockHolding.length == 0 || today == 1) {
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
//         if (stockHolding.length == 0) qd = this.calcQToday(cashOwning, pToday, r);
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
//             "buyOrder": new Order(this.owner, "buy", today, pd, qd),
//             "sellOrder": new Order(this.owner, "sell", today, ps, qs)
//         }
//     }
// }
// export class GridConstQ extends Strategy {
//     public followStrategy(maxPrice: number, minPrice: number, nTable: number, today: number, cashOwning: number, stockHolding: Stock[], pToday: number): OrderSet {
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
export class GridConstRatio extends Strategy {
    constructor(strategyName, owner) {
        super(strategyName, owner);
        this.standAt = 0;
        this.divideLines = [];
    }
    followStrategy(maxPrice, minPrice, nTable, stockRatio, today, cashOwning, stockHolding, pToday) {
        let ps = pToday * 0.952; // ask a little bit lower for getting dealt more easily
        let pd = pToday * 1.05; // bid a little bit higher for getting dealt more easily
        let qd = 0;
        let qs = 0;
        if (today == 1) {
            // Draw divide lines
            // numbers in divideLines are in descending order
            for (let i = 0; i < nTable + 1; i++) {
                this.divideLines.push((minPrice * i / nTable) + (maxPrice * (nTable - i) / nTable));
            }
            this.standAt = this.calcStandAt(pToday, this.divideLines);
            qd = Math.floor(cashOwning * stockRatio / pd);
        }
        else {
            let newStandAt = this.calcStandAt(pToday, this.divideLines);
            if (newStandAt < this.standAt) { // If price rises,
                if (stockHolding.length > 0) {
                    if (newStandAt > 0) { // If price isn't too high, sell a part.
                        while ((stockHolding.length - qs) * ps > cashOwning + qs * ps) {
                            qs++;
                        }
                        qs = Math.min(stockHolding.length, qs);
                    }
                    else
                        qs = stockHolding.length; // If price is too high, sell all out.
                }
            }
            else if (newStandAt > this.standAt) { // If price falls,
                if (newStandAt <= nTable) { // If price isn't too low, buy some.
                    while ((stockHolding.length + qd) * pd < cashOwning - qd * pd) {
                        qd++;
                    }
                }
                else
                    qd = Math.floor(cashOwning / pd); // If price is too low, buy all in.
            }
            this.standAt = newStandAt;
        }
        return {
            "buyOrder": new Order(this.owner, "buy", today, pd, qd),
            "sellOrder": new Order(this.owner, "sell", today, ps, qs)
        };
    }
    calcStandAt(price, aList) {
        let result = 0;
        for (let each of aList) {
            if (price >= each) {
                return result;
            }
            result++;
        }
        return result;
    }
}
export class Chicken extends Strategy {
    constructor(strategyName, owner) {
        super(strategyName, owner);
        this.latestMaxP = -1 * Infinity;
        this.latestMinP = Infinity;
    }
    followStrategy(r, runawayRate, today, cashOwning, stockHolding, pToday) {
        let ps = pToday * this.normalSample(1, 0.033);
        let pd = ps;
        let qd = 0;
        let qs = 0;
        if (stockHolding.length == 0 || today == 1) {
            this.latestMinP = pd;
            this.latestMaxP = pd;
            qd = this.calcQToday(r, cashOwning, pd);
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
            "buyOrder": new Order(this.owner, "buy", today, pd, qd),
            "sellOrder": new Order(this.owner, "sell", today, ps, qs)
        };
    }
    calcQToday(r, cashOwned, pToday) {
        const qIfAllIn = cashOwned / pToday;
        if (qIfAllIn < 1)
            return 0;
        // 3 strategies for deciding multiplier are given:
        let multiplier = r;
        // let multiplier = r * (this.latestMinP / pToday) ** 5;
        // let multiplier = r / (1 + pToday - this.latestMinP);
        let qToday = Math.floor(qIfAllIn * multiplier);
        return qToday > 1 ? qToday : 1;
    }
}
