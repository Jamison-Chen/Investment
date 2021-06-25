export interface Strategy {
    name: string;
    nDays: number;
    dailyQList: number[];
    cumulQList: number[];
    pList: number[];
    cumulInvestCashList: number[];
    cashList: number[];
    rateOfReturnList: number[];
    securMktValList: number[];
    totalAssetsList: number[];
    followStrategy(...args: any[]): void;
}
export class Strategy implements Strategy {
    constructor(strategyName: string, initTotalAsset: number, nDays: number, pList: number[]) {
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
    }
    public recordQuantity(qToday: number, i: number): void {
        this.dailyQList.push(qToday);
        this.cumulQList.push(this.cumulQList[i - 1] + qToday);
    }
    public recordCashFlow(qToday: number, i: number): void {
        let cashDeltaToday = qToday * this.pList[i];
        if (qToday >= 0) {  // buying
            this.cumulInvestCashList.push(this.cumulInvestCashList[i - 1] + cashDeltaToday);
        } else {  // when selling, count average
            this.cumulInvestCashList.push(this.cumulInvestCashList[i - 1] * this.cumulQList[i] / this.cumulQList[i - 1]);
        }
        this.cashList.push(this.cashList[i - 1] - cashDeltaToday);
    }
    public calcRateOfReturn(i: number): void {
        if (this.cumulInvestCashList[i] > 0) {
            this.rateOfReturnList.push((this.securMktValList[i] - this.cumulInvestCashList[i]) / this.cumulInvestCashList[i]);
        } else {
            this.rateOfReturnList.push(0);
        }
    }
    public recordAllInfo(qToday: number, i: number): void {
        if (i == 0) {
            this.cumulInvestCashList = [qToday * this.pList[i]];
            this.cashList = [this.totalAssetsList[i] - qToday * this.pList[i]];
            this.securMktValList = [qToday * this.pList[i]];
            this.rateOfReturnList = [0];
            this.cumulQList = [qToday];
            this.dailyQList = [qToday];
        } else {
            this.recordQuantity(qToday, i);
            this.recordCashFlow(qToday, i);
            this.securMktValList.push(this.cumulQList[i] * this.pList[i]);
            this.calcRateOfReturn(i);
            this.totalAssetsList.push(this.cashList[i] + this.securMktValList[i]);
        }
    }
}
export class BHmixGrid extends Strategy {
    public followStrategy(r: number, startDay: number): void {
        let latestMaxP = this.pList[startDay];
        let latestMinP = this.pList[startDay];
        for (let i = startDay; i < this.nDays; i++) {
            let qToday = 0;
            if (i == 0) {
                qToday = this.calcQToday(this.totalAssetsList[i], this.pList[i], this.pList[i], (1 + r) * this.pList[i]);
            } else {
                if (this.pList[i] < latestMaxP && this.pList[i] < latestMinP) {
                    if (this.cumulQList[i - 1] == 0) {
                        latestMaxP = this.pList[i];
                    }
                    qToday = this.calcQToday(this.cashList[i - 1], this.pList[i], latestMaxP, latestMinP);
                    if (qToday > 0) {
                        latestMinP = this.pList[i];
                    }
                } else if (this.pList[i] > latestMaxP) {
                    // Sell all out
                    qToday = -1 * this.cumulQList[i - 1];
                    latestMaxP = this.pList[i];
                    latestMinP = this.pList[i];
                }
            }
            this.recordAllInfo(qToday, i);
        }
    }
    protected calcQToday(cashOwned: number, pToday: number, latestMaxP: number, latestMinP: number): number {
        let qIfAllIn = cashOwned / pToday;
        // 2 strtegies are given:
        let baseQ = ((latestMinP - pToday) / latestMinP) * qIfAllIn;
        // let baseQ = r * qIfAllIn;

        // a few strtegies are given:
        // let multiplier = latestMaxP / pToday;

        // because 1.313 * tanh(1) ~= 1
        // let multiplier = latestMaxP / (1.313 * Math.tanh(pToday / latestMaxP) * pToday);
        // let multiplier = latestMaxP / (1.738 / Math.exp(1 / (1.81 * (pToday / latestMaxP))) * pToday);
        let multiplier = (40 * (((pToday / latestMaxP) - 1) ** 4)) + 1;
        // let multiplier = 1;
        // let multiplier = pToday/latestMaxP;
        return Math.floor(baseQ * multiplier);
    }
}
export class PlannedBHmixGrid extends BHmixGrid {
    public followStrategy(r: number, startDay: number): void {
        let latestMaxP = this.pList[startDay];
        let latestMinP = this.pList[startDay];
        let buyHistory: any = {};
        for (let i = startDay; i < this.nDays; i++) {
            let qToday = 0;
            if (i == 0) {
                qToday = this.calcQToday(this.totalAssetsList[i], this.pList[i], this.pList[i], (1 + r) * this.pList[i]);
                // round to the 3rd decimal
                let key = Math.round((this.pList[i] + Number.EPSILON) * 1000) / 1000;
                if (buyHistory[`${key}`] == undefined) {
                    buyHistory[`${key}`] = qToday;
                } else {
                    buyHistory[`${key}`] += qToday;
                }
            } else {
                if (this.pList[i] < latestMaxP && this.pList[i] < latestMinP) {
                    if (this.cumulQList[i - 1] == 0) {
                        latestMaxP = this.pList[i];
                    }
                    qToday = this.calcQToday(this.cashList[i - 1], this.pList[i], latestMaxP, latestMinP);
                    if (qToday > 0) {
                        latestMinP = this.pList[i];
                        // round to the 3rd decimal
                        let key = Math.round((this.pList[i] + Number.EPSILON) * 1000) / 1000;
                        if (buyHistory[`${key}`] == undefined) {
                            buyHistory[`${key}`] = qToday;
                        } else {
                            buyHistory[`${key}`] += qToday;
                        }
                    }
                }
                for (let eachP in buyHistory) {
                    let targetSellP = parseFloat(eachP) * (1 + (latestMaxP - parseFloat(eachP) + 0.01 * latestMaxP) / latestMaxP);
                    if (this.pList[i] >= targetSellP) {
                        qToday -= buyHistory[eachP];
                        delete buyHistory[eachP];
                        if (parseFloat(eachP) > latestMinP) {
                            latestMinP = parseFloat(eachP);
                        }
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
export class GridConstQ extends Strategy {
    public followStrategy(maxPrice: number, minPrice: number, nTable: number, startDay: number): void {
        // Draw divide lines
        // numbers in divideLines are in descending order
        let divideLines: number[] = [];
        for (let i = 0; i < nTable + 1; i++) {
            divideLines.push((minPrice * i / nTable) + (maxPrice * (nTable - i) / nTable));
        }

        let standAt = this.calcStandAt(this.pList[startDay], divideLines);
        let qStack: number[] = [];
        for (let i = startDay; i < this.nDays; i++) {
            let qToday = 0;
            if (i == 0) {
                qToday = Math.floor(Math.floor(this.totalAssetsList[i] / this.pList[i]) / (nTable - standAt));
                // (nTable - standAt): 最慘的情形下，你可能會因為價格連跌而連買入幾天?(還有剩下多少目前價格以下的網格?)
                qStack.push(qToday);
            } else {
                let newStandAt = this.calcStandAt(this.pList[i], divideLines);
                if (newStandAt < standAt) { // If price rises,
                    if (this.cumulQList[i - 1] > 0) {
                        if (newStandAt > 0) {   // If price isn't too high, sell a part.
                            let temp = qStack.pop();
                            if (temp) {
                                qToday = -1 * temp;
                            }
                        } else {    // If price is too high, sell all out.
                            qToday = -1 * this.cumulQList[i - 1];
                            qStack = [];
                        }
                    }
                } else if (newStandAt > standAt) {  // If price falls,
                    let qIfAllIn = Math.floor(this.cashList[i - 1] / this.pList[i]);
                    if (newStandAt <= nTable) {  // If price isn't too low, buy some.
                        qToday = Math.floor((qIfAllIn / (nTable - standAt)) * (newStandAt - standAt));
                        // (nTable - standAt): 最慘的情形下，你可能會因為價格連跌而連買入幾天?(還有剩下多少目前價格以下的網格?)
                        // (newStandAt - standAt): 上次所處網格與這次所處網格的距離
                    } else {  // If price is too low, buy all in.
                        qToday = qIfAllIn;
                    }
                    qStack.push(qToday);
                }
                standAt = newStandAt;
            }
            this.recordAllInfo(qToday, i);
        }
    }
    private calcStandAt(price: number, aList: number[]): number {
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
export class GridConstRatio extends Strategy {
    public followStrategy(maxPrice: number, minPrice: number, nTable: number, securityRatio: number, startDay: number): void {
        // Draw divide lines
        // numbers in divideLines are in descending order
        let divideLines: number[] = [];
        for (let i = 0; i < nTable + 1; i++) {
            divideLines.push((minPrice * i / nTable) + (maxPrice * (nTable - i) / nTable));
        }
        let standAt = this.calcStandAt(this.pList[startDay], divideLines);
        for (let i = startDay; i < this.nDays; i++) {
            let qToday = 0;
            if (i == 0) {
                qToday = Math.floor(this.totalAssetsList[i] * securityRatio / this.pList[i]);
            } else {
                let newStandAt = this.calcStandAt(this.pList[i], divideLines);
                if (newStandAt < standAt) { // If price rises,
                    if (this.cumulQList[i - 1] > 0) {
                        if (newStandAt > 0) {   // If price isn't too high, sell a part.
                            while (((this.cumulQList[i - 1] + qToday) * this.pList[i]) > (this.cashList[i - 1] - qToday * this.pList[i])) {
                                qToday--;
                            }
                            qToday = Math.max(-1 * this.cumulQList[i - 1], qToday);
                        } else {    // If price is too high, sell all out.
                            qToday = -1 * this.cumulQList[i - 1];
                        }
                    }
                } else if (newStandAt > standAt) {  // If price falls,
                    let qIfAllIn = Math.floor(this.cashList[i - 1] / this.pList[i]);
                    if (newStandAt <= nTable) {  // If price isn't too low, buy some.
                        while (((this.cumulQList[i - 1] + qToday) * this.pList[i]) < (this.cashList[i - 1] - qToday * this.pList[i])) {
                            qToday++;
                        }
                    } else {  // If price is too low, buy all in.
                        qToday = qIfAllIn;
                    }
                }
                standAt = newStandAt;
            }
            this.recordAllInfo(qToday, i);
        }
    }
    private calcStandAt(price: number, aList: number[]): number {
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
    public followStrategy(r: number, startDay: number, runawayRate: number): void {
        let latestMaxP: number = 0;
        let latestMinP: number = this.pList[startDay];
        let buyHistory: any = {};
        for (let i = startDay; i < this.nDays; i++) {
            let qToday = 0;
            if (i == 0) {
                qToday = this.calcQToday(r, this.totalAssetsList[i], this.pList[i], this.pList[i]);
                // round to the 3rd decimal
                let key = Math.round((this.pList[i] + Number.EPSILON) * 1000) / 1000;
                buyHistory[`${key}`] = qToday;
            } else {
                let maxCostHolding = Object.keys(buyHistory).length > 0 ? Math.max(...Object.keys(buyHistory).map(e => parseFloat(e))) : 0;
                // If price rises, and higher than maxCostHolding, buy in.
                if (this.pList[i] > Math.max(maxCostHolding, latestMaxP)) {
                    qToday = this.calcQToday(r, this.cashList[i - 1], this.pList[i], latestMinP);
                    // round to the 3rd decimal
                    let key = Math.round((this.pList[i] + Number.EPSILON) * 1000) / 1000;
                    if (buyHistory[`${key}`] == undefined) buyHistory[`${key}`] = qToday;
                    else buyHistory[`${key}`] += qToday;
                    latestMaxP = this.pList[i];
                } else if (this.pList[i] < Math.max(maxCostHolding, latestMaxP) * runawayRate) {
                    // } else if (this.pList[i] < this.pList[i - 1]) {
                    for (let eachPrice in buyHistory) {
                        if (buyHistory[eachPrice] > 0) {  // sell all out
                            // if (parseFloat(eachPrice) < this.pList[i]) {  // only sell those who have lower cost
                            qToday -= buyHistory[eachPrice];
                            delete buyHistory[eachPrice];
                        } else delete buyHistory[eachPrice];
                    }
                    latestMinP = this.pList[i];
                    latestMaxP = 0;
                }
            }
            this.recordAllInfo(qToday, i);
        }
    }
    private calcQToday(r: number, cashOwned: number, pToday: number, latestMinP: number): number {
        const qIfAllIn = cashOwned / pToday;
        if (qIfAllIn < 1) return 0;
        // 3 strategies for deciding multiplier are given:
        let multiplier = r;
        // let multiplier = r * (latestMinP / pToday) ** 5;
        // let multiplier = r / (1 + pToday - latestMinP);
        let qToday = Math.floor(qIfAllIn * multiplier)
        return qToday > 1 ? qToday : 1;
    }
}
