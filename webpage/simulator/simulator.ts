class Strategy {
    public nDays: number;
    public dailyQList: number[];
    public cumulQList: number[];
    public pList: number[];
    public cumulInvestCashList: number[];
    public cashList: number[];
    public rateOfReturnList: number[];
    public securMktValList: number[];
    public totalAssetsList: number[];
    constructor() {
        this.nDays = 0;
        this.dailyQList = [];
        this.cumulQList = [];
        this.pList = [];
        this.cumulInvestCashList = [];
        this.cashList = [];
        this.rateOfReturnList = [];
        this.securMktValList = [];
        this.totalAssetsList = [];
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
        this.recordQuantity(qToday, i);
        this.recordCashFlow(qToday, i);
        this.securMktValList.push(this.cumulQList[i] * this.pList[i]);
        this.calcRateOfReturn(i);
        this.totalAssetsList.push(this.cashList[i] + this.securMktValList[i])
    }
}
export class BHmixGrid extends Strategy {
    public r: number;
    constructor(initTotalAsset: number, nDays: number, pList: number[], r: number) {
        super();
        this.totalAssetsList = [initTotalAsset];
        this.nDays = nDays;
        this.pList = pList;
        this.r = r;
        let p0 = this.pList[0];
        let q0 = this.calcQToday(initTotalAsset, p0, p0, (1 + r) * p0);
        this.cumulInvestCashList = [q0 * p0];
        this.cashList = [initTotalAsset - q0 * p0];
        this.securMktValList = [q0 * p0];
        this.rateOfReturnList = [0];
        this.cumulQList = [q0];
        this.dailyQList = [q0];
    }
    public followStrategy(): void {
        let latestMaxP = this.pList[0];
        let latestMinP = this.pList[0];
        for (let i = 1; i < this.nDays; i++) {
            let qToday = 0;
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
            this.recordAllInfo(qToday, i);
        }
    }
    public calcQToday(cashOwned: number, pToday: number, latestMaxP: number, latestMinP: number): number {
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
    public baseQ: number;
    public maxPrice: number;
    public minPrice: number;
    public nTable: number;
    constructor(initTotalAsset: number, baseQ: number, nDays: number, pList: number[], maxPrice: number, minPrice: number, nTable: number) {
        super();
        this.baseQ = baseQ;
        this.nDays = nDays;
        this.totalAssetsList = [initTotalAsset];
        this.cumulInvestCashList = [baseQ * pList[0]];
        this.cashList = [initTotalAsset - baseQ * pList[0]];
        this.securMktValList = [baseQ * pList[0]];
        this.rateOfReturnList = [0];
        this.pList = pList;
        this.cumulQList = [baseQ];
        this.dailyQList = [baseQ];
        this.maxPrice = maxPrice;
        this.minPrice = minPrice;
        this.nTable = nTable;
    }
    public followStrategy(): void {
        // numbers in divideLines are in descending order
        let divideLines: number[] = [];
        for (let i = 0; i < this.nTable + 1; i++) {
            divideLines.push(this.minPrice * i / this.nTable + this.maxPrice * (this.nTable - i) / this.nTable);
        }
        let standAt = this.calcStandAt(this.pList[0], divideLines);
        for (let i = 1; i < this.nDays; i++) {
            let newStandAt = this.calcStandAt(this.pList[i], divideLines);
            // If price rises, sell.
            let qToday = 0;
            if (newStandAt < standAt) {
                // If price isn't too high
                if (newStandAt > 0) {
                    if (this.cumulQList[i - 1] > 0) {
                        qToday = Math.max(-1 * this.cumulQList[i - 1], -1 * this.baseQ);
                    }
                }
                // If price falls, buy.
            } else if (newStandAt > standAt) {
                // If price isn't too low
                if (newStandAt < this.nTable) {
                    qToday = this.baseQ;
                }
            }
            this.recordAllInfo(qToday, i);
            standAt = newStandAt;
        }
    }
    public calcStandAt(price: number, aList: number[]) {
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
    public r: number;
    constructor(initTotalAsset: number, nDays: number, pList: number[], r: number) {
        super();
        this.totalAssetsList = [initTotalAsset];
        this.nDays = nDays;
        this.pList = pList;
        this.r = r;
        let p0 = this.pList[0];
        let q0 = this.calcQToday(r, initTotalAsset, p0, p0);
        this.cumulInvestCashList = [q0 * p0];
        this.cashList = [initTotalAsset - q0 * p0];
        this.securMktValList = [q0 * p0];
        this.rateOfReturnList = [0];
        this.cumulQList = [q0];
        this.dailyQList = [q0];
    }
    public followStrategy(): void {
        let latestMinP = this.pList[0];
        let buyHistory: any = {};
        for (let i = 1; i < this.nDays; i++) {
            let qToday = 0;
            // If price rises, buy in.
            if (this.pList[i] > this.pList[i - 1]) {
                qToday = this.calcQToday(this.r, this.cashList[i - 1], this.pList[i], latestMinP);
                // round to the 3rd decimal
                let key = Math.round((this.pList[i] + Number.EPSILON) * 1000) / 1000;
                if (buyHistory[`${key}`] == undefined) {
                    buyHistory[`${key}`] = qToday;
                } else {
                    buyHistory[`${key}`] += qToday;
                }
                // Once price falls, sell almost all out.
            } else if (this.pList[i] < this.pList[i - 1]) {
                for (let eachPrice in buyHistory) {
                    if (parseFloat(eachPrice) < this.pList[i]) {
                        qToday -= buyHistory[eachPrice];
                        buyHistory[eachPrice] = 0;
                    }
                }
                latestMinP = this.pList[i];
            }
            this.recordAllInfo(qToday, i);
        }
    }
    public calcQToday(r: number, cashOwned: number, pToday: number, latestMinP: number): number {
        let qIfAllIn = cashOwned / pToday;
        let baseQ = r * qIfAllIn;
        // 3 strategies for deciding multiplier are given:
        // let multiplier = 1
        let multiplier = latestMinP / pToday;
        // let multiplier = (latestMinP / pToday)**2;
        return Math.floor(baseQ * multiplier);
    }
}