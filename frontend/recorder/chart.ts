export class MyGoogleChart {
    protected CHART_HEIGHT: number;
    protected CHART_WIDTH: number;
    protected _chartType: string;
    protected _chart: any;
    public constructor() {
        this.CHART_HEIGHT = window.innerWidth / 3.3;
        this.CHART_WIDTH = window.innerHeight / 2.5;
        this._chartType = "";
    }
}

export class CashInvestedChart extends MyGoogleChart {
    public constructor(chartDiv: any) {
        super();
        this._chartType = "LineChart";
        google.charts.load('current', { packages: ["corechart"] });
        google.charts.setOnLoadCallback(() => {
            this._chart = new google.visualization[this._chartType](chartDiv);
        });
    }
    public drawChart(startDate: string, dataIn: (string | number)[][]): void {
        if (google.visualization !== undefined && this._chart !== undefined) {
            startDate = startDate.split("-").join("");
            dataIn = dataIn.filter(i => i[0] === "Date" || (typeof i[0] === "string" && parseInt(i[0]) >= parseInt(startDate)));
            let data = google.visualization.arrayToDataTable(dataIn);
            let options = {
                title: '累計投入現金',
                titleTextStyle: {
                    fontSize: 14,
                    bold: true,
                    color: "#000"
                },
                curveType: 'none',
                width: this.CHART_HEIGHT,
                height: this.CHART_WIDTH,
                legend: { position: 'none' },
                hAxis: {
                    title: ""
                },
                chartArea: { left: "16%", top: "14%", width: '84%', height: '70%' }
            };
            this._chart.draw(data, options);
        } else setTimeout(() => this.drawChart(startDate, dataIn), 50);
    }
}

export class MktValPieChart extends MyGoogleChart {
    public constructor(chartDiv: any) {
        super();
        this._chartType = "PieChart";
        google.charts.load('current', { 'packages': ["corechart"] });
        google.charts.setOnLoadCallback(() => {
            this._chart = new google.visualization[this._chartType](chartDiv);
        });
    }
    public drawChart(dataIn: (string | number)[][]): void {
        if (google.visualization !== undefined && this._chart !== undefined) {
            let data = google.visualization.arrayToDataTable(dataIn);
            let options = {
                title: "各證券市值佔比",
                titleTextStyle: {
                    fontSize: 14,
                    bold: true,
                    color: "#000"
                },
                width: this.CHART_HEIGHT,
                height: this.CHART_WIDTH,
                legend: {
                    alignmant: 'right',
                },
                chartArea: { left: '20%', top: '14%', width: '100%', height: '86%' }
            };
            this._chart.draw(data, options);
        } else setTimeout(() => this.drawChart(dataIn), 50);
    }
}

export class CompareChart extends MyGoogleChart {
    public constructor(chartDiv: any) {
        super();
        this._chartType = "ColumnChart";
        google.charts.load('current', { 'packages': ['corechart', 'bar'] });
        google.charts.setOnLoadCallback(() => {
            this._chart = new google.visualization[this._chartType](chartDiv);
        });
    }
    public drawChart(cashInvested: number, securityMktVal: number, cashExtracted: number, handlingFee: number): void {
        if (google.visualization !== undefined && this._chart !== undefined) {
            let data = [
                ["Assets", "", { role: "style" }],
                ["現金投入", cashInvested, "#1AA260"],
                ["證券市值", securityMktVal, "#DE5246"],
                ["實現損益", cashExtracted, "#4C8BF5"],
                ["費用", handlingFee, "#aaa"]
            ];
            data = google.visualization.arrayToDataTable(data);
            let options = {
                title: `報酬率 ${Math.round(((securityMktVal + cashExtracted - handlingFee) / cashInvested - 1) * 10000) / 100}%`,
                titleTextStyle: {
                    fontSize: 14,
                    bold: true,
                    color: "#000"
                },
                vAxis: {
                    minValue: 0,
                    scaleType: 'mirrorLog'
                },
                bar: { groupWidth: "40%" },
                width: this.CHART_HEIGHT,
                height: this.CHART_WIDTH,
                legend: { position: "none" },
                chartArea: { left: "16%", top: "14%", width: '80%', height: '70%' }
            };
            this._chart.draw(data, options);
        } else setTimeout(() => this.drawChart(cashInvested, securityMktVal, cashExtracted, handlingFee), 50);
    }
}

export class EachStockPQChart extends MyGoogleChart {
    public constructor(chartDiv: any) {
        super();
        this._chartType = "Histogram";
        google.charts.load('current', { 'packages': ["corechart"] });
        google.charts.setOnLoadCallback(() => {
            this._chart = new google.visualization[this._chartType](chartDiv);
        });
    }
    public drawChart(dataIn: (string | number)[][]): void {
        if (google.visualization !== undefined && this._chart !== undefined) {
            let data = google.visualization.arrayToDataTable(dataIn);
            let options = {
                title: '量價分配',
                legend: { position: 'none' },
                titleTextStyle: {
                    fontSize: 14,
                    bold: true,
                    color: "#000"
                },
                colors: ['#37e'],
                width: this.CHART_HEIGHT,
                height: this.CHART_WIDTH
            };
            this._chart.draw(data, options);
        } else setTimeout(() => this.drawChart(dataIn), 50);
    }
}

export class EachStockCompareChart extends MyGoogleChart {
    public constructor(chartDiv: any) {
        super();
        this._chartType = "ColumnChart";
        google.charts.load('current', { packages: ['corechart', 'bar'] });
        google.charts.setOnLoadCallback(() => {
            this._chart = new google.visualization[this._chartType](chartDiv);
        });
    }
    public drawChart(cashInvested: number, securityMktVal: number, cashDividend: number): void {
        if (google.visualization !== undefined && this._chart !== undefined) {
            let mktColor = "#1AA260";
            if (securityMktVal > cashInvested) mktColor = "#DE5246";
            let data = [
                ["Assets", "", { role: "style" }],
                ["現金投入", cashInvested, "#aaa"],
                ["證券市值", securityMktVal, mktColor],
                ["現金股利", cashDividend, "#FFCE44"]
            ];
            data = google.visualization.arrayToDataTable(data);
            let options = {
                title: `報酬率 ${Math.round((securityMktVal / (cashInvested - cashDividend) - 1) * 10000) / 100}%`,
                titleTextStyle: {
                    fontSize: 14,
                    bold: true,
                    color: "#000"
                },
                vAxis: {
                    minValue: 0
                },
                bar: { groupWidth: "40%" },
                width: this.CHART_HEIGHT,
                height: this.CHART_WIDTH,
                legend: { position: "none" }
            };
            this._chart.draw(data, options);
        } else setTimeout(() => this.drawChart(cashInvested, securityMktVal, cashDividend), 50);
    }
}