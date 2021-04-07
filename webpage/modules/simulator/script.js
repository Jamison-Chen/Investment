import { BHmixGrid, GridConstQ, Chicken } from './simulator.js';
const priceGraph = document.getElementById("price-graph");
const assetsFraph = document.getElementById("assets-graph");
const allOptions = document.getElementsByClassName("strategy-option");
const bhmixgridOption = document.getElementById("bh-mix-grid");
const gridconstqOption = document.getElementById("grid-constant-q");
const chickenOption = document.getElementById("chicken");
const startBtn = document.getElementById("start-btn");
function applyPriceChart(dataIn) {
    if (priceGraph != null) {
        google.charts.load('current', { 'packages': ["corechart"] });
        let options = {
            title: '價格走勢',
            titleTextStyle: {
                fontSize: 16,
                bold: false,
                color: "#777"
            },
            curveType: 'none',
            width: priceGraph.offsetWidth - 1,
            height: priceGraph.offsetHeight - 1,
            legend: { position: 'none' },
        };
        google.charts.setOnLoadCallback(() => drawSimulatedChart(dataIn, options, "LineChart", priceGraph));
    }
}
function applyAssetsCharts(dataIn) {
    if (assetsFraph != null) {
        google.charts.load('current', { 'packages': ["corechart"] });
        let options = {
            title: '各項資產',
            titleTextStyle: {
                fontSize: 16,
                bold: false,
                color: "#777"
            },
            curveType: 'none',
            width: assetsFraph.offsetWidth - 1,
            height: assetsFraph.offsetHeight - 1,
        };
        google.charts.setOnLoadCallback(() => drawSimulatedChart(dataIn, options, "LineChart", assetsFraph));
    }
}
function drawSimulatedChart(dataIn, options, chartType, targetDiv) {
    let data = google.visualization.arrayToDataTable(dataIn);
    let chart = new google.visualization[chartType](targetDiv);
    chart.draw(data, options);
}
function simulatePriceFluct(initP, nDays) {
    // let deltaPList = [1];
    let pList = [initP];
    for (let i = 0; i < nDays - 1; i++) {
        pList.push(pList[pList.length - 1] * normal(1, 0.035));
    }
    return pList;
}
function normal(mu, std) {
    let u = 0, v = 0;
    while (u === 0)
        u = Math.random(); //Converting [0,1) to (0,1)
    while (v === 0)
        v = Math.random();
    return std * Math.sqrt(-2.0 * Math.log(u)) * Math.cos(2.0 * Math.PI * v) + mu;
}
function selectStrategy(e, s) {
    for (let each of allOptions) {
        each.classList.remove("active");
    }
    if (e.currentTarget instanceof HTMLElement) {
        e.currentTarget.classList.add("active");
    }
    execStrategy(s);
}
function execStrategy(s) {
    s.followStrategy();
    console.log(s.totalAssetsList);
    let comprehensiveData = [["Day", "總資產", "證券市值", "投入現金", "剩餘現金"]];
    let priceData = [["Day", "Price"]];
    for (let i = 0; i < s.nDays; i++) {
        let eachComprehensive = [i + 1, s.totalAssetsList[i], s.securMktValList[i], s.cumulInvestCashList[i], s.cashList[i]];
        let eachPrice = [i + 1, s.pList[i]];
        comprehensiveData.push(eachComprehensive);
        priceData.push(eachPrice);
    }
    applyPriceChart(priceData);
    applyAssetsCharts(comprehensiveData);
}
function simulatorMain() {
    let initP = 100;
    let initTotalAssets = 10000;
    let nDays = 360;
    let pList = simulatePriceFluct(initP, nDays);
    // BHmixGrid Strategy
    let r = 0.05;
    let b = new BHmixGrid(initTotalAssets, nDays, pList, r);
    // Grid Strategy (const q)
    let maxPrice = 300;
    let minPrice = 0;
    let nTable = 50;
    let baseQ = 5;
    let gq = new GridConstQ(initTotalAssets, baseQ, nDays, pList, maxPrice, minPrice, nTable);
    // Grid Strategy (const ratio)
    // Chicken Strategy
    let c = new Chicken(initTotalAssets, nDays, pList, r);
    if (bhmixgridOption != null && gridconstqOption != null && chickenOption != null && startBtn != null) {
        bhmixgridOption.addEventListener("click", (e) => { selectStrategy(e, b); });
        gridconstqOption.addEventListener("click", (e) => { selectStrategy(e, gq); });
        chickenOption.addEventListener("click", (e) => { selectStrategy(e, c); });
        bhmixgridOption.click();
        startBtn.addEventListener("click", _ => location.reload());
    }
}
simulatorMain();
