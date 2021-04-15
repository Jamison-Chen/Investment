export class Strategy {
    constructor(initTotalAsset, nDays, pList) {
        this.totalAssetsList = [initTotalAsset];
        this.nDays = nDays;
        this.pList = pList;
        this.dailyQList = [];
        this.cumulQList = [];
        this.cumulInvestCashList = [];
        this.cashList = [];
        this.rateOfReturnList = [];
        this.securMktValList = [];
    }
    recordQuantity(qToday, i) {
        this.dailyQList.push(qToday);
        this.cumulQList.push(this.cumulQList[i - 1] + qToday);
    }
    recordCashFlow(qToday, i) {
        let cashDeltaToday = qToday * this.pList[i];
        if (qToday >= 0) { // buying
            this.cumulInvestCashList.push(this.cumulInvestCashList[i - 1] + cashDeltaToday);
        }
        else { // when selling, count average
            this.cumulInvestCashList.push(this.cumulInvestCashList[i - 1] * this.cumulQList[i] / this.cumulQList[i - 1]);
        }
        this.cashList.push(this.cashList[i - 1] - cashDeltaToday);
    }
    calcRateOfReturn(i) {
        if (this.cumulInvestCashList[i] > 0) {
            this.rateOfReturnList.push((this.securMktValList[i] - this.cumulInvestCashList[i]) / this.cumulInvestCashList[i]);
        }
        else {
            this.rateOfReturnList.push(0);
        }
    }
    recordAllInfo(qToday, i) {
        if (i == 0) {
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
            this.calcRateOfReturn(i);
            this.totalAssetsList.push(this.cashList[i] + this.securMktValList[i]);
        }
    }
}
export class BHmixGrid extends Strategy {
    followStrategy(r, startDay) {
        let latestMaxP = this.pList[startDay];
        let latestMinP = this.pList[startDay];
        for (let i = startDay; i < this.nDays; i++) {
            let qToday = 0;
            if (i == 0) {
                qToday = this.calcQToday(this.totalAssetsList[i], this.pList[i], this.pList[i], (1 + r) * this.pList[i]);
            }
            else {
                if (this.pList[i] < latestMaxP && this.pList[i] < latestMinP) {
                    if (this.cumulQList[i - 1] == 0) {
                        latestMaxP = this.pList[i];
                    }
                    qToday = this.calcQToday(this.cashList[i - 1], this.pList[i], latestMaxP, latestMinP);
                    if (qToday > 0) {
                        latestMinP = this.pList[i];
                    }
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
        let baseQ = (latestMinP - pToday) / latestMinP * qIfAllIn;
        // let baseQ = r * qIfAllIn;
        // 5 strtegies are given:
        let multiplier = latestMaxP / pToday;
        // let multiplier = -2 * ((pToday / latestMaxP) ** 2) + 3;
        // let multiplier = -2 * (pToday/latestMaxP) + 3;
        // let multiplier = 1;
        // let multiplier = pToday/latestMaxP;
        return Math.floor(baseQ * multiplier);
    }
}
export class GridConstQ extends Strategy {
    followStrategy(maxPrice, minPrice, nTable, startDay) {
        // Draw divide lines
        // numbers in divideLines are in descending order
        let divideLines = [];
        for (let i = 0; i < nTable + 1; i++) {
            divideLines.push((minPrice * i / nTable) + (maxPrice * (nTable - i) / nTable));
        }
        let standAt = this.calcStandAt(this.pList[startDay], divideLines);
        let qStack = [];
        for (let i = startDay; i < this.nDays; i++) {
            let qToday = 0;
            if (i == 0) {
                qToday = Math.floor(Math.floor(this.totalAssetsList[i] / this.pList[i]) / (nTable - standAt));
                // (nTable - standAt): 最慘的情形下，你可能會因為價格連跌而連買入幾天?(還有剩下多少目前價格以下的網格?)
                qStack.push(qToday);
            }
            else {
                let newStandAt = this.calcStandAt(this.pList[i], divideLines);
                if (newStandAt < standAt) { // If price rises,
                    if (this.cumulQList[i - 1] > 0) {
                        if (newStandAt > 0) { // If price isn't too high, sell a part.
                            let temp = qStack.pop();
                            if (temp) {
                                qToday = -1 * temp;
                            }
                        }
                        else { // If price is too high, sell all out.
                            qToday = -1 * this.cumulQList[i - 1];
                            qStack = [];
                        }
                    }
                }
                else if (newStandAt > standAt) { // If price falls,
                    let qIfAllIn = Math.floor(this.cashList[i - 1] / this.pList[i]);
                    if (newStandAt < nTable) { // If price isn't too low, buy some.
                        qToday = Math.floor((qIfAllIn / (nTable - standAt)) * (newStandAt - standAt));
                        // (nTable - standAt): 最慘的情形下，你可能會因為價格連跌而連買入幾天?(還有剩下多少目前價格以下的網格?)
                        // (newStandAt - standAt): 上次所處網格與這次所處網格的距離
                    }
                    else { // If price is too low, buy all in.
                        qToday = qIfAllIn;
                    }
                    qStack.push(qToday);
                }
                standAt = newStandAt;
            }
            this.recordAllInfo(qToday, i);
        }
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
    followStrategy(r, startDay) {
        let latestMinP = this.pList[startDay];
        let buyHistory = {};
        for (let i = startDay; i < this.nDays; i++) {
            let qToday = 0;
            if (i == 0) {
                qToday = this.calcQToday(r, this.totalAssetsList[i], this.pList[i], this.pList[i]);
            }
            else {
                // If price rises, buy in.
                if (this.pList[i] > this.pList[i - 1]) {
                    qToday = this.calcQToday(r, this.cashList[i - 1], this.pList[i], latestMinP);
                    // round to the 3rd decimal
                    let key = Math.round((this.pList[i] + Number.EPSILON) * 1000) / 1000;
                    if (buyHistory[`${key}`] == undefined) {
                        buyHistory[`${key}`] = qToday;
                    }
                    else {
                        buyHistory[`${key}`] += qToday;
                    }
                    // Once price falls, sell almost all out.
                }
                else if (this.pList[i] < this.pList[i - 1]) {
                    for (let eachPrice in buyHistory) {
                        if (buyHistory[eachPrice] > 0) {
                            if (parseFloat(eachPrice) < this.pList[i]) {
                                qToday -= buyHistory[eachPrice];
                                buyHistory[eachPrice] = 0;
                            }
                            // And slighly lower the lowest price that you're willing to sell.
                            else {
                                let newKey = Math.round((parseFloat(eachPrice) * 0.999 + Number.EPSILON) * 1000) / 1000;
                                // Sometimes newKey will equal the original key, so we have to do it in this way...
                                let tempQ = buyHistory[eachPrice];
                                buyHistory[eachPrice] = 0;
                                buyHistory[`${newKey}`] = tempQ;
                            }
                        }
                    }
                    latestMinP = this.pList[i];
                }
            }
            this.recordAllInfo(qToday, i);
        }
    }
    calcQToday(r, cashOwned, pToday, latestMinP) {
        let qIfAllIn = cashOwned / pToday;
        let baseQ = r * qIfAllIn;
        // 3 strategies for deciding multiplier are given:
        let multiplier = 1;
        // let multiplier = (latestMinP / pToday) ** 5;
        // let multiplier = 1 / (1 + pToday - latestMinP);
        return Math.floor(baseQ * multiplier);
    }
}
