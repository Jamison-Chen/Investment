class Strategy {
    public dailyQList: number[];
    public cumulQList: number[];
    public pList: number[];
    public cumulInvestCashList: number[];
    public cashList: number[];
    public rateOfReturnList: number[];
    public securMktValList: number[];
    public totalAssetsList: number[];
    constructor() {
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
    public nDays: number;
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
        let latestMaxP = this.pList[0];
        let latestMinP = this.pList[0];
        for (let i = 1; i < this.nDays; i++) {
            let qToday = 0;
            if (this.pList[i] < latestMaxP && this.pList[i] < latestMinP) {
                if (this.cumulQList[i - 1] == 0) {
                    latestMaxP = this.pList[i];
                }
                qToday = this.calcQToday(this.r, this.cashList[i - 1], this.pList[i], latestMaxP);
                latestMinP = this.pList[i];
            } else if (this.pList[i] > latestMaxP) {
                // Sell all out
                qToday = -1 * this.cumulQList[i - 1];
                latestMaxP = this.pList[i];
                latestMinP = this.pList[i];
            }
            this.recordAllInfo(qToday, i);
        }
    }
    public calcQToday(r: number, cashOwned: number, pToday: number, latestMaxP: number): number {
        let qIfAllIn = cashOwned / pToday;
        let baseQ = r * qIfAllIn;
        // 5 strtegies are given:
        let multiplier = latestMaxP / pToday;
        // let multiplier = -2 * ((pToday / latestMaxP) ** 2) + 3;
        // let multiplier = -2 * (pToday/latestMaxP) + 3;
        // let multiplier = 1;
        // let multiplier = pToday/latestMaxP;
        return Math.floor(baseQ * multiplier);
    }
}