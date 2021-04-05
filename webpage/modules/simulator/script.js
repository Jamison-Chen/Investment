import { BHmixGrid } from './simulator.js';
const graphContainer = document.getElementById("graph-container");
function applyCharts(dataIn) {
    google.charts.load('current', { 'packages': ["corechart"] });
    let options = {
        title: '累計投入現金',
        titleTextStyle: {
            fontSize: 14,
            bold: true,
            color: "#000"
        },
        curveType: 'none',
        width: window.innerWidth * 0.7,
        height: window.innerHeight * 0.7,
        legend: { position: 'none' },
        hAxis: {
            title: ""
        }
    };
    google.charts.setOnLoadCallback(() => drawSimulatedChart(dataIn, options, "LineChart", graphContainer));
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
        pList.push(pList[pList.length - 1] * normal(1, 0.04));
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
function simulatorMain() {
    let initP = 100;
    let initTotalAssets = 10000;
    let nDays = 360;
    let pList = simulatePriceFluct(initP, nDays);
    let r = 0.05;
    let b = new BHmixGrid(initTotalAssets, nDays, pList, r);
    b.followStrategy();
    let data = [["day", "price", "TA"]];
    for (let i = 0; i < b.nDays; i++) {
        let eachDay = [i + 1, b.cashList[i], b.totalAssetsList[i]];
        data.push(eachDay);
    }
    applyCharts(data);
}
simulatorMain();
