export class MyGoogleChart {
    constructor() {
        this.CHART_HEIGHT = window.innerWidth / 3.3;
        this.CHART_WIDTH = window.innerHeight / 2.5;
    }
    applyChart(dataIn, options, chartType, targetDiv) {
        let data = google.visualization.arrayToDataTable(dataIn);
        let chart = new google.visualization[chartType](targetDiv);
        chart.draw(data, options);
    }
    drawCashInvestedChart(startDate, dataIn, chartDiv) {
        google.charts.load('current', { 'packages': ["corechart"] });
        startDate = startDate.split("-").join("");
        dataIn = dataIn.filter(i => i[0] == "Date" || (typeof i[0] == "string" && parseInt(i[0]) >= parseInt(startDate)));
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
    drawComponentChart(dataIn, chartDiv) {
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
    drawCompareChart(cashInvested, securityMktVal, cashExtracted, handlingFee, chartDiv) {
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
    drawEachStockPQChart(dataIn, chartDiv) {
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
    drawEachStockCompareChart(cashInvested, securityMktVal, chartDiv) {
        google.charts.load('current', { 'packages': ['corechart', 'bar'] });
        let mktColor = "#1AA260";
        if (securityMktVal > cashInvested)
            mktColor = "#DE5246";
        let dataIn = [
            ["Assets", "", { role: "style" }],
            ["現金投入", cashInvested, "#aaa"],
            ["證券市值", securityMktVal, mktColor],
        ];
        let options = {
            title: `報酬率 ${Math.round((securityMktVal / cashInvested - 1) * 10000) / 100}%`,
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
