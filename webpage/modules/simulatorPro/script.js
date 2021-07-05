import { Individual } from './individual.js';
import { PriceMachine } from './priceMachine.js';
import { Stock } from "./stock.js";
class Main {
    constructor() {
        this.myAssetChartCntnr = document.getElementById("my-asset-chart-container");
        this.myAssetChartHeader = document.getElementById("my-asset-chart-header");
        this.myAssetChart = document.getElementById("my-asset-chart");
        this.animationField = document.getElementById("animation-field");
        this.marketEqChart = document.getElementById("market-eq-chart");
        this.dealAmountChart = document.getElementById("deal-amount-chart");
        this.curveChart = document.getElementById("curve-chart");
        this.startBtn = document.getElementById("start-btn");
        this.resetBtn = document.getElementById("reset-btn");
        this.initTotalCashInput = document.getElementById("init-total-cash");
        this.totalStockInput = document.getElementById("total-stock");
        this.initialEqInput = document.getElementById("initial-eq");
        this.dayToSimulateInput = document.getElementById("day-to-simulate");
        this.pauseTimeInput = document.getElementById("pause-time");
    }
    suffleArray(anArray) {
        for (let i = anArray.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            const temp = anArray[i];
            anArray[i] = anArray[j];
            anArray[j] = temp;
        }
        return anArray;
    }
    avg(arr) {
        return arr.reduce((prev, curr) => prev + curr, 0) / arr.length;
    }
    normalSample(mu, std) {
        let u = 0, v = 0;
        while (u === 0)
            u = Math.random(); //Converting [0,1) to (0,1)
        while (v === 0)
            v = Math.random();
        return std * Math.sqrt(-2.0 * Math.log(u)) * Math.cos(2.0 * Math.PI * v) + mu;
    }
    createNodeDiv(pauseTime) {
        let nodeDiv = document.createElement("div");
        nodeDiv.className = "node";
        nodeDiv.style.width = `${this.nodeDivSize}px`;
        nodeDiv.style.height = `${this.nodeDivSize}px`;
        nodeDiv.style.transitionDuration = `${pauseTime / 2}ms`;
        if (this.animationField != null)
            this.animationField.appendChild(nodeDiv);
        return nodeDiv;
    }
    genName(length) {
        let randomChars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
        let result = "";
        for (let i = 0; i < length; i++) {
            result += randomChars.charAt(Math.floor(Math.random() * randomChars.length));
        }
        return result;
    }
    preset(indiviComposition) {
        if (this.marketEqData != undefined && this.dealAmountData != undefined && this.individualList != undefined && this.initTotalCash != undefined && this.totalStock != undefined && this.initialEq != undefined && this.pauseTime != undefined) {
            // count numOfIndividual
            this.numOfIndividual = 0;
            for (let eachStrategy in indiviComposition) {
                if (eachStrategy != "me")
                    this.numOfIndividual += indiviComposition[eachStrategy].number;
                else
                    this.numOfIndividual++;
            }
            this.pm = new PriceMachine(this.initialEq, this.numOfIndividual);
            // decide the size of each node
            this.nodeDivSize = 0;
            if (this.animationField instanceof HTMLElement) {
                this.nodeDivSize = Math.min(this.animationField.offsetHeight, this.animationField.offsetWidth) / Math.ceil(Math.pow(this.numOfIndividual, 0.35));
                this.animationField.style.gridTemplateColumns = `repeat(auto-fit, minmax(${this.nodeDivSize + 10}px, 1fr))`;
                this.animationField.style.gridTemplateRows = `repeat(auto-fit, ${this.nodeDivSize + 10}px)`;
            }
            // initialize all individuals
            let cashLeft = this.initTotalCash;
            let stockLeft = this.totalStock;
            for (let eachStrategy in indiviComposition) {
                let j = 0;
                if (eachStrategy == "me") {
                    let nodeDiv = this.createNodeDiv(this.pauseTime);
                    nodeDiv.id = "me";
                    nodeDiv.addEventListener("click", () => {
                        var _a;
                        (_a = this.myAssetChartCntnr) === null || _a === void 0 ? void 0 : _a.classList.add("active");
                    });
                    let newName = this.genName(20);
                    let cashOwning = indiviComposition[eachStrategy].initialCash;
                    let stockGot = indiviComposition[eachStrategy].initialStock;
                    cashLeft -= cashOwning;
                    stockLeft -= stockGot;
                    let stockHolding = [];
                    for (let i = 0; i < stockGot; i++)
                        stockHolding.push(new Stock(this.pm.equilibrium, 0));
                    this.me = new Individual(nodeDiv, newName, indiviComposition[eachStrategy].strategySetting, cashOwning, stockHolding);
                    this.individualList.push(this.me);
                    j++;
                }
                else {
                    for (let i = 0; i < indiviComposition[eachStrategy].number; i++) {
                        let nodeDiv = this.createNodeDiv(this.pauseTime);
                        let newName = this.genName(20);
                        let cashOwning;
                        let stockGot;
                        if (j == this.numOfIndividual - 1) {
                            cashOwning = cashLeft;
                            stockGot = stockLeft;
                        }
                        else {
                            cashOwning = Math.min(cashLeft, Math.floor(this.initTotalCash / this.numOfIndividual * Math.max(0, this.normalSample(1, 0.1))));
                            stockGot = Math.min(stockLeft, Math.floor(this.totalStock / this.numOfIndividual * Math.max(0, this.normalSample(1, 1))));
                        }
                        cashLeft -= cashOwning;
                        stockLeft -= stockGot;
                        let stockHolding = [];
                        for (let i = 0; i < stockGot; i++)
                            stockHolding.push(new Stock(this.pm.equilibrium, 0));
                        this.individualList.push(new Individual(nodeDiv, newName, indiviComposition[eachStrategy].strategySetting, cashOwning, stockHolding));
                        j++;
                    }
                }
            }
            // initialize market equillibrium data and deal amount data
            this.marketEqData.push([1, this.pm.equilibrium, this.initialEq]);
            this.dealAmountData.push([1, 0]);
        }
    }
    simulate() {
        if (this.animationField != null && this.marketEqData != undefined && this.dealAmountData != undefined && this.myAssetData != undefined && this.individualList != undefined && this.dayToSimulate != undefined) {
            let today = this.marketEqData.length - 1;
            // everyone update market info and make order
            this.everyoneUpdInfoAndOrder(today);
            // suffle individual list before matching
            this.individualList = this.suffleArray(this.individualList);
            // buy-side queue & sell-side queue
            let buySideOrderQueue = [];
            let sellSideOrderQueue = [];
            for (let eachOne of this.individualList) {
                if (eachOne.orderToday != undefined) {
                    if (eachOne.orderToday.buyOrder.quantity > 0)
                        buySideOrderQueue.push(eachOne.orderToday.buyOrder);
                    if (eachOne.orderToday.sellOrder.quantity > 0)
                        sellSideOrderQueue.push(eachOne.orderToday.sellOrder);
                }
            }
            // sort the buy-side queue in the bid-price descending order
            buySideOrderQueue.sort(function (a, b) {
                return b.price - a.price;
            });
            // sort the sell-side queue in the ask-price ascending order
            sellSideOrderQueue.sort(function (a, b) {
                return a.price - b.price;
            });
            // prepare demand/supply curve data
            let curveData = this.prepareCurveData(buySideOrderQueue, sellSideOrderQueue);
            this.applyCurveChart(curveData);
            // matching buy-side order and sell-side order
            this.matching(today, buySideOrderQueue, sellSideOrderQueue);
            if (today <= this.dayToSimulate) {
                this.applyMarketEqChart(this.marketEqData);
                this.applyDealAmountChart(this.dealAmountData);
                this.applyAssetsCharts(this.myAssetData);
                setTimeout(() => { this.simulate(); }, this.pauseTime);
            }
            else {
                this.showIndividualInfo();
                this.enableControl();
                return;
            }
        }
    }
    everyoneUpdInfoAndOrder(today) {
        if (this.marketEqData != undefined && this.individualList != undefined && this.pm != undefined) {
            for (let eachOne of this.individualList) {
                let valAssessed = this.pm.genAssessedVal(true);
                let latestPrice = this.marketEqData.slice(-1)[0].slice(-1)[0];
                if (typeof latestPrice == "string")
                    latestPrice = parseFloat(latestPrice);
                eachOne.updateMktInfo(today, valAssessed, latestPrice);
                eachOne.makeOrder();
            }
        }
    }
    matching(today, buySideOrderQueue, sellSideOrderQueue) {
        let i = 0;
        let j = 0;
        let totalDealQ = 0;
        let finalDealPrice = undefined;
        let dealPair = [];
        let valid = buySideOrderQueue.length > i &&
            sellSideOrderQueue.length > j &&
            buySideOrderQueue[i].price >= sellSideOrderQueue[j].price;
        while (valid) {
            let dealQ = Math.min(buySideOrderQueue[i].quantity, sellSideOrderQueue[j].quantity);
            buySideOrderQueue[i].quantity -= dealQ;
            sellSideOrderQueue[j].quantity -= dealQ;
            if (buySideOrderQueue[i].owner != sellSideOrderQueue[j].owner) {
                totalDealQ += dealQ;
                dealPair.push({ "buySide": buySideOrderQueue[i].owner, "sellSide": sellSideOrderQueue[j].owner, "q": dealQ });
                finalDealPrice = this.avg([buySideOrderQueue[i].price, sellSideOrderQueue[j].price]);
            }
            if (buySideOrderQueue[i].quantity == 0)
                i++;
            if (sellSideOrderQueue[j].quantity == 0)
                j++;
            valid =
                buySideOrderQueue.length > i &&
                    sellSideOrderQueue.length > j &&
                    buySideOrderQueue[i].price >= sellSideOrderQueue[j].price;
        }
        if (this.marketEqData != undefined && this.dealAmountData != undefined && this.myAssetData != undefined && this.pm != undefined && this.me != undefined) {
            if (finalDealPrice == undefined) {
                let oldPrice = this.marketEqData[this.marketEqData.length - 1][2];
                if (typeof oldPrice == "number")
                    finalDealPrice = oldPrice;
                else
                    finalDealPrice = parseFloat(oldPrice);
            }
            for (let eachDealPair of dealPair) {
                this.deal(eachDealPair.buySide, eachDealPair.sellSide, eachDealPair.q, finalDealPrice, today);
            }
            this.marketEqData.push([this.marketEqData.length, this.pm.equilibrium, finalDealPrice]);
            this.dealAmountData.push([this.marketEqData.length, totalDealQ]);
            // record my asset data
            this.myAssetData.push([this.marketEqData.length, this.me.calcTotalAsset(finalDealPrice), this.me.calcStockMktVal(finalDealPrice), this.me.cashOwning]);
        }
    }
    deal(buyer, seller, dealQ, dealP, today) {
        let s = seller.sellOut(dealQ, dealP);
        buyer.buyIn(s, dealP, today);
    }
    showIndividualInfo() {
        if (this.marketEqData != undefined && this.individualList != undefined) {
            for (let each of this.individualList) {
                let finalPrice = this.marketEqData[this.marketEqData.length - 1][2];
                if (typeof finalPrice == "string")
                    finalPrice = parseFloat(finalPrice);
                let info = document.createElement("div");
                let i1 = document.createElement("div");
                i1.innerHTML = `${each.initialHolding}, ${each.tradeAmount}, ${each.stockHolding.length}`;
                info.appendChild(i1);
                let i2 = document.createElement("div");
                i2.innerHTML = `${each.initialTotalAsset}, ${each.calcReturn(finalPrice)}`;
                info.appendChild(i2);
                each.divControlled.appendChild(info);
            }
        }
    }
    prepareCurveData(buySideOrderQueue, sellSideOrderQueue) {
        if (this.initialEq != undefined) {
            let maxNumInChart = this.initialEq * 2;
            let minNumInChart = 0;
            let delta = maxNumInChart - minNumInChart;
            let priceSequence = [];
            for (let i = 0; i < 50; i++)
                priceSequence.push(minNumInChart + delta / 50 * i);
            let curveData = [["price", "D", "S"]];
            for (let each of priceSequence) {
                let qd = 0;
                let qs = 0;
                for (let eachOrder of buySideOrderQueue) {
                    if (eachOrder.price >= each)
                        qd += eachOrder.quantity;
                }
                for (let eachOrder of sellSideOrderQueue) {
                    if (eachOrder.price <= each)
                        qs += eachOrder.quantity;
                }
                curveData.push([each, qd, qs]);
            }
            return curveData;
        }
        else
            throw "initialEq undefined while preparing curve data";
    }
    applyMarketEqChart(dataIn) {
        if (this.marketEqChart != null) {
            google.charts.load('current', { 'packages': ["corechart"] });
            let options = {
                title: 'Given Price vs. Market Equilibrium',
                titleTextStyle: {
                    fontSize: 16,
                    bold: false,
                    color: "#777"
                },
                curveType: 'none',
                width: this.marketEqChart.offsetWidth,
                height: this.marketEqChart.offsetHeight
            };
            google.charts.setOnLoadCallback(() => this.drawSimulatedChart(dataIn, options, "LineChart", this.marketEqChart));
        }
    }
    applyDealAmountChart(dataIn) {
        if (this.dealAmountChart != null) {
            google.charts.load('current', { 'packages': ["corechart"] });
            let options = {
                title: 'Deal Amount',
                titleTextStyle: {
                    fontSize: 16,
                    bold: false,
                    color: "#777"
                },
                width: this.dealAmountChart.offsetWidth,
                height: this.dealAmountChart.offsetHeight,
                legend: { position: "none" },
                series: { 0: { color: "#888" } }
            };
            google.charts.setOnLoadCallback(() => this.drawSimulatedChart(dataIn, options, "ColumnChart", this.dealAmountChart));
        }
    }
    applyCurveChart(dataIn) {
        if (this.curveChart != null) {
            google.charts.load('current', { 'packages': ["corechart"] });
            let options = {
                title: 'Demand / Supply Curve',
                titleTextStyle: {
                    fontSize: 14,
                    bold: false,
                    color: "#777"
                },
                curveType: 'none',
                width: this.curveChart.offsetWidth,
                height: this.curveChart.offsetHeight,
                vAxis: { title: 'Q' },
                hAxis: { title: 'P' }
            };
            google.charts.setOnLoadCallback(() => this.drawSimulatedChart(dataIn, options, "LineChart", this.curveChart));
        }
    }
    applyAssetsCharts(dataIn) {
        if (this.myAssetChart != null) {
            google.charts.load('current', { 'packages': ["corechart"] });
            let options = {
                title: "My Asset",
                titleTextStyle: {
                    fontSize: 16,
                    bold: false,
                    color: "#777"
                },
                curveType: 'none',
                width: this.myAssetChart.offsetWidth * 0.98,
                height: this.myAssetChart.offsetHeight * 0.98,
            };
            google.charts.setOnLoadCallback(() => this.drawSimulatedChart(dataIn, options, "LineChart", this.myAssetChart));
        }
    }
    drawSimulatedChart(dataIn, options, chartType, targetDiv) {
        let data = google.visualization.arrayToDataTable(dataIn);
        let chart = new google.visualization[chartType](targetDiv);
        chart.draw(data, options);
    }
    enableControl() {
        if (this.startBtn instanceof HTMLButtonElement && this.initTotalCashInput instanceof HTMLInputElement && this.totalStockInput instanceof HTMLInputElement && this.initialEqInput instanceof HTMLInputElement && this.dayToSimulateInput instanceof HTMLInputElement && this.pauseTimeInput instanceof HTMLInputElement) {
            this.startBtn.disabled = false;
            this.initTotalCashInput.disabled = false;
            this.totalStockInput.disabled = false;
            this.initialEqInput.disabled = false;
            this.dayToSimulateInput.disabled = false;
            this.pauseTimeInput.disabled = false;
        }
    }
    main() {
        if (this.initTotalCashInput instanceof HTMLInputElement && this.totalStockInput instanceof HTMLInputElement && this.initialEqInput instanceof HTMLInputElement && this.dayToSimulateInput instanceof HTMLInputElement && this.pauseTimeInput instanceof HTMLInputElement) {
            this.initTotalCashInput.value = "1000000";
            this.totalStockInput.value = "100000";
            this.initialEqInput.value = "10";
            this.dayToSimulateInput.value = "250";
            this.pauseTimeInput.value = "3";
        }
        if (this.startBtn instanceof HTMLButtonElement) {
            this.startBtn.addEventListener("click", () => {
                if (this.startBtn instanceof HTMLButtonElement && this.animationField != null) {
                    this.animationField.innerHTML = "";
                    this.marketEqData = [["Day", "Given Price", "Mkt. Eq."]];
                    this.dealAmountData = [["Day", "Deal Amount"]];
                    this.myAssetData = [["Day", "Total Asset", "Stock Mkt Val", "Cash Holding"]];
                    this.individualList = [];
                    this.startBtn.disabled = true;
                    if (this.initTotalCashInput instanceof HTMLInputElement && this.totalStockInput instanceof HTMLInputElement && this.initialEqInput instanceof HTMLInputElement && this.dayToSimulateInput instanceof HTMLInputElement && this.pauseTimeInput instanceof HTMLInputElement) {
                        this.initTotalCash = parseInt(this.initTotalCashInput.value);
                        this.totalStock = parseInt(this.totalStockInput.value);
                        this.initialEq = parseInt(this.initialEqInput.value);
                        this.dayToSimulate = parseInt(this.dayToSimulateInput.value);
                        this.pauseTime = parseInt(this.pauseTimeInput.value);
                        this.initTotalCashInput.disabled = true;
                        this.totalStockInput.disabled = true;
                        this.initialEqInput.disabled = true;
                        this.dayToSimulateInput.disabled = true;
                        this.pauseTimeInput.disabled = true;
                        this.indiviComposition = {
                            "me": {
                                // "strategySetting": {
                                //     "name": "PriceChaser"
                                // },
                                "strategySetting": {
                                    "name": "Chicken",
                                    "r": 0.2,
                                    "runawayRate": 0.9
                                },
                                "initialCash": 1000,
                                "initialStock": 0
                            },
                            "ValueFollower": {
                                "number": 9,
                                "strategySetting": {
                                    "name": "ValueFollower"
                                }
                            },
                            "PriceChaser": {
                                "number": 80,
                                "strategySetting": {
                                    "name": "PriceChaser"
                                }
                            },
                            "BHmixGrid": {
                                "number": 0,
                                "strategySetting": {
                                    "name": "BHmixGrid",
                                    "r": 0.1
                                }
                            },
                            "GridConstRatio": {
                                "number": 0,
                                "strategySetting": {
                                    "name": "GridConstRatio",
                                    "maxPrice": 30,
                                    "minPrice": 3,
                                    "nTable": 100,
                                    "stockRatio": 0.5
                                }
                            },
                            "Chicken": {
                                "number": 10,
                                "strategySetting": {
                                    "name": "Chicken",
                                    "r": 0.2,
                                    "runawayRate": 0.85
                                }
                            }
                        };
                        this.preset(this.indiviComposition);
                        this.simulate();
                    }
                }
            });
        }
        if (this.myAssetChartCntnr != null && this.myAssetChartHeader != null) {
            this.myAssetChartHeader.addEventListener("click", () => {
                var _a;
                (_a = this.myAssetChartCntnr) === null || _a === void 0 ? void 0 : _a.classList.remove("active");
            });
        }
        if (this.resetBtn != null)
            this.resetBtn.addEventListener("click", () => { location.reload(); });
    }
}
let main = new Main();
main.main();
