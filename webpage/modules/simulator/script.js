"use strict";
const graphContainer = document.getElementById("graph-container");
function applyCharts() {
    google.charts.load('current', { 'packages': ["corechart"] });
    let dataIn = [
        ['Year', 'Sales', 'Expenses'],
        ['2004', 1000, 400],
        ['2005', 1170, 460],
        ['2006', 660, 1120],
        ['2007', 1030, 540]
    ];
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
function simulatorMain() {
    applyCharts();
}
simulatorMain();
