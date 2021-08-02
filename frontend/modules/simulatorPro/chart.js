export class MyGoogleChart {
    constructor(chartDiv) {
        this._chartDiv = chartDiv;
        this._option = {};
        this._chartType = "";
    }
    drawChart(dataIn) {
        let data = google.visualization.arrayToDataTable(dataIn);
        this._chart.draw(data, this._option);
    }
}
export class AssetChart extends MyGoogleChart {
    constructor(chartDiv) {
        super(chartDiv);
        this._option = {
            title: "My Asset",
            titleTextStyle: {
                fontSize: 16,
                bold: false,
                color: "#777"
            },
            curveType: 'none',
            width: chartDiv.offsetWidth * 0.98,
            height: chartDiv.offsetHeight * 0.98,
            chartArea: { left: "15%", top: "10%", width: '65%', height: '80%' }
        };
        this._chartType = "LineChart";
        google.charts.load('current', { 'packages': ["corechart"] });
        google.charts.setOnLoadCallback(() => {
            this._chart = new google.visualization[this._chartType](chartDiv);
        });
    }
}
export class CurveChart extends MyGoogleChart {
    constructor(chartDiv) {
        super(chartDiv);
        this._option = {
            // title: 'Demand / Supply Curve',
            // titleTextStyle: {
            //     fontSize: 14,
            //     bold: false,
            //     color: "#777"
            // },
            curveType: 'none',
            width: chartDiv.offsetWidth,
            height: chartDiv.offsetHeight,
            vAxis: { title: 'Q' },
            hAxis: { title: 'P' },
            chartArea: { left: "10%", top: "5%", width: '75%', height: '90%' }
        };
        this._chartType = "LineChart";
        google.charts.load('current', { 'packages': ["corechart"] });
        google.charts.setOnLoadCallback(() => {
            this._chart = new google.visualization[this._chartType](chartDiv);
        });
    }
}
export class DealAmountChart extends MyGoogleChart {
    constructor(chartDiv) {
        super(chartDiv);
        this._option = {
            // title: 'Deal Amount',
            // titleTextStyle: {
            //     fontSize: 14,
            //     bold: false,
            //     color: "#777"
            // },
            width: chartDiv.offsetWidth,
            height: chartDiv.offsetHeight,
            legend: { position: "none" },
            series: { 0: { color: "#888" } },
            chartArea: { left: "10%", top: "5%", width: '75%', height: '90%' }
        };
        this._chartType = "ColumnChart";
        google.charts.load('current', { 'packages': ["corechart"] });
        google.charts.setOnLoadCallback(() => {
            this._chart = new google.visualization[this._chartType](chartDiv);
        });
    }
}
export class MarketEqChart extends MyGoogleChart {
    constructor(chartDiv) {
        super(chartDiv);
        this._option = {
            // title: 'Given Price vs. Market Equilibrium',
            // titleTextStyle: {
            //     fontSize: 14,
            //     bold: false,
            //     color: "#777"
            // },
            curveType: 'none',
            width: chartDiv.offsetWidth,
            height: chartDiv.offsetHeight,
            chartArea: { left: "10%", top: "5%", width: '75%', height: '90%' }
        };
        this._chartType = "LineChart";
        google.charts.load('current', { 'packages': ["corechart"] });
        google.charts.setOnLoadCallback(() => {
            this._chart = new google.visualization[this._chartType](chartDiv);
        });
    }
}
