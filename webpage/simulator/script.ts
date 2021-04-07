import { BHmixGrid, GridConstQ } from './simulator.js';
const priceGraph = document.getElementById("price-graph");
const assetsFraph = document.getElementById("assets-graph");
const allOptions = document.getElementsByClassName("strategy-option");
const bhmixgridOption = document.getElementById("bh-mix-grid");
const gridconstqOption = document.getElementById("grid-constant-q");
const startBtn = document.getElementById("start-btn");

function applyPriceChart(dataIn: (string | number)[][]): void {
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
            width: priceGraph.offsetWidth,
            height: priceGraph.offsetHeight,
            legend: { position: 'none' },
            // hAxis: {
            //     title: "Day"
            // }
        };
        google.charts.setOnLoadCallback(() => drawSimulatedChart(dataIn, options, "LineChart", priceGraph));
    }
}

function applyAssetsCharts(dataIn: (string | number)[][]): void {
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
            width: assetsFraph.offsetWidth,
            height: assetsFraph.offsetHeight,
            // legend: { position: 'none' },
            // hAxis: {
            //     title: "Day"
            // }
        };
        google.charts.setOnLoadCallback(() => drawSimulatedChart(dataIn, options, "LineChart", assetsFraph));
    }
}

function drawSimulatedChart(dataIn: any[][], options: any, chartType: string, targetDiv: HTMLElement | null): void {
    let data = google.visualization.arrayToDataTable(dataIn);
    let chart = new google.visualization[chartType](targetDiv);
    chart.draw(data, options);
}

function simulatePriceFluct(initP: number, nDays: number): number[] {
    // let deltaPList = [1];
    let pList = [initP];
    for (let i = 0; i < nDays - 1; i++) {
        pList.push(pList[pList.length - 1] * normal(1, 0.035));
    }
    return pList;
}

function normal(mu: number, std: number): number {
    let u = 0, v = 0;
    while (u === 0) u = Math.random(); //Converting [0,1) to (0,1)
    while (v === 0) v = Math.random();
    return std * Math.sqrt(-2.0 * Math.log(u)) * Math.cos(2.0 * Math.PI * v) + mu;
}

function selectStrategy(e: Event, s: BHmixGrid | GridConstQ): void {
    for (let each of allOptions) {
        each.classList.remove("active");
    }
    if (e.currentTarget instanceof HTMLElement) {
        e.currentTarget.classList.add("active");
    }
    execStrategy(s);
}

function execStrategy(s: BHmixGrid | GridConstQ): void {
    s.followStrategy();
    let comprehensiveData: (string | number)[][] = [["Day", "總資產", "證券市值", "投入現金", "剩餘現金"]];
    let priceData: (string | number)[][] = [["Day", "Price"]];
    for (let i = 0; i < s.nDays; i++) {
        let eachComprehensive = [i + 1, s.totalAssetsList[i], s.securMktValList[i], s.cumulInvestCashList[i], s.cashList[i]]
        let eachPrice = [i + 1, s.pList[i]];
        comprehensiveData.push(eachComprehensive);
        priceData.push(eachPrice);
    }
    applyPriceChart(priceData);
    applyAssetsCharts(comprehensiveData);
}

function simulatorMain(): void {
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


    if (bhmixgridOption != null && gridconstqOption != null) {
        bhmixgridOption.addEventListener("click", (e) => { selectStrategy(e, b) })
        gridconstqOption.addEventListener("click", (e) => { selectStrategy(e, gq) })
        bhmixgridOption.click();
        startBtn?.addEventListener("click", _ => location.reload());
    }
}

simulatorMain();