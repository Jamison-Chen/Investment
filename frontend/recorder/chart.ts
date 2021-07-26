export class MyGoogleChart {
    private CHART_HEIGHT: number;
    private CHART_WIDTH: number;
    constructor() {
        this.CHART_HEIGHT = window.innerWidth / 3.3;
        this.CHART_WIDTH = window.innerHeight / 2.5;
    }
    public applyChart(dataIn: any[][], options: any, chartType: string, targetDiv: HTMLElement | null): void {
        let data = google.visualization.arrayToDataTable(dataIn);
        let chart = new google.visualization[chartType](targetDiv);
        chart.draw(data, options);
    }
    public drawCashInvestedChart(startDate: string, dataIn: (string | number)[][], chartDiv: HTMLElement | null): void {
        google.charts.load('current', { 'packages': ["corechart"] });
        startDate = startDate.split("-").join("");
        dataIn = dataIn.filter(i => i[0] === "Date" || (typeof i[0] === "string" && parseInt(i[0]) >= parseInt(startDate)));
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
        google.charts.setOnLoadCallback(() => this.applyChart(dataIn, options, "LineChart", chartDiv));
    }
    public drawMktValPieChart(dataIn: (string | number)[][], chartDiv: HTMLElement | null): void {
        google.charts.load('current', { 'packages': ["corechart"] });
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
        google.charts.setOnLoadCallback(() => this.applyChart(dataIn, options, "PieChart", chartDiv));
    }
    public drawCompareChart(cashInvested: number, securityMktVal: number, cashExtracted: number, handlingFee: number, chartDiv: HTMLElement | null): void {
        google.charts.load('current', { 'packages': ['corechart', 'bar'] });
        let dataIn = [
            ["Assets", "", { role: "style" }],
            ["現金投入", cashInvested, "#1AA260"],
            ["證券市值", securityMktVal, "#DE5246"],
            ["實現損益", cashExtracted, "#4C8BF5"],
            ["費用", handlingFee, "#aaa"]
        ];
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
        google.charts.setOnLoadCallback(() => this.applyChart(dataIn, options, "ColumnChart", chartDiv));
    }
    public drawEachStockPQChart(dataIn: any[][], chartDiv: HTMLElement | null): void {
        google.charts.load("current", { packages: ["corechart"] });
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
        google.charts.setOnLoadCallback(() => this.applyChart(dataIn, options, "Histogram", chartDiv));
    }
    public drawEachStockCompareChart(cashInvested: number, securityMktVal: number, cashDividend: number, chartDiv: HTMLElement | null): void {
        google.charts.load('current', { 'packages': ['corechart', 'bar'] });
        let mktColor = "#1AA260";
        if (securityMktVal > cashInvested) mktColor = "#DE5246";
        let dataIn = [
            ["Assets", "", { role: "style" }],
            ["現金投入", cashInvested, "#aaa"],
            ["證券市值", securityMktVal, mktColor],
            ["現金股利", cashDividend, "#FFCE44"]
        ];
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
        google.charts.setOnLoadCallback(() => this.applyChart(dataIn, options, "ColumnChart", chartDiv));
    }
}