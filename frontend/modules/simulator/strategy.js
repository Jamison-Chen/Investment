export class Strategy {
    constructor(strategyName, initTotalAsset, nDays, pList) {
        this.name = strategyName;
        this.totalAssetsList = [initTotalAsset];
        this.nDays = nDays;
        this.pList = pList;
        this.dailyQList = [];
        this.cumulQList = [];
        this.cumulInvestCashList = [];
        this.cashList = [];
        this.rateOfReturnList = [];
        this.securMktValList = [];
        this.buyHistory = {};
    }
    recordQuantity(qToday, i) {
        this.dailyQList.push(qToday);
        this.cumulQList.push(this.cumulQList[i - 1] + qToday);
    }
    recordCashFlow(qToday, i) {
        let cashDeltaToday = qToday * this.pList[i];
        if (qToday >= 0) { // buying
            this.cumulInvestCashList.push(this.cumulInvestCashList[i - 1] + cashDeltaToday);
            this.cashList.push(this.cashList[i - 1] - cashDeltaToday * 1.001425);
        }
        else { // when selling, count average
            this.cumulInvestCashList.push(this.cumulInvestCashList[i - 1] * this.cumulQList[i] / this.cumulQList[i - 1]);
            this.cashList.push(this.cashList[i - 1] - cashDeltaToday * 0.995575);
        }
    }
    // public calcRateOfReturn(i: number): void {
    //     if (this.cumulInvestCashList[i] > 0) {
    //         this.rateOfReturnList.push((this.securMktValList[i] - this.cumulInvestCashList[i]) / this.cumulInvestCashList[i]);
    //     } else this.rateOfReturnList.push(0);
    // }
    recordBuyHistory(qToday, i) {
        if (qToday > 0) {
            // round to the 2nd decimal
            let key = Math.round((this.pList[i] + Number.EPSILON) * 100) / 100;
            if (this.buyHistory[`${key}`] === undefined)
                this.buyHistory[`${key}`] = qToday;
            else
                this.buyHistory[`${key}`] += qToday;
        }
    }
    recordAllInfo(qToday, i) {
        if (i === 0) {
            this.cumulInvestCashList = [qToday * this.pList[i]];
            this.cashList = [this.totalAssetsList[i] - qToday * this.pList[i]];
            this.securMktValList = [qToday * this.pList[i]];
            this.rateOfReturnList = [0];
            this.cumulQList = [qToday];
            this.dailyQList = [qToday];
        }
        else {
            this.recordQuantity(qToday, i);
            this.recordCashFlow(qToday, i);
            this.securMktValList.push(this.cumulQList[i] * this.pList[i]);
            // this.calcRateOfReturn(i);
            this.totalAssetsList.push(this.cashList[i] + this.securMktValList[i]);
        }
        this.recordBuyHistory(qToday, i);
    }
}
export class BHmixGrid extends Strategy {
    followStrategy(r, startDay) {
        let latestMaxP = this.pList[startDay];
        let latestMinP = this.pList[startDay];
        for (let i = startDay; i < this.nDays; i++) {
            let qToday = 0;
            if (i === startDay) {
                qToday = this.calcQToday(this.totalAssetsList[i], this.pList[i], this.pList[i], (1 + r) * this.pList[i]);
            }
            else {
                if (this.pList[i] < latestMaxP && this.pList[i] < latestMinP) {
                    if (this.cumulQList[i - 1] === 0)
                        latestMaxP = this.pList[i];
                    qToday = this.calcQToday(this.cashList[i - 1], this.pList[i], latestMaxP, latestMinP);
                    if (qToday > 0)
                        latestMinP = this.pList[i];
                }
                else if (this.pList[i] > latestMaxP) {
                    // Sell all out
                    qToday = -1 * this.cumulQList[i - 1];
                    latestMaxP = this.pList[i];
                    latestMinP = this.pList[i];
                }
            }
            this.recordAllInfo(qToday, i);
        }
    }
    calcQToday(cashOwned, pToday, latestMaxP, latestMinP) {
        let qIfAllIn = cashOwned / pToday;
        // 2 strtegies are given:
        let baseQ = ((latestMinP - pToday) / latestMinP) * qIfAllIn;
        // let baseQ = r * qIfAllIn;
        // a few strtegies are given:
        // let multiplier = latestMaxP / pToday;
        // because 1.313 * tanh(1) ~= 1
        // let multiplier = latestMaxP / (1.313 * Math.tanh(pToday / latestMaxP) * pToday);
        // let multiplier = latestMaxP / (1.738 / Math.exp(1 / (1.81 * (pToday / latestMaxP))) * pToday);
        let multiplier = (40 * (Math.pow(((pToday / latestMaxP) - 1), 4))) + 1;
        // let multiplier = 1;
        // let multiplier = pToday/latestMaxP;
        return Math.floor(baseQ * multiplier);
    }
}
export class PlannedBHmixGrid extends BHmixGrid {
    followStrategy(r, startDay) {
        let latestMaxP = this.pList[startDay];
        let latestMinP = this.pList[startDay];
        for (let i = startDay; i < this.nDays; i++) {
            let qToday = 0;
            if (i === startDay) {
                qToday = this.calcQToday(this.totalAssetsList[i], this.pList[i], this.pList[i], (1 + r) * this.pList[i]);
            }
            else {
                if (this.pList[i] < latestMaxP && this.pList[i] < latestMinP) {
                    if (this.cumulQList[i - 1] === 0)
                        latestMaxP = this.pList[i];
                    qToday = this.calcQToday(this.cashList[i - 1], this.pList[i], latestMaxP, latestMinP);
                    latestMinP = this.pList[i];
                }
                for (let eachP in this.buyHistory) {
                    let targetSellP = parseFloat(eachP) * (1 + (latestMaxP - parseFloat(eachP) + 0.01 * latestMaxP) / latestMaxP);
                    if (this.pList[i] >= targetSellP) {
                        qToday -= this.buyHistory[eachP];
                        delete this.buyHistory[eachP];
                        if (parseFloat(eachP) > latestMinP)
                            latestMinP = parseFloat(eachP);
                    }
                }
                if (this.pList[i] > latestMaxP) {
                    latestMaxP = this.pList[i];
                    latestMinP = this.pList[i];
                }
            }
            this.recordAllInfo(qToday, i);
        }
    }
}
// export class GridConstQ extends Strategy {
//     public followStrategy(maxPrice: number, minPrice: number, nTable: number, startDay: number): void {
//         // Draw divide lines
//         // numbers in divideLines are in descending order
//         let divideLines: number[] = [];
//         for (let i = 0; i < nTable; i++) {
//             divideLines.push((minPrice * i + maxPrice * (nTable - i)) / nTable);
//         }
//         let standAt = this.calcStandAt(this.pList[startDay], divideLines);
//         let qStack: number[] = [];
//         for (let i = startDay; i < this.nDays; i++) {
//             let qToday = 0;
//             if (i === startDay) {
//                 qToday = Math.floor(Math.floor(this.totalAssetsList[i] / this.pList[i]) / (nTable - standAt));
//                 // (nTable - standAt): 最慘的情形下，你可能會因為價格連跌而連買入幾天?(還有剩下多少目前價格以下的網格?)
//                 qStack.push(qToday);
//             } else {
//                 let newStandAt = this.calcStandAt(this.pList[i], divideLines);
//                 if (newStandAt < standAt) { // If price rises,
//                     if (this.cumulQList[i - 1] > 0) {
//                         if (newStandAt > 0) {   // If price isn't too high, sell a part.
//                             let temp = qStack.pop();
//                             if (temp) qToday = -1 * temp;
//                         } else {    // If price is too high, sell all out.
//                             qToday = -1 * this.cumulQList[i - 1];
//                             qStack = [];
//                         }
//                     }
//                 } else if (newStandAt > standAt) {  // If price falls,
//                     let qIfAllIn = Math.floor(this.cashList[i - 1] / this.pList[i]);
//                     if (newStandAt < nTable) {  // If price isn't too low, buy some.
//                         qToday = Math.floor((qIfAllIn / (nTable - standAt)) * (newStandAt - standAt));
//                         // (nTable - standAt): 最慘的情形下，你可能會因為價格連跌而連買入幾天?
//                         // (還有剩下多少目前價格以下的網格?)
//                         // (newStandAt - standAt): 上次所處網格與這次所處網格的距離
//                     } else qToday = qIfAllIn;  // If price is too low, buy all in.
//                     qStack.push(qToday);
//                 }
//                 standAt = newStandAt;
//             }
//             this.recordAllInfo(qToday, i);
//         }
//     }
//     private calcStandAt(price: number, aList: number[]): number {
//         let result = 0;
//         for (let each of aList) {
//             if (price >= each) return result;
//             result++;
//         }
//         return result;
//     }
// }
export class CRG extends Strategy {
    followStrategy(sensitivity, securityRatio, startDay) {
        let latestTradePrice = 0;
        for (let i = startDay; i < this.nDays; i++) {
            let qToday = 0;
            if (i === startDay) {
                qToday = Math.floor(this.totalAssetsList[i] * securityRatio / this.pList[i]);
            }
            else {
                let priceRiseRate = (this.pList[i] - latestTradePrice) / latestTradePrice;
                let priceFallRate = (this.pList[i] - latestTradePrice) / this.pList[i];
                if (priceRiseRate >= sensitivity) { // If price rises,
                    if (this.cumulQList[i - 1] > 0) {
                        while (((this.cumulQList[i - 1] + qToday) * this.pList[i]) > (this.cashList[i - 1] - qToday * this.pList[i])) {
                            qToday--;
                        }
                        qToday = Math.max(-1 * this.cumulQList[i - 1], qToday);
                    }
                }
                else if (priceFallRate <= sensitivity * -1) { // If price falls,
                    while (((this.cumulQList[i - 1] + qToday) * this.pList[i]) < (this.cashList[i - 1] - qToday * this.pList[i])) {
                        qToday++;
                    }
                }
            }
            if (qToday != 0)
                latestTradePrice = this.pList[i];
            this.recordAllInfo(qToday, i);
        }
    }
}
export class CRG2 extends Strategy {
    followStrategy(sensitivity, securityRatio, startDay) {
        let minPriceSinceLastTrade = 0;
        let maxPriceSinceLastTrade = 0;
        let lastAllOutPrice = 0;
        for (let i = startDay; i < this.nDays; i++) {
            let qToday = 0;
            if (i === startDay) {
                qToday = Math.floor(this.totalAssetsList[i] * securityRatio / this.pList[i]);
            }
            else if (this.cumulQList[i - 1] === 0 && this.pList[i] > lastAllOutPrice) {
                qToday = Math.floor(this.totalAssetsList[i - 1] * securityRatio / this.pList[i]);
            }
            else if (this.pList[i] < this.cumulInvestCashList[i - 1] / this.cumulQList[i - 1] * 0.95) {
                lastAllOutPrice = this.cumulInvestCashList[i - 1] / this.cumulQList[i - 1];
                qToday = -1 * this.cumulQList[i - 1];
            }
            else {
                let priceRiseRate = (this.pList[i] - minPriceSinceLastTrade) / minPriceSinceLastTrade;
                let priceFallRate = (this.pList[i] - maxPriceSinceLastTrade) / this.pList[i];
                if (priceRiseRate >= sensitivity) { // If price rises,
                    if (this.cumulQList[i - 1] > 0) {
                        while (((this.cumulQList[i - 1] + qToday) * this.pList[i]) > (this.cashList[i - 1] - qToday * this.pList[i])) {
                            qToday--;
                        }
                        qToday = Math.max(-1 * this.cumulQList[i - 1], qToday);
                    }
                }
                else if (priceFallRate <= sensitivity * -1) { // If price falls,
                    while (((this.cumulQList[i - 1] + qToday) * this.pList[i]) < (this.cashList[i - 1] - qToday * this.pList[i])) {
                        qToday++;
                    }
                }
            }
            minPriceSinceLastTrade = Math.min(minPriceSinceLastTrade, this.pList[i]);
            maxPriceSinceLastTrade = Math.max(maxPriceSinceLastTrade, this.pList[i]);
            if (qToday != 0) {
                minPriceSinceLastTrade = this.pList[i];
                maxPriceSinceLastTrade = this.pList[i];
            }
            this.recordAllInfo(qToday, i);
        }
    }
}
export class Chicken extends Strategy {
    followStrategy(r, startDay, runawayRate) {
        let latestMaxP = 0;
        let latestMinP = this.pList[startDay];
        for (let i = startDay; i < this.nDays; i++) {
            let qToday = 0;
            if (i === startDay)
                qToday = this.calcQToday(r, this.totalAssetsList[i], this.pList[i], this.pList[i]);
            else {
                let maxCostHolding = Object.keys(this.buyHistory).length > 0 ? Math.max(...Object.keys(this.buyHistory).map(e => parseFloat(e))) : 0;
                // If price rises, and higher than maxCostHolding, buy in.
                if (this.pList[i] > Math.max(maxCostHolding, latestMaxP)) {
                    qToday = this.calcQToday(r, this.cashList[i - 1], this.pList[i], latestMinP);
                    latestMaxP = this.pList[i];
                }
                else if (this.pList[i] < Math.max(maxCostHolding, latestMaxP) * runawayRate) {
                    // } else if (this.pList[i] < this.pList[i - 1]) {
                    for (let eachPrice in this.buyHistory) {
                        if (this.buyHistory[eachPrice] > 0) { // sell all out
                            // if (parseFloat(eachPrice) < this.pList[i]) {  // only sell those with lower buy-in costs
                            qToday -= this.buyHistory[eachPrice];
                            delete this.buyHistory[eachPrice];
                        }
                        else
                            delete this.buyHistory[eachPrice];
                    }
                    latestMinP = this.pList[i];
                    latestMaxP = 0;
                }
            }
            this.recordAllInfo(qToday, i);
        }
    }
    calcQToday(r, cashOwned, pToday, latestMinP) {
        const qIfAllIn = cashOwned / pToday;
        if (qIfAllIn < 1)
            return 0;
        // 3 strategies for deciding multiplier are given:
        let multiplier = r;
        // let multiplier = r * (latestMinP / pToday) ** 5;
        // let multiplier = r / (1 + pToday - latestMinP);
        let qToday = Math.floor(qIfAllIn * multiplier);
        return qToday > 1 ? qToday : 1;
    }
}
