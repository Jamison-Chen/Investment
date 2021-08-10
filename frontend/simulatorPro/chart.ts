export class MyGoogleChart {
    protected _option: any;
    protected _chartType: string;
    protected _chart: any;
    public constructor() {
        this._option = {};
        this._chartType = "";
    }
    public drawChart(dataIn: any[][]): void {
        let data = google.visualization.arrayToDataTable(dataIn);
        this._chart.draw(data, this._option);
    }
}

export class AssetChart extends MyGoogleChart {
    public constructor(chartDiv: HTMLElement) {
        super();
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
    public constructor(chartDiv: HTMLElement) {
        super();
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
    public constructor(chartDiv: HTMLElement) {
        super();
        this._option = {
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
    public constructor(chartDiv: HTMLElement) {
        super();
        this._option = {
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