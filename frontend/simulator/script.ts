import { Strategy, BHmixGrid, PlannedBHmixGrid, Chicken, GridConstRatio } from './strategy.js';
import { AssetChart, PriceChart } from './chart.js';
let recorderOption = document.getElementById("recorder-option");
let simulatorOption = document.getElementById("simulator-option");
let simulatorProOption = document.getElementById("simulator-pro-option");
let priceChartDiv = document.getElementById("price-chart");
let assetsChartDiv = document.getElementById("assets-chart");
let priceChartDrawer: PriceChart;
let assetsChartDrawer: AssetChart;
let allOptions = document.getElementsByClassName("strategy-option");
let option1 = document.getElementById("option1");
let option2 = document.getElementById("option2");
let option3 = document.getElementById("option3");
let option4 = document.getElementById("option4");
let comparisonOption = document.getElementById("comparison");
let startBtn = document.getElementById("start-btn");

function simulatePriceFluct(initP: number, nDays: number): number[] {
    let pList = [initP];
    for (let i = 0; i < nDays - 1; i++) {
        // Ramdom Walk
        pList.push(Math.round(pList[pList.length - 1] * normalSample(1, 0.033) * 100) / 100);
    }
    return pList;
}

function normalSample(mu: number, std: number): number {
    let u = 0, v = 0;
    while (u === 0) u = Math.random(); //Converting [0,1) to (0,1)
    while (v === 0) v = Math.random();
    return std * Math.sqrt(-2.0 * Math.log(u)) * Math.cos(2.0 * Math.PI * v) + mu;
}

function selectStrategy(e: Event, s: Strategy, args: (string | number)[]): void {
    for (let each of allOptions) each.classList.remove("active");
    if (e.currentTarget instanceof HTMLElement) e.currentTarget.classList.add("active");
    execStrategy(s, args);
}

function execStrategy(s: Strategy, args: (string | number)[]): void {
    if (s.dailyQList.length === 0) s.followStrategy(...args);
    let comprehensiveData: (string | number)[][] = [["Day", "總資產", "證券市值", "投入現金", "剩餘現金"]];
    for (let i = 0; i < s.nDays; i++) {
        let eachComprehensiveData = [i + 1, s.totalAssetsList[i], s.securMktValList[i], s.cumulInvestCashList[i], s.cashList[i]]
        let eachPrice = [i + 1, s.pList[i]];
        comprehensiveData.push(eachComprehensiveData);
    }
    assetsChartDrawer.drawChart(comprehensiveData, "各項資產");
}

function compareStrategies(e: Event, strategies: [Strategy, (string | number)[]][]): void {
    for (let each of allOptions) each.classList.remove("active");
    if (e.currentTarget instanceof HTMLElement) e.currentTarget.classList.add("active");
    let comparedData: (string | number)[][] = [["Day"]];
    for (let eachStrategy of strategies) {
        comparedData[0].push(eachStrategy[0].name)
        if (eachStrategy[0].dailyQList.length === 0) {
            eachStrategy[0].followStrategy(...eachStrategy[1])
        }
        for (let i = 0; i < eachStrategy[0].totalAssetsList.length; i++) {
            try {
                comparedData[i + 1].push(eachStrategy[0].totalAssetsList[i]);
            } catch {
                comparedData.push([i + 1, eachStrategy[0].totalAssetsList[i]]);
            }
        }
    }
    assetsChartDrawer.drawChart(comparedData, "獲利比較");
}

function main(): void {
    if (recorderOption instanceof HTMLAnchorElement && simulatorOption instanceof HTMLAnchorElement && simulatorProOption instanceof HTMLAnchorElement) {
        recorderOption.href = "../recorder/";
        simulatorOption.href = "#";
        simulatorOption.classList.add("active");
        simulatorProOption.href = "../simulatorPro/";
    }
    if (priceChartDiv instanceof HTMLElement && assetsChartDiv instanceof HTMLElement) {
        priceChartDrawer = new PriceChart(priceChartDiv);
        assetsChartDrawer = new AssetChart(assetsChartDiv);
    }
    let initP = 100;
    let initTotalAssets = 10000;
    let nDays = 360;
    let pList = simulatePriceFluct(initP, nDays);

    //  Draw Price Chart
    let priceData: (string | number)[][] = [["Day", "Price"]];
    for (let i = 0; i < pList.length; i++) {
        let eachPrice = [i + 1, pList[i]];
        priceData.push(eachPrice);
    }
    priceChartDrawer.drawChart(priceData);

    // BHmixGrid Strategy
    let rb = 0.05;
    let argsB: (number | string)[] = [rb, 0];
    let b = new BHmixGrid("BHmixGrid", initTotalAssets, nDays, pList);

    // Planned BHmixGrid Strategy
    let pb = new PlannedBHmixGrid("PlannedBHmixGrid", initTotalAssets, nDays, pList);

    // Grid Strategy (const q)
    // let maxPrice = 300;
    // let minPrice = 25;
    // let nTable = 55;
    // let argsGQ: (number | string)[] = [maxPrice, minPrice, nTable, 0];
    // let gq = new GridConstQ("GridConstQ", initTotalAssets, nDays, pList);

    // Grid Strategy (const ratio)
    let argsGR: (number | string)[] = [0.01, 0.5, 0];
    let gr = new GridConstRatio("GridConstRatio", initTotalAssets, nDays, pList);

    // Chicken Strategy
    let rc = 0.1;
    let runawayRate = 0.85;
    let argsC: (number | string)[] = [rc, 0, runawayRate];
    let c = new Chicken("Chicken", initTotalAssets, nDays, pList);

    if (option1 !== null && option2 !== null && option3 !== null && startBtn !== null && option4 !== null && comparisonOption !== null) {
        option1.innerHTML = b.name;
        option1.addEventListener("click", (e) => selectStrategy(e, b, argsB));

        option2.innerHTML = pb.name;
        option2.addEventListener("click", (e) => selectStrategy(e, pb, argsB));

        option3.innerHTML = gr.name;
        option3.addEventListener("click", (e) => selectStrategy(e, gr, argsGR));

        option4.innerHTML = c.name;
        option4.addEventListener("click", (e) => selectStrategy(e, c, argsC));

        comparisonOption.addEventListener("click", (e) => compareStrategies(e, [[b, argsB], [pb, argsB], [gr, argsGR], [c, argsC]]));

        comparisonOption.click();
        startBtn.addEventListener("click", () => location.reload());
    }
}

main();