import { Individual } from './individual.js';
import { PriceMachine } from './priceMachine.js';
import { Stock } from "./stock.js";
import { MyMath } from "./myMath.js";
import { MyGoogleChart } from "./chart.js";
class Main {
    constructor() {
        this.STRATEGIES = {
            "value-follower": {
                "displayedName": "ValueFollower",
                "otherDetails": []
            },
            "price-chaser": {
                "displayedName": "PriceChaser",
                "otherDetails": []
            },
            "bh-mix-grid": {
                "displayedName": "BHmixGrid",
                "otherDetails": ["r"]
            },
            "grid-const-ratio": {
                "displayedName": "GridConstRatio",
                "otherDetails": ["max-price", "min-price", "n-table", "stock-ratio"]
            },
            "chicken": {
                "displayedName": "Chicken",
                "otherDetails": ["r", "runaway-rate"]
            }
        };
        this.startBtn = document.getElementById("start-btn");
        this.resetBtn = document.getElementById("reset-btn");
        this.recorderOption = document.getElementById("recorder-option");
        this.simulatorOption = document.getElementById("simulator-option");
        this.simulatorProOption = document.getElementById("simulator-pro-option");
        this.settingBtn = document.getElementById("setting-btn");
        this.settingBg = document.getElementById("setting-background");
        this.settingCntnr = document.getElementById("setting-container");
        this.allSettingHeaderTabs = document.getElementsByClassName("setting-header-tab");
        this.settingHeaderGeneral = document.getElementById("setting-header-general");
        this.settingHeaderCompose = document.getElementById("setting-header-compose");
        this.settingHeaderIndi = document.getElementById("setting-header-individual");
        this.allParamFields = document.getElementsByClassName("parameter-field");
        this.generalParamField = document.getElementById("general-parameter-field");
        this.initTotalCashInput = document.getElementById("init-total-cash");
        this.totalStockInput = document.getElementById("total-stock");
        this.initialEqInput = document.getElementById("initial-eq");
        this.dayToSimulateInput = document.getElementById("day-to-simulate");
        this.pauseTimeInput = document.getElementById("pause-time");
        this.composeParamField = document.getElementById("compose-parameter-field");
        this.myselfParamField = document.getElementById("myself-parameter-field");
        this.detailCntnr = document.getElementById("detail-container");
        this.allDetailFields = document.getElementsByClassName("detail-field");
        this.settingFooter = document.getElementById("setting-footer");
        this.myAssetChartCntnr = document.getElementById("my-asset-chart-container");
        this.myAssetChartHeader = document.getElementById("my-asset-chart-header");
        this.myAssetChart = document.getElementById("my-asset-chart");
        this.animationField = document.getElementById("animation-field");
        this.marketEqChart = document.getElementById("market-eq-chart");
        this.dealAmountChart = document.getElementById("deal-amount-chart");
        this.curveChart = document.getElementById("curve-chart");
    }
    createNodeDiv(pauseTime) {
        let nodeDiv = document.createElement("div");
        nodeDiv.className = "node";
        nodeDiv.style.width = `${this.nodeDivSize}px`;
        nodeDiv.style.height = `${this.nodeDivSize}px`;
        nodeDiv.style.transitionDuration = `${pauseTime / 2}ms`;
        if (this.animationField !== null)
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
    applyAllSetting() {
        if (this.marketEqData !== undefined && this.dealAmountData !== undefined && this.individualList !== undefined && this.initTotalCash !== undefined && this.totalStock !== undefined && this.initialEq !== undefined && this.pauseTime !== undefined) {
            // count numOfIndividual
            this.numOfIndividual = 1; // one for myself(me)
            for (let eachStrategy in this.indiviComposition) {
                this.numOfIndividual += this.indiviComposition[eachStrategy].number;
            }
            this.pm = new PriceMachine(this.initialEq, this.numOfIndividual);
            // decide the size of each node
            this.nodeDivSize = 0;
            if (this.animationField instanceof HTMLElement) {
                this.nodeDivSize = Math.min(this.animationField.offsetHeight, this.animationField.offsetWidth) / Math.ceil(Math.pow(this.numOfIndividual, 0.35));
                this.animationField.style.gridTemplateColumns = `repeat(auto-fit, minmax(${this.nodeDivSize + 10}px, 1fr))`;
                this.animationField.style.gridTemplateRows = `repeat(auto-fit, ${this.nodeDivSize + 10}px)`;
            }
            let cashLeft = this.initTotalCash;
            let stockLeft = this.totalStock;
            // initialize myself(me)
            let nodeDiv = this.createNodeDiv(this.pauseTime);
            nodeDiv.id = "me";
            nodeDiv.addEventListener("click", () => {
                var _a;
                (_a = this.myAssetChartCntnr) === null || _a === void 0 ? void 0 : _a.classList.add("active");
            });
            let newName = this.genName(20);
            let cashOwning = this.myselfSetting.initialCash;
            let stockGot = this.myselfSetting.initialStock;
            cashLeft -= cashOwning;
            stockLeft -= stockGot;
            let stockHolding = [];
            for (let i = 0; i < stockGot; i++)
                stockHolding.push(new Stock(this.pm.equilibrium, 0));
            this.me = new Individual(nodeDiv, newName, this.myselfSetting.strategySetting, cashOwning, stockHolding);
            this.individualList.push(this.me);
            // initialize all the other individuals
            let j = 1; // start with 1 because myself counts 1
            for (let eachStrategy in this.indiviComposition) {
                for (let i = 0; i < this.indiviComposition[eachStrategy].number; i++) {
                    let nodeDiv = this.createNodeDiv(this.pauseTime);
                    let newName = this.genName(20);
                    let cashOwning;
                    let stockGot;
                    if (j === this.numOfIndividual - 1) {
                        cashOwning = cashLeft;
                        stockGot = stockLeft;
                    }
                    else {
                        cashOwning = Math.min(cashLeft, Math.floor(this.initTotalCash / this.numOfIndividual * Math.max(0, MyMath.normalSample(1, 0.1))));
                        stockGot = Math.min(stockLeft, Math.floor(this.totalStock / this.numOfIndividual * Math.max(0, MyMath.normalSample(1, 1))));
                    }
                    cashLeft -= cashOwning;
                    stockLeft -= stockGot;
                    let stockHolding = [];
                    for (let i = 0; i < stockGot; i++)
                        stockHolding.push(new Stock(this.pm.equilibrium, 0));
                    this.individualList.push(new Individual(nodeDiv, newName, this.indiviComposition[eachStrategy].strategySetting, cashOwning, stockHolding));
                    j++;
                }
            }
            // initialize market equillibrium data and deal amount data
            this.marketEqData.push([1, this.pm.equilibrium, this.initialEq]);
            this.dealAmountData.push([1, 0]);
        }
    }
    simulateOneDay() {
        if (this.animationField !== null && this.marketEqData !== undefined && this.dealAmountData !== undefined && this.myAssetData !== undefined && this.individualList !== undefined && this.dayToSimulate !== undefined) {
            let today = this.marketEqData.length - 1;
            // everyone update market info and make order
            this.everyoneUpdInfoAndOrder(today);
            // suffle individual list before matching
            this.individualList = MyMath.suffleArray(this.individualList);
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
            buySideOrderQueue.sort((a, b) => b.price - a.price);
            // sort the sell-side queue in the ask-price ascending order
            sellSideOrderQueue.sort((a, b) => a.price - b.price);
            // prepare demand/supply curve data
            let curveData = this.prepareCurveData(buySideOrderQueue, sellSideOrderQueue);
            MyGoogleChart.drawCurveChart(curveData, this.curveChart);
            // matching buy-side order and sell-side order
            this.matching(today, buySideOrderQueue, sellSideOrderQueue);
            if (today <= this.dayToSimulate) {
                MyGoogleChart.drawMarketEqChart(this.marketEqData, this.marketEqChart);
                MyGoogleChart.drawDealAmountChart(this.dealAmountData, this.dealAmountChart);
                MyGoogleChart.drawAssetsCharts(this.myAssetData, this.myAssetChart);
                this.showIndividualInfo();
                setTimeout(() => { this.simulateOneDay(); }, this.pauseTime);
            }
            else {
                this.enableChangeSetting();
                return;
            }
        }
    }
    everyoneUpdInfoAndOrder(today) {
        if (this.marketEqData !== undefined && this.individualList !== undefined && this.pm !== undefined) {
            for (let eachOne of this.individualList) {
                let valAssessed = this.pm.genAssessedVal(true);
                let latestPrice = this.marketEqData.slice(-1)[0].slice(-1)[0];
                if (typeof latestPrice === "string")
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
            if (buySideOrderQueue[i].owner !== sellSideOrderQueue[j].owner) {
                totalDealQ += dealQ;
                dealPair.push({ "buySide": buySideOrderQueue[i].owner, "sellSide": sellSideOrderQueue[j].owner, "q": dealQ });
                // decide finalDealPrice
                if (buySideOrderQueue[i].quantity === 0 && sellSideOrderQueue[j].quantity === 0) {
                    finalDealPrice = MyMath.avg([buySideOrderQueue[i].price, sellSideOrderQueue[j].price]);
                }
                else if (buySideOrderQueue[i].quantity === 0)
                    finalDealPrice = sellSideOrderQueue[j].price;
                else if (sellSideOrderQueue[j].quantity === 0)
                    finalDealPrice = buySideOrderQueue[i].price;
                else
                    throw "wierd!";
            }
            if (buySideOrderQueue[i].quantity === 0)
                i++;
            if (sellSideOrderQueue[j].quantity === 0)
                j++;
            valid =
                buySideOrderQueue.length > i &&
                    sellSideOrderQueue.length > j &&
                    buySideOrderQueue[i].price >= sellSideOrderQueue[j].price;
        }
        if (this.marketEqData !== undefined && this.dealAmountData !== undefined && this.myAssetData !== undefined && this.pm !== undefined && this.me !== undefined) {
            if (finalDealPrice === undefined) {
                finalDealPrice = parseFloat(`${this.marketEqData[this.marketEqData.length - 1][2]}`);
            }
            else {
                for (let eachDealPair of dealPair) {
                    this.deal(eachDealPair.buySide, eachDealPair.sellSide, eachDealPair.q, finalDealPrice, today);
                }
            }
            this.marketEqData.push([this.marketEqData.length, this.pm.equilibrium, finalDealPrice]);
            this.dealAmountData.push([this.marketEqData.length, totalDealQ]);
            // record my asset data
            this.myAssetData.push([this.marketEqData.length, this.me.calcTotalAsset(finalDealPrice), this.me.calcStockMktVal(finalDealPrice), this.me.cashOwning]);
        }
    }
    deal(buyer, seller, dealQ, dealP, today) {
        let stockSold = seller.sellOut(dealQ, dealP);
        buyer.buyIn(stockSold, dealP, today);
    }
    showIndividualInfo() {
        if (this.marketEqData !== undefined && this.individualList !== undefined) {
            for (let each of this.individualList) {
                let info = document.createElement("div");
                let i1 = document.createElement("div");
                i1.innerHTML = `${each.initialHolding}`;
                info.appendChild(i1);
                let i4 = document.createElement("div");
                i4.innerHTML = `$${each.initialTotalAsset}`;
                info.appendChild(i4);
                let i2 = document.createElement("div");
                i2.innerHTML = `${each.tradeAmount}`;
                info.appendChild(i2);
                let i3 = document.createElement("div");
                i3.innerHTML = `${each.stockHolding.length}`;
                info.appendChild(i3);
                let i5 = document.createElement("div");
                let finalPrice = parseFloat(`${this.marketEqData[this.marketEqData.length - 1][2]}`);
                i5.innerHTML = `${Math.round(each.calcReturn(finalPrice) * 10000) / 100}%`;
                info.appendChild(i5);
                each.divControlled.innerHTML = "";
                each.divControlled.appendChild(info);
            }
        }
    }
    prepareCurveData(buySideOrderQueue, sellSideOrderQueue) {
        if (this.initialEq !== undefined) {
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
    buildCompositionSettingView() {
        var _a;
        for (let eachStrategy in this.STRATEGIES) {
            let paramRow = document.createElement("div");
            paramRow.classList.add("parameter-row");
            let paramLabel = document.createElement("div");
            paramLabel.classList.add("parameter-label");
            paramLabel.classList.add("strategy-name");
            paramLabel.innerText = this.STRATEGIES[eachStrategy].displayedName;
            let paramInput = document.createElement("input");
            paramInput.classList.add("parameter-input");
            paramInput.classList.add("strategy-number-input");
            paramInput.type = "number";
            paramInput.id = `${eachStrategy}-number`;
            let strategyDetailBtn = document.createElement("label");
            strategyDetailBtn.id = `${eachStrategy}-detail`;
            strategyDetailBtn.classList.add("strategy-detail-btn");
            strategyDetailBtn.htmlFor = `${eachStrategy}-detail-field`;
            strategyDetailBtn.innerText = "detail";
            strategyDetailBtn.addEventListener("click", (e) => {
                var _a;
                if (this.detailCntnr instanceof HTMLElement) {
                    this.detailCntnr.classList.add("active");
                    for (let eachChild of this.detailCntnr.children)
                        eachChild.classList.remove("active");
                }
                if (e.currentTarget instanceof HTMLLabelElement) {
                    (_a = document.getElementById(`${e.currentTarget.htmlFor}`)) === null || _a === void 0 ? void 0 : _a.classList.add("active");
                }
                let allDetailBtns = document.getElementsByClassName("strategy-detail-btn");
                for (let eachBtn of allDetailBtns) {
                    if (eachBtn === e.currentTarget)
                        eachBtn.classList.add("active");
                    else
                        eachBtn.classList.remove("active");
                }
            });
            paramRow.appendChild(paramLabel);
            paramRow.appendChild(paramInput);
            paramRow.appendChild(strategyDetailBtn);
            (_a = this.composeParamField) === null || _a === void 0 ? void 0 : _a.appendChild(paramRow);
        }
        for (let eachStrategy in this.STRATEGIES) {
            let detailField = document.createElement("div");
            detailField.id = `${eachStrategy}-detail-field`;
            detailField.classList.add("detail-field");
            if (this.STRATEGIES[eachStrategy].otherDetails.length === 0) {
                let paramRow = document.createElement("div");
                paramRow.classList.add("parameter-row");
                let paramLabel = document.createElement("div");
                paramLabel.classList.add("parameter-label");
                paramLabel.innerText = `${this.STRATEGIES[eachStrategy].displayedName} is not needed to be configured.`;
                paramRow.appendChild(paramLabel);
                detailField.appendChild(paramRow);
            }
            else {
                for (let eachDetail of this.STRATEGIES[eachStrategy].otherDetails) {
                    let paramRow = document.createElement("div");
                    paramRow.classList.add("parameter-row");
                    let paramLabel = document.createElement("div");
                    paramLabel.classList.add("parameter-label");
                    paramLabel.innerText = `${eachDetail}`;
                    let paramInput = document.createElement("input");
                    paramInput.classList.add("parameter-input");
                    paramInput.classList.add("strategy-detail-input");
                    paramInput.id = `${eachStrategy}-${eachDetail}`;
                    paramRow.appendChild(paramLabel);
                    paramRow.appendChild(paramInput);
                    detailField.appendChild(paramRow);
                }
            }
            if (this.detailCntnr !== null)
                this.detailCntnr.appendChild(detailField);
        }
    }
    buildMyselfSettingView() {
        var _a, _b, _c;
        let paramRow = document.createElement("div");
        paramRow.classList.add("parameter-row");
        let paramLabel = document.createElement("div");
        paramLabel.classList.add("parameter-label");
        paramLabel.innerText = "Initial Total Cash";
        let paramInput = document.createElement("input");
        paramInput.classList.add("parameter-input");
        paramInput.type = "number";
        paramInput.id = `my-init-total-cash`;
        paramRow.appendChild(paramLabel);
        paramRow.appendChild(paramInput);
        (_a = this.myselfParamField) === null || _a === void 0 ? void 0 : _a.appendChild(paramRow);
        paramRow = document.createElement("div");
        paramRow.classList.add("parameter-row");
        paramLabel = document.createElement("div");
        paramLabel.classList.add("parameter-label");
        paramLabel.innerText = "Initial Stock";
        paramInput = document.createElement("input");
        paramInput.classList.add("parameter-input");
        paramInput.type = "number";
        paramInput.id = `my-init-stock`;
        paramRow.appendChild(paramLabel);
        paramRow.appendChild(paramInput);
        (_b = this.myselfParamField) === null || _b === void 0 ? void 0 : _b.appendChild(paramRow);
        // build each strategies' detail field
        for (let eachStrategy in this.STRATEGIES) {
            let detailField = document.createElement("div");
            detailField.id = `my-${eachStrategy}-detail-field`;
            detailField.classList.add("detail-field");
            if (this.STRATEGIES[eachStrategy].otherDetails.length === 0) {
                let paramRow = document.createElement("div");
                paramRow.classList.add("parameter-row");
                let paramLabel = document.createElement("div");
                paramLabel.classList.add("parameter-label");
                paramLabel.innerText = `${this.STRATEGIES[eachStrategy].displayedName} is not needed to be configured.`;
                paramRow.appendChild(paramLabel);
                detailField.appendChild(paramRow);
            }
            else {
                for (let eachDetail of this.STRATEGIES[eachStrategy].otherDetails) {
                    let paramRow = document.createElement("div");
                    paramRow.classList.add("parameter-row");
                    let paramLabel = document.createElement("div");
                    paramLabel.classList.add("parameter-label");
                    paramLabel.innerText = `${eachDetail}`;
                    let paramInput = document.createElement("input");
                    paramInput.classList.add("parameter-input");
                    paramInput.classList.add("strategy-detail-input");
                    paramInput.id = `my-${eachStrategy}-${eachDetail}`;
                    paramRow.appendChild(paramLabel);
                    paramRow.appendChild(paramInput);
                    detailField.appendChild(paramRow);
                }
            }
            if (this.detailCntnr !== null)
                this.detailCntnr.appendChild(detailField);
        }
        paramRow = document.createElement("div");
        paramRow.classList.add("parameter-row");
        paramLabel = document.createElement("div");
        paramLabel.classList.add("parameter-label");
        paramLabel.innerText = "Strategy";
        let strategyMenu = document.createElement("select");
        strategyMenu.classList.add("parameter-menu");
        strategyMenu.id = "my-strategy-menu";
        strategyMenu.addEventListener("click", (e) => {
            var _a;
            if (this.detailCntnr instanceof HTMLElement) {
                this.detailCntnr.classList.add("active");
                for (let eachChild of this.detailCntnr.children)
                    eachChild.classList.remove("active");
            }
            if (e.currentTarget instanceof HTMLSelectElement) {
                (_a = document.getElementById(`my-${e.currentTarget.value}-detail-field`)) === null || _a === void 0 ? void 0 : _a.classList.add("active");
            }
            let allDetailBtns = document.getElementsByClassName("strategy-detail-btn");
            for (let eachBtn of allDetailBtns) {
                if (eachBtn === e.currentTarget)
                    eachBtn.classList.add("active");
                else
                    eachBtn.classList.remove("active");
            }
        });
        for (let eachStrategy in this.STRATEGIES) {
            let eachOption = document.createElement("option");
            eachOption.value = eachStrategy;
            eachOption.innerText = this.STRATEGIES[eachStrategy].displayedName;
            eachOption.classList.add("parameter-menu-option");
            strategyMenu.options.add(eachOption);
        }
        paramRow.appendChild(paramLabel);
        paramRow.appendChild(strategyMenu);
        (_c = this.myselfParamField) === null || _c === void 0 ? void 0 : _c.appendChild(paramRow);
    }
    enableChangeSetting() {
        if (this.settingBtn instanceof HTMLButtonElement && this.startBtn instanceof HTMLButtonElement && this.initTotalCashInput instanceof HTMLInputElement && this.totalStockInput instanceof HTMLInputElement && this.initialEqInput instanceof HTMLInputElement && this.dayToSimulateInput instanceof HTMLInputElement && this.pauseTimeInput instanceof HTMLInputElement) {
            this.settingBtn.disabled = false;
            this.startBtn.disabled = false;
            this.initTotalCashInput.disabled = false;
            this.totalStockInput.disabled = false;
            this.initialEqInput.disabled = false;
            this.dayToSimulateInput.disabled = false;
            this.pauseTimeInput.disabled = false;
        }
    }
    disableChangeSetting() {
        if (this.settingBtn instanceof HTMLButtonElement && this.startBtn instanceof HTMLButtonElement && this.initTotalCashInput instanceof HTMLInputElement && this.totalStockInput instanceof HTMLInputElement && this.initialEqInput instanceof HTMLInputElement && this.dayToSimulateInput instanceof HTMLInputElement && this.pauseTimeInput instanceof HTMLInputElement) {
            this.settingBtn.disabled = true;
            this.startBtn.disabled = true;
            this.initTotalCashInput.disabled = true;
            this.totalStockInput.disabled = true;
            this.initialEqInput.disabled = true;
            this.dayToSimulateInput.disabled = true;
            this.pauseTimeInput.disabled = true;
        }
    }
    initGeneralSetting() {
        if (this.initTotalCashInput instanceof HTMLInputElement && this.totalStockInput instanceof HTMLInputElement && this.initialEqInput instanceof HTMLInputElement && this.dayToSimulateInput instanceof HTMLInputElement && this.pauseTimeInput instanceof HTMLInputElement) {
            this.initTotalCashInput.value = "1000000";
            this.totalStockInput.value = "100000";
            this.initialEqInput.value = "10";
            this.dayToSimulateInput.value = "250";
            this.pauseTimeInput.value = "3";
        }
    }
    readGeneralSetting() {
        if (this.initTotalCashInput instanceof HTMLInputElement && this.totalStockInput instanceof HTMLInputElement && this.initialEqInput instanceof HTMLInputElement && this.dayToSimulateInput instanceof HTMLInputElement && this.pauseTimeInput instanceof HTMLInputElement) {
            this.initTotalCash = parseInt(this.initTotalCashInput.value);
            this.totalStock = parseInt(this.totalStockInput.value);
            this.initialEq = parseInt(this.initialEqInput.value);
            this.dayToSimulate = parseInt(this.dayToSimulateInput.value);
            this.pauseTime = parseInt(this.pauseTimeInput.value);
        }
    }
    initCompositionSetting() {
        this.indiviComposition = {
            "value-follower": {
                "number": 0,
                "strategySetting": {
                    "name": "ValueFollower",
                    "params": {}
                }
            },
            "price-chaser": {
                "number": 99,
                "strategySetting": {
                    "name": "PriceChaser",
                    "params": {}
                }
            },
            "bh-mix-grid": {
                "number": 0,
                "strategySetting": {
                    "name": "BHmixGrid",
                    "params": {
                        "r": 0.1
                    }
                }
            },
            "grid-const-ratio": {
                "number": 0,
                "strategySetting": {
                    "name": "GridConstRatio",
                    "params": {
                        "max-price": 30,
                        "min-price": 3,
                        "n-table": 100,
                        "stock-ratio": 0.5
                    }
                }
            },
            "chicken": {
                "number": 0,
                "strategySetting": {
                    "name": "Chicken",
                    "params": {
                        "r": 0.2,
                        "runaway-rate": 0.85
                    }
                }
            }
        };
        for (let eachStrategy in this.indiviComposition) {
            let eachInputDOM = document.getElementById(`${eachStrategy}-number`);
            if (eachInputDOM instanceof HTMLInputElement) {
                eachInputDOM.value = this.indiviComposition[eachStrategy].number;
            }
            for (let eachDetail in this.indiviComposition[eachStrategy].strategySetting.params) {
                let eachInputDOM = document.getElementById(`${eachStrategy}-${eachDetail}`);
                if (eachInputDOM instanceof HTMLInputElement) {
                    eachInputDOM.value = this.indiviComposition[eachStrategy].strategySetting.params[eachDetail];
                }
            }
        }
    }
    readCompositionSetting() {
        for (let eachStrategy in this.indiviComposition) {
            let eachInputDOM = document.getElementById(`${eachStrategy}-number`);
            if (eachInputDOM instanceof HTMLInputElement) {
                this.indiviComposition[eachStrategy].number = parseInt(`${eachInputDOM.value}`);
            }
            let params = {};
            for (let eachParam of this.STRATEGIES[eachStrategy].otherDetails) {
                let eachInputDOM = document.getElementById(`${eachStrategy}-${eachParam}`);
                if (eachInputDOM instanceof HTMLInputElement) {
                    params[eachParam] = parseFloat(`${eachInputDOM.value}`);
                }
            }
            this.indiviComposition[eachStrategy].strategySetting.params = params;
        }
    }
    initMyselfSetting() {
        this.myselfSetting = {
            "initialCash": 1000,
            "initialStock": 0,
            "strategyLabel": "chicken",
            "strategySetting": {
                "name": "Chicken",
                "params": {
                    "r": 0.2,
                    "runaway-rate": 0.9
                }
            }
        };
        let myInitTotalCashInput = document.getElementById("my-init-total-cash");
        if (myInitTotalCashInput instanceof HTMLInputElement) {
            myInitTotalCashInput.value = this.myselfSetting.initialCash;
        }
        let myInitStockInput = document.getElementById("my-init-stock");
        if (myInitStockInput instanceof HTMLInputElement) {
            myInitStockInput.value = this.myselfSetting.initialStock;
        }
        let menuOption = document.getElementsByClassName("parameter-menu-option");
        for (let eachOption of menuOption) {
            if (eachOption instanceof HTMLOptionElement) {
                if (eachOption.value === this.myselfSetting.strategyLabel)
                    eachOption.selected = true;
                else
                    eachOption.selected = false;
            }
        }
        for (let eachParam in this.myselfSetting.strategySetting.params) {
            let eachInput = document.getElementById(`my-${this.myselfSetting.strategyLabel}-${eachParam}`);
            if (eachInput instanceof HTMLInputElement) {
                eachInput.value = this.myselfSetting.strategySetting.params[eachParam];
            }
        }
    }
    readMyselfSetting() {
        let myInitTotalCashInput = document.getElementById("my-init-total-cash");
        if (myInitTotalCashInput instanceof HTMLInputElement) {
            this.myselfSetting.initialCash = parseInt(myInitTotalCashInput.value);
        }
        let myInitStockInput = document.getElementById("my-init-stock");
        if (myInitStockInput instanceof HTMLInputElement) {
            this.myselfSetting.initialStock = parseInt(myInitStockInput.value);
        }
        let menuOption = document.getElementsByClassName("parameter-menu-option");
        for (let eachOption of menuOption) {
            if (eachOption instanceof HTMLOptionElement) {
                if (eachOption.selected) {
                    this.myselfSetting.strategyLabel = eachOption.value;
                    this.myselfSetting.strategySetting.name = eachOption.innerText;
                    for (let eachDetail of this.STRATEGIES[eachOption.value].otherDetails) {
                        let selectedStrategyDetailInput = document.getElementById(`my-${eachOption.value}-${eachDetail}`);
                        if (selectedStrategyDetailInput instanceof HTMLInputElement) {
                            this.myselfSetting.strategySetting.params[eachDetail] = selectedStrategyDetailInput.value;
                        }
                    }
                }
            }
        }
    }
    refresh() {
        if (this.animationField !== null)
            this.animationField.innerHTML = "";
        if (this.marketEqData !== undefined && this.dealAmountData !== undefined && this.myAssetData !== undefined && this.individualList !== undefined) {
            // prevent memory leaks
            this.marketEqData.length = 0;
            this.marketEqData.push(["Day", "Given Price", "Mkt. Eq."]);
            this.dealAmountData.length = 0;
            this.dealAmountData.push(["Day", "Deal Amount"]);
            this.myAssetData.length = 0;
            this.myAssetData.push(["Day", "Total Asset", "Stock Mkt Val", "Cash Holding"]);
            this.individualList.length = 0;
        }
        else {
            this.marketEqData = [["Day", "Given Price", "Mkt. Eq."]];
            this.dealAmountData = [["Day", "Deal Amount"]];
            this.myAssetData = [["Day", "Total Asset", "Stock Mkt Val", "Cash Holding"]];
            this.individualList = [];
        }
        this.readGeneralSetting();
        this.readCompositionSetting();
        this.readMyselfSetting();
        this.applyAllSetting();
    }
    start() {
        // build market composition setting view
        this.buildCompositionSettingView();
        this.buildMyselfSettingView();
        // init all setting
        this.initGeneralSetting();
        this.initCompositionSetting();
        this.initMyselfSetting();
        // refresh
        this.refresh();
        // mode list
        if (this.recorderOption instanceof HTMLAnchorElement && this.simulatorOption instanceof HTMLAnchorElement && this.simulatorProOption instanceof HTMLAnchorElement) {
            this.recorderOption.href = "../recorder/";
            this.simulatorOption.href = "../simulator/";
            this.simulatorProOption.href = "#";
            this.simulatorProOption.classList.add("active");
        }
        // Setting Header
        for (let each of this.allSettingHeaderTabs) {
            each.addEventListener("click", (e) => {
                var _a, _b;
                for (let eachField of this.allParamFields)
                    eachField.classList.remove("active");
                if (e.currentTarget instanceof HTMLLabelElement) {
                    (_a = document.getElementById(`${e.currentTarget.htmlFor}`)) === null || _a === void 0 ? void 0 : _a.classList.add("active");
                }
                for (let eachTab of this.allSettingHeaderTabs) {
                    if (eachTab === e.currentTarget)
                        eachTab.classList.add("active");
                    else
                        eachTab.classList.remove("active");
                }
                let allDetailBtns = document.getElementsByClassName("strategy-detail-btn");
                for (let eachBtn of allDetailBtns)
                    eachBtn.classList.remove("active");
                (_b = this.detailCntnr) === null || _b === void 0 ? void 0 : _b.classList.remove("active");
            });
        }
        //  Setting Footer
        if (this.settingFooter !== null) {
            this.settingFooter.addEventListener("click", () => { this.refresh(); });
        }
        // the start(RUN) button
        if (this.startBtn instanceof HTMLButtonElement) {
            this.startBtn.addEventListener("click", () => {
                this.refresh();
                this.disableChangeSetting();
                this.simulateOneDay();
            });
        }
        if (this.myAssetChartCntnr !== null && this.myAssetChartHeader !== null && this.settingBtn !== null && this.settingBg !== null && this.settingCntnr !== null && this.settingFooter !== null) {
            this.myAssetChartHeader.addEventListener("click", () => {
                var _a;
                (_a = this.myAssetChartCntnr) === null || _a === void 0 ? void 0 : _a.classList.remove("active");
            });
            this.settingBtn.addEventListener("click", () => {
                var _a, _b, _c;
                (_a = this.settingBg) === null || _a === void 0 ? void 0 : _a.classList.add("active");
                (_b = this.settingCntnr) === null || _b === void 0 ? void 0 : _b.classList.add("active");
                (_c = this.detailCntnr) === null || _c === void 0 ? void 0 : _c.classList.add("is-setting");
            });
            this.settingFooter.addEventListener("click", () => {
                var _a, _b, _c;
                (_a = this.settingBg) === null || _a === void 0 ? void 0 : _a.classList.remove("active");
                (_b = this.settingCntnr) === null || _b === void 0 ? void 0 : _b.classList.remove("active");
                (_c = this.detailCntnr) === null || _c === void 0 ? void 0 : _c.classList.remove("is-setting");
            });
        }
        if (this.resetBtn !== null)
            this.resetBtn.addEventListener("click", () => { location.reload(); });
    }
}
let main = new Main();
main.start();
