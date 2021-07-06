import { Individual } from './individual.js';
import { PriceMachine } from './priceMachine.js';
import { Stock } from "./stock.js";
import { Order } from "./order.js";
class Main {
    public STRATEGIES: any = {
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

    public startBtn = document.getElementById("start-btn");
    public resetBtn = document.getElementById("reset-btn");
    public recorderOption = document.getElementById("recorder-option");
    public simulatorOption = document.getElementById("simulator-option");
    public simulatorProOption = document.getElementById("simulator-pro-option");
    public settingBtn = document.getElementById("setting-btn");
    public settingBg = document.getElementById("setting-background");
    public settingCntnr = document.getElementById("setting-container");
    public allSettingHeaderTabs = document.getElementsByClassName("setting-header-tab")
    public settingHeaderGeneral = document.getElementById("setting-header-general");
    public settingHeaderCompose = document.getElementById("setting-header-compose");
    public settingHeaderIndi = document.getElementById("setting-header-individual");
    public allParamFields = document.getElementsByClassName("parameter-field");
    public generalParamField = document.getElementById("general-parameter-field");
    public initTotalCashInput = document.getElementById("init-total-cash");
    public totalStockInput = document.getElementById("total-stock");
    public initialEqInput = document.getElementById("initial-eq");
    public dayToSimulateInput = document.getElementById("day-to-simulate");
    public pauseTimeInput = document.getElementById("pause-time");
    public composeParamField = document.getElementById("compose-parameter-field");
    public myselfParamField = document.getElementById("myself-parameter-field");
    public detailCntnr = document.getElementById("detail-container");
    public allDetailFields = document.getElementsByClassName("detail-field");
    public settingFooter = document.getElementById("setting-footer");
    public myAssetChartCntnr = document.getElementById("my-asset-chart-container");
    public myAssetChartHeader = document.getElementById("my-asset-chart-header");
    public myAssetChart = document.getElementById("my-asset-chart");
    public animationField = document.getElementById("animation-field");
    public marketEqChart = document.getElementById("market-eq-chart");
    public dealAmountChart = document.getElementById("deal-amount-chart");
    public curveChart = document.getElementById("curve-chart");

    public marketEqData: (number | string)[][] | undefined;
    public dealAmountData: (number | string)[][] | undefined;
    public myAssetData: (string | number)[][] | undefined;
    public individualList: Individual[] | undefined;
    public pm: PriceMachine | undefined;
    public nodeDivSize: number | undefined;

    public initTotalCash: number | undefined;
    public totalStock: number | undefined;
    public initialEq: number | undefined;
    public numOfIndividual: number | undefined;
    public dayToSimulate: number | undefined;
    public pauseTime: number | undefined;

    public indiviComposition: any;

    public me: Individual | undefined;
    public myselfSetting: any;

    public suffleArray(anArray: any[]): any[] {
        for (let i = anArray.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            const temp = anArray[i];
            anArray[i] = anArray[j];
            anArray[j] = temp;
        }
        return anArray;
    }

    public avg(arr: number[]): number {
        return arr.reduce((prev: number, curr: number) => prev + curr, 0) / arr.length;
    }

    public normalSample(mu: number, std: number): number {
        let u = 0, v = 0;
        while (u === 0) u = Math.random(); //Converting [0,1) to (0,1)
        while (v === 0) v = Math.random();
        return std * Math.sqrt(-2.0 * Math.log(u)) * Math.cos(2.0 * Math.PI * v) + mu;
    }

    public createNodeDiv(pauseTime: number): HTMLElement {
        let nodeDiv = document.createElement("div");
        nodeDiv.className = "node";
        nodeDiv.style.width = `${this.nodeDivSize}px`;
        nodeDiv.style.height = `${this.nodeDivSize}px`;
        nodeDiv.style.transitionDuration = `${pauseTime / 2}ms`;
        if (this.animationField != null) this.animationField.appendChild(nodeDiv);
        return nodeDiv;
    }

    public genName(length: number): string {
        let randomChars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
        let result = "";
        for (let i = 0; i < length; i++) {
            result += randomChars.charAt(Math.floor(Math.random() * randomChars.length));
        }
        return result;
    }

    public applyAllSetting(): void {
        if (this.marketEqData != undefined && this.dealAmountData != undefined && this.individualList != undefined && this.initTotalCash != undefined && this.totalStock != undefined && this.initialEq != undefined && this.pauseTime != undefined) {
            // count numOfIndividual
            this.numOfIndividual = 1;   // one for myself(me)
            for (let eachStrategy in this.indiviComposition) {
                this.numOfIndividual += this.indiviComposition[eachStrategy].number;
            }
            this.pm = new PriceMachine(this.initialEq, this.numOfIndividual);
            // decide the size of each node
            this.nodeDivSize = 0;
            if (this.animationField instanceof HTMLElement) {
                this.nodeDivSize = Math.min(this.animationField.offsetHeight, this.animationField.offsetWidth) / Math.ceil(this.numOfIndividual ** 0.35);
                this.animationField.style.gridTemplateColumns = `repeat(auto-fit, minmax(${this.nodeDivSize + 10}px, 1fr))`;
                this.animationField.style.gridTemplateRows = `repeat(auto-fit, ${this.nodeDivSize + 10}px)`;
            }
            let cashLeft: number = this.initTotalCash;
            let stockLeft: number = this.totalStock;
            // initialize myself(me)
            let nodeDiv = this.createNodeDiv(this.pauseTime);
            nodeDiv.id = "me";
            nodeDiv.addEventListener("click", () => {
                this.myAssetChartCntnr?.classList.add("active");
            });
            let newName = this.genName(20);
            let cashOwning = this.myselfSetting.initialCash;
            let stockGot = this.myselfSetting.initialStock;
            cashLeft -= cashOwning;
            stockLeft -= stockGot;
            let stockHolding: Stock[] = [];
            for (let i = 0; i < stockGot; i++) stockHolding.push(new Stock(this.pm.equilibrium, 0));
            this.me = new Individual(nodeDiv, newName, this.myselfSetting.strategySetting, cashOwning, stockHolding);
            this.individualList.push(this.me);
            // initialize all the other individuals
            let j = 1;  // start with 1 because myself counts 1
            for (let eachStrategy in this.indiviComposition) {
                for (let i = 0; i < this.indiviComposition[eachStrategy].number; i++) {
                    let nodeDiv = this.createNodeDiv(this.pauseTime);
                    let newName = this.genName(20);
                    let cashOwning: number;
                    let stockGot: number;
                    if (j == this.numOfIndividual - 1) {
                        cashOwning = cashLeft;
                        stockGot = stockLeft;
                    } else {
                        cashOwning = Math.min(cashLeft, Math.floor(this.initTotalCash / this.numOfIndividual * Math.max(0, this.normalSample(1, 0.1))));
                        stockGot = Math.min(stockLeft, Math.floor(this.totalStock / this.numOfIndividual * Math.max(0, this.normalSample(1, 1))));
                    }
                    cashLeft -= cashOwning;
                    stockLeft -= stockGot;
                    let stockHolding: Stock[] = [];
                    for (let i = 0; i < stockGot; i++) stockHolding.push(new Stock(this.pm.equilibrium, 0));
                    this.individualList.push(new Individual(nodeDiv, newName, this.indiviComposition[eachStrategy].strategySetting, cashOwning, stockHolding));
                    j++;
                }
            }
            // initialize market equillibrium data and deal amount data
            this.marketEqData.push([1, this.pm.equilibrium, this.initialEq]);
            this.dealAmountData.push([1, 0]);
        }
    }

    public simulate(): void { // This is a recursive funtion
        if (this.animationField != null && this.marketEqData != undefined && this.dealAmountData != undefined && this.myAssetData != undefined && this.individualList != undefined && this.dayToSimulate != undefined) {
            let today = this.marketEqData.length - 1;
            // everyone update market info and make order
            this.everyoneUpdInfoAndOrder(today);
            // suffle individual list before matching
            this.individualList = this.suffleArray(this.individualList);
            // buy-side queue & sell-side queue
            let buySideOrderQueue: Order[] = [];
            let sellSideOrderQueue: Order[] = [];
            for (let eachOne of this.individualList) {
                if (eachOne.orderToday != undefined) {
                    if (eachOne.orderToday.buyOrder.quantity > 0) buySideOrderQueue.push(eachOne.orderToday.buyOrder);
                    if (eachOne.orderToday.sellOrder.quantity > 0) sellSideOrderQueue.push(eachOne.orderToday.sellOrder);
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
                setTimeout(() => { this.simulate() }, this.pauseTime);
            } else {
                this.showIndividualInfo();
                this.enableChangeSetting();
                return;
            }
        }
    }

    public everyoneUpdInfoAndOrder(today: number): void {
        if (this.marketEqData != undefined && this.individualList != undefined && this.pm != undefined) {
            for (let eachOne of this.individualList) {
                let valAssessed = this.pm.genAssessedVal(true);
                let latestPrice = this.marketEqData.slice(-1)[0].slice(-1)[0];
                if (typeof latestPrice == "string") latestPrice = parseFloat(latestPrice);
                eachOne.updateMktInfo(today, valAssessed, latestPrice);
                eachOne.makeOrder();
            }
        }
    }

    public matching(today: number, buySideOrderQueue: Order[], sellSideOrderQueue: Order[]): void {
        let i: number = 0;
        let j: number = 0;
        let totalDealQ = 0;
        let finalDealPrice: number | undefined = undefined;
        let dealPair: { "buySide": Individual, "sellSide": Individual, "q": number }[] = [];
        let valid: boolean =
            buySideOrderQueue.length > i &&
            sellSideOrderQueue.length > j &&
            buySideOrderQueue[i].price >= sellSideOrderQueue[j].price;
        while (valid) {
            let dealQ = Math.min(buySideOrderQueue[i].quantity, sellSideOrderQueue[j].quantity);
            buySideOrderQueue[i].quantity -= dealQ;
            sellSideOrderQueue[j].quantity -= dealQ;
            if (buySideOrderQueue[i].owner != sellSideOrderQueue[j].owner) {
                totalDealQ += dealQ;
                dealPair.push({ "buySide": buySideOrderQueue[i].owner, "sellSide": sellSideOrderQueue[j].owner, "q": dealQ });
            }
            if (buySideOrderQueue[i].quantity == 0 && sellSideOrderQueue[j].quantity == 0) {
                finalDealPrice = this.avg([buySideOrderQueue[i].price, sellSideOrderQueue[j].price]);
            } else if (buySideOrderQueue[i].quantity == 0) finalDealPrice = sellSideOrderQueue[j].price;
            else if (sellSideOrderQueue[j].quantity == 0) finalDealPrice = buySideOrderQueue[i].price;
            else throw "wierd!";
            if (buySideOrderQueue[i].quantity == 0) i++;
            if (sellSideOrderQueue[j].quantity == 0) j++;
            valid =
                buySideOrderQueue.length > i &&
                sellSideOrderQueue.length > j &&
                buySideOrderQueue[i].price >= sellSideOrderQueue[j].price;
        }
        if (this.marketEqData != undefined && this.dealAmountData != undefined && this.myAssetData != undefined && this.pm != undefined && this.me != undefined) {
            if (finalDealPrice == undefined) {
                let oldPrice = this.marketEqData[this.marketEqData.length - 1][2];
                if (typeof oldPrice == "number") finalDealPrice = oldPrice;
                else finalDealPrice = parseFloat(oldPrice);
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

    public deal(buyer: Individual, seller: Individual, dealQ: number, dealP: number, today: number): void {
        let s = seller.sellOut(dealQ, dealP);
        buyer.buyIn(s, dealP, today);
    }

    public showIndividualInfo(): void {
        if (this.marketEqData != undefined && this.individualList != undefined) {
            for (let each of this.individualList) {
                let finalPrice = this.marketEqData[this.marketEqData.length - 1][2];
                if (typeof finalPrice == "string") finalPrice = parseFloat(finalPrice);
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

    public prepareCurveData(buySideOrderQueue: Order[], sellSideOrderQueue: Order[]): (number[] | string[])[] {
        if (this.initialEq != undefined) {
            let maxNumInChart = this.initialEq * 2;
            let minNumInChart = 0;
            let delta = maxNumInChart - minNumInChart
            let priceSequence: number[] = [];
            for (let i = 0; i < 50; i++) priceSequence.push(minNumInChart + delta / 50 * i)
            let curveData: (number[] | string[])[] = [["price", "D", "S"]];
            for (let each of priceSequence) {
                let qd = 0;
                let qs = 0;
                for (let eachOrder of buySideOrderQueue) {
                    if (eachOrder.price >= each) qd += eachOrder.quantity;
                }
                for (let eachOrder of sellSideOrderQueue) {
                    if (eachOrder.price <= each) qs += eachOrder.quantity;
                }
                curveData.push([each, qd, qs]);
            }
            return curveData;
        } else throw "initialEq undefined while preparing curve data";
    }

    public applyMarketEqChart(dataIn: (string | number)[][]): void {
        if (this.marketEqChart != null) {
            google.charts.load('current', { 'packages': ["corechart"] });
            let options = {
                // title: 'Given Price vs. Market Equilibrium',
                // titleTextStyle: {
                //     fontSize: 14,
                //     bold: false,
                //     color: "#777"
                // },
                curveType: 'none',
                width: this.marketEqChart.offsetWidth,
                height: this.marketEqChart.offsetHeight,
                chartArea: { left: "10%", top: "5%", width: '75%', height: '90%' }
            };
            google.charts.setOnLoadCallback(() => this.drawSimulatedChart(dataIn, options, "LineChart", this.marketEqChart));
        }
    }

    public applyDealAmountChart(dataIn: (string | number)[][]): void {
        if (this.dealAmountChart != null) {
            google.charts.load('current', { 'packages': ["corechart"] });
            let options = {
                // title: 'Deal Amount',
                // titleTextStyle: {
                //     fontSize: 14,
                //     bold: false,
                //     color: "#777"
                // },
                width: this.dealAmountChart.offsetWidth,
                height: this.dealAmountChart.offsetHeight,
                legend: { position: "none" },
                series: { 0: { color: "#888" } },
                chartArea: { left: "10%", top: "5%", width: '75%', height: '90%' }
            };
            google.charts.setOnLoadCallback(() => this.drawSimulatedChart(dataIn, options, "ColumnChart", this.dealAmountChart));
        }
    }

    public applyCurveChart(dataIn: (string | number)[][]): void {
        if (this.curveChart != null) {
            google.charts.load('current', { 'packages': ["corechart"] });
            let options = {
                // title: 'Demand / Supply Curve',
                // titleTextStyle: {
                //     fontSize: 14,
                //     bold: false,
                //     color: "#777"
                // },
                curveType: 'none',
                width: this.curveChart.offsetWidth,
                height: this.curveChart.offsetHeight,
                vAxis: { title: 'Q' },
                hAxis: { title: 'P' },
                chartArea: { left: "10%", top: "5%", width: '75%', height: '90%' }
            };
            google.charts.setOnLoadCallback(() => this.drawSimulatedChart(dataIn, options, "LineChart", this.curveChart));
        }
    }

    public applyAssetsCharts(dataIn: (string | number)[][]): void {
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
                chartArea: { left: "15%", top: "10%", width: '65%', height: '80%' }
            };
            google.charts.setOnLoadCallback(() => this.drawSimulatedChart(dataIn, options, "LineChart", this.myAssetChart));
        }
    }

    public drawSimulatedChart(dataIn: any[][], options: any, chartType: string, targetDiv: HTMLElement | null): void {
        let data = google.visualization.arrayToDataTable(dataIn);
        let chart = new google.visualization[chartType](targetDiv);
        chart.draw(data, options);
    }

    public buildCompositionSettingView(): void {
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
            strategyDetailBtn.addEventListener("click", (e: Event) => {
                if (this.detailCntnr instanceof HTMLElement) {
                    this.detailCntnr.classList.add("active");
                    for (let eachChild of this.detailCntnr.children) eachChild.classList.remove("active");
                }
                if (e.currentTarget instanceof HTMLLabelElement) {
                    document.getElementById(`${e.currentTarget.htmlFor}`)?.classList.add("active");
                }
                let allDetailBtns = document.getElementsByClassName("strategy-detail-btn");
                for (let eachBtn of allDetailBtns) {
                    if (eachBtn == e.currentTarget) eachBtn.classList.add("active");
                    else eachBtn.classList.remove("active");
                }
            });

            paramRow.appendChild(paramLabel);
            paramRow.appendChild(paramInput);
            paramRow.appendChild(strategyDetailBtn);

            this.composeParamField?.appendChild(paramRow);
        }
        for (let eachStrategy in this.STRATEGIES) {
            let detailField = document.createElement("div");
            detailField.id = `${eachStrategy}-detail-field`;
            detailField.classList.add("detail-field");

            if (this.STRATEGIES[eachStrategy].otherDetails.length == 0) {
                let paramRow = document.createElement("div");
                paramRow.classList.add("parameter-row");

                let paramLabel = document.createElement("div");
                paramLabel.classList.add("parameter-label");
                paramLabel.innerText = `${this.STRATEGIES[eachStrategy].displayedName} is not needed to be configured.`;

                paramRow.appendChild(paramLabel);

                detailField.appendChild(paramRow);
            } else {
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
            if (this.detailCntnr != null) this.detailCntnr.appendChild(detailField);
        }
    }

    public buildMyselfSettingView(): void {
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

        this.myselfParamField?.appendChild(paramRow);

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

        this.myselfParamField?.appendChild(paramRow);
        // build each strategies' detail field
        for (let eachStrategy in this.STRATEGIES) {
            let detailField = document.createElement("div");
            detailField.id = `my-${eachStrategy}-detail-field`;
            detailField.classList.add("detail-field");

            if (this.STRATEGIES[eachStrategy].otherDetails.length == 0) {
                let paramRow = document.createElement("div");
                paramRow.classList.add("parameter-row");

                let paramLabel = document.createElement("div");
                paramLabel.classList.add("parameter-label");
                paramLabel.innerText = `${this.STRATEGIES[eachStrategy].displayedName} is not needed to be configured.`;

                paramRow.appendChild(paramLabel);

                detailField.appendChild(paramRow);
            } else {
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
            if (this.detailCntnr != null) this.detailCntnr.appendChild(detailField);
        }

        paramRow = document.createElement("div");
        paramRow.classList.add("parameter-row");

        paramLabel = document.createElement("div");
        paramLabel.classList.add("parameter-label");
        paramLabel.innerText = "Strategy";
        let strategyMenu = document.createElement("select");
        strategyMenu.classList.add("parameter-menu");
        strategyMenu.id = "my-strategy-menu";
        strategyMenu.addEventListener("click", (e: Event) => {
            if (this.detailCntnr instanceof HTMLElement) {
                this.detailCntnr.classList.add("active");
                for (let eachChild of this.detailCntnr.children) eachChild.classList.remove("active");
            }
            if (e.currentTarget instanceof HTMLSelectElement) {
                document.getElementById(`my-${e.currentTarget.value}-detail-field`)?.classList.add("active");
            }
            let allDetailBtns = document.getElementsByClassName("strategy-detail-btn");
            for (let eachBtn of allDetailBtns) {
                if (eachBtn == e.currentTarget) eachBtn.classList.add("active");
                else eachBtn.classList.remove("active");
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

        this.myselfParamField?.appendChild(paramRow);
    }

    public enableChangeSetting(): void {
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

    public disableChangeSetting(): void {
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

    public initGeneralSetting(): void {
        if (this.initTotalCashInput instanceof HTMLInputElement && this.totalStockInput instanceof HTMLInputElement && this.initialEqInput instanceof HTMLInputElement && this.dayToSimulateInput instanceof HTMLInputElement && this.pauseTimeInput instanceof HTMLInputElement) {
            this.initTotalCashInput.value = "1000000";
            this.totalStockInput.value = "100000";
            this.initialEqInput.value = "10";
            this.dayToSimulateInput.value = "250";
            this.pauseTimeInput.value = "3";
        }
    }

    public readGeneralSetting(): void {
        if (this.initTotalCashInput instanceof HTMLInputElement && this.totalStockInput instanceof HTMLInputElement && this.initialEqInput instanceof HTMLInputElement && this.dayToSimulateInput instanceof HTMLInputElement && this.pauseTimeInput instanceof HTMLInputElement) {
            this.initTotalCash = parseInt(this.initTotalCashInput.value);
            this.totalStock = parseInt(this.totalStockInput.value);
            this.initialEq = parseInt(this.initialEqInput.value);
            this.dayToSimulate = parseInt(this.dayToSimulateInput.value);
            this.pauseTime = parseInt(this.pauseTimeInput.value);
        }
    }

    public initCompositionSetting(): void {
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
        }
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

    public readCompositionSetting(): void {
        for (let eachStrategy in this.indiviComposition) {
            let eachInputDOM = document.getElementById(`${eachStrategy}-number`);
            if (eachInputDOM instanceof HTMLInputElement) {
                this.indiviComposition[eachStrategy].number = parseInt(`${eachInputDOM.value}`);
            }
            let params: any = {};
            for (let eachParam of this.STRATEGIES[eachStrategy].otherDetails) {
                let eachInputDOM = document.getElementById(`${eachStrategy}-${eachParam}`);
                if (eachInputDOM instanceof HTMLInputElement) {
                    params[eachParam] = parseFloat(`${eachInputDOM.value}`);
                }
            }
            this.indiviComposition[eachStrategy].strategySetting.params = params;
        }
    }

    public initMyselfSetting(): void {
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
        }
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
                if (eachOption.value == this.myselfSetting.strategyLabel) eachOption.selected = true;
                else eachOption.selected = false;
            }
        }
        for (let eachParam in this.myselfSetting.strategySetting.params) {
            let eachInput = document.getElementById(`my-${this.myselfSetting.strategyLabel}-${eachParam}`);
            if (eachInput instanceof HTMLInputElement) {
                eachInput.value = this.myselfSetting.strategySetting.params[eachParam];
            }
        }
    }

    public readMyselfSetting(): void {
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

    public refresh(): void {
        if (this.animationField != null) this.animationField.innerHTML = "";
        this.marketEqData = [["Day", "Given Price", "Mkt. Eq."]];
        this.dealAmountData = [["Day", "Deal Amount"]];
        this.myAssetData = [["Day", "Total Asset", "Stock Mkt Val", "Cash Holding"]]
        this.individualList = [];
        this.readGeneralSetting();
        this.readCompositionSetting();
        this.readMyselfSetting();
        this.applyAllSetting();
    }

    public start(): void {
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
            each.addEventListener("click", (e: Event) => {
                for (let eachField of this.allParamFields) eachField.classList.remove("active");
                if (e.currentTarget instanceof HTMLLabelElement) {
                    document.getElementById(`${e.currentTarget.htmlFor}`)?.classList.add("active");
                }
                for (let eachTab of this.allSettingHeaderTabs) {
                    if (eachTab == e.currentTarget) eachTab.classList.add("active");
                    else eachTab.classList.remove("active");
                }
                this.detailCntnr?.classList.remove("active");
            });
        }
        //  Setting Footer
        if (this.settingFooter != null) {
            this.settingFooter.addEventListener("click", () => { this.refresh() });
        }
        // the start(RUN) button
        if (this.startBtn instanceof HTMLButtonElement) {
            this.startBtn.addEventListener("click", () => {
                this.refresh();
                this.disableChangeSetting();
                this.simulate();
            });
        }
        if (this.myAssetChartCntnr != null && this.myAssetChartHeader != null && this.settingBtn != null && this.settingBg != null && this.settingCntnr != null && this.settingFooter != null) {
            this.myAssetChartHeader.addEventListener("click", () => {
                this.myAssetChartCntnr?.classList.remove("active");
            });
            this.settingBtn.addEventListener("click", () => {
                this.settingBg?.classList.add("active");
                this.settingCntnr?.classList.add("active");
                this.detailCntnr?.classList.add("is-setting");
            })
            this.settingFooter.addEventListener("click", () => {
                this.settingBg?.classList.remove("active");
                this.settingCntnr?.classList.remove("active");
                this.detailCntnr?.classList.remove("is-setting");
            })
        }
        if (this.resetBtn != null) this.resetBtn.addEventListener("click", () => { location.reload() });
    }
}
let main = new Main();
main.start();

// var oReq = new XMLHttpRequest();
// oReq.addEventListener("load", () => {
//     console.log(oReq.responseText);
// });
// oReq.open("GET", "./README.md");
// oReq.send();