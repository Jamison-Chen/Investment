import { BHmixGrid, PlannedBHmixGrid, Chicken, CRG } from './strategy.js';
import { AssetChart, PriceChart } from './chart.js';
let recorderOption = document.getElementById("recorder-option");
let simulatorOption = document.getElementById("simulator-option");
let simulatorProOption = document.getElementById("simulator-pro-option");
let priceChartDiv = document.getElementById("price-chart");
let assetsChartDiv = document.getElementById("assets-chart");
let priceChartDrawer;
let assetsChartDrawer;
let allOptions = document.getElementsByClassName("strategy-option");
let option1 = document.getElementById("option1");
let option2 = document.getElementById("option2");
let option3 = document.getElementById("option3");
let option4 = document.getElementById("option4");
// let option5 = document.getElementById("option5");
let comparisonOption = document.getElementById("comparison");
let startBtn = document.getElementById("start-btn");
function simulatePriceFluct(initP, nDays) {
    let pList = [initP];
    for (let i = 0; i < nDays - 1; i++) {
        // Ramdom Walk
        pList.push(Math.round(pList[pList.length - 1] * normalSample(1, 0.033) * 100) / 100);
    }
    return pList;
}
function normalSample(mu, std) {
    let u = 0, v = 0;
    while (u === 0)
        u = Math.random(); //Converting [0,1) to (0,1)
    while (v === 0)
        v = Math.random();
    return std * Math.sqrt(-2.0 * Math.log(u)) * Math.cos(2.0 * Math.PI * v) + mu;
}
function selectStrategy(e, s, args) {
    for (let each of allOptions)
        each.classList.remove("active");
    if (e.currentTarget instanceof HTMLElement)
        e.currentTarget.classList.add("active");
    execStrategy(s, args);
}
function execStrategy(s, args) {
    if (s.dailyQList.length === 0)
        s.followStrategy(...args);
    let comprehensiveData = [["Day", "總資產", "證券市值", "投入現金", "剩餘現金"]];
    for (let i = 0; i < s.nDays; i++) {
        let eachComprehensiveData = [i + 1, s.totalAssetsList[i], s.securMktValList[i], s.cumulInvestCashList[i], s.cashList[i]];
        comprehensiveData.push(eachComprehensiveData);
    }
    assetsChartDrawer.drawChart(comprehensiveData, "各項資產");
}
function compareStrategies(e, strategies) {
    for (let each of allOptions)
        each.classList.remove("active");
    if (e.currentTarget instanceof HTMLElement)
        e.currentTarget.classList.add("active");
    let comparedData = [["Day"]];
    for (let eachStrategy of strategies) {
        comparedData[0].push(eachStrategy[0].name);
        if (eachStrategy[0].dailyQList.length === 0) {
            eachStrategy[0].followStrategy(...eachStrategy[1]);
        }
        for (let i = 0; i < eachStrategy[0].totalAssetsList.length; i++) {
            try {
                comparedData[i + 1].push(eachStrategy[0].totalAssetsList[i]);
            }
            catch (_a) {
                comparedData.push([i + 1, eachStrategy[0].totalAssetsList[i]]);
            }
        }
    }
    assetsChartDrawer.drawChart(comparedData, "獲利比較");
}
function main() {
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
    let priceData = [["Day", "Price"]];
    for (let i = 0; i < pList.length; i++) {
        let eachPrice = [i + 1, pList[i]];
        priceData.push(eachPrice);
    }
    priceChartDrawer.drawChart(priceData);
    // BHmixGrid Strategy
    let rb = 0.05;
    let argsB = [rb, 0];
    let b = new BHmixGrid("BHmixGrid", initTotalAssets, nDays, pList);
    // Planned BHmixGrid Strategy
    let pb = new PlannedBHmixGrid("PlannedBHmixGrid", initTotalAssets, nDays, pList);
    // Grid Strategy (const q)
    // let maxPrice = 300;
    // let minPrice = 25;
    // let nTable = 55;
    // let argsGQ: (number | string)[] = [maxPrice, minPrice, nTable, 0];
    // let gq = new GridConstQ("GridConstQ", initTotalAssets, nDays, pList);
    // CRG
    let argsCRG_1 = [0.1, 0.5, 0];
    let crg_1 = new CRG("CRG", initTotalAssets, nDays, pList);
    // CRG
    // let argsCRG_2: (number | string)[] = [0.01, 0.5, 0];
    // let crg_2 = new CRG("CRG", initTotalAssets, nDays, pList);
    // CRG
    // let argsCRG_3: (number | string)[] = [1, 0.5, 0];
    // let crg_3 = new CRG("CRG", initTotalAssets, nDays, pList);
    // Chicken Strategy
    let rc = 0.1;
    let runawayRate = 0.85;
    let argsC = [rc, 0, runawayRate];
    let c = new Chicken("Chicken", initTotalAssets, nDays, pList);
    // CRG2
    // let argsCRG2_1: (number | string)[] = [0.1, 0.5, 0];
    // let crg2_1 = new CRG2("CRG2", initTotalAssets, nDays, pList);
    if (option1 !== null && option2 !== null && option3 !== null && option4 !== null && comparisonOption !== null && startBtn !== null) {
        option1.innerHTML = b.name;
        option1.addEventListener("click", (e) => selectStrategy(e, b, argsB));
        // option1.addEventListener("click", (e) => selectStrategy(e, crg_1, argsCRG_1));
        option2.innerHTML = pb.name;
        option2.addEventListener("click", (e) => selectStrategy(e, pb, argsB));
        // option2.addEventListener("click", (e) => selectStrategy(e, crg_2, argsCRG_2));
        option3.innerHTML = crg_1.name;
        option3.addEventListener("click", (e) => selectStrategy(e, crg_1, argsCRG_1));
        option4.innerHTML = c.name;
        option4.addEventListener("click", (e) => selectStrategy(e, c, argsC));
        // option5.innerHTML = crg2_1.name;
        // option5.addEventListener("click", (e) => selectStrategy(e, crg2_1, argsCRG2_1));
        comparisonOption.addEventListener("click", (e) => compareStrategies(e, [[b, argsB], [pb, argsB], [crg_1, argsCRG_1], [c, argsC]]));
        // comparisonOption.addEventListener("click", (e) => compareStrategies(e, [[crg_1, argsCRG_1], [crg_2, argsCRG_2], [crg_3, argsCRG_3], [c, argsC]]));
        startBtn.addEventListener("click", () => location.reload());
        comparisonOption.click();
    }
}
main();
