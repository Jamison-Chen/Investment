export class MyGoogleChart {
    constructor() { }
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
            width: window.innerWidth / 3.5,
            height: window.innerHeight / 2.5,
            legend: { position: 'none' },
            hAxis: {
                title: ""
            }
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
            width: window.innerWidth / 3.5,
            height: window.innerHeight / 2.5,
            chartArea: {
                left: '10%',
                top: '20%',
                width: '80%',
                height: '80%'
            }
        };
        google.charts.setOnLoadCallback(() => this.applyChart(dataIn, options, "PieChart", chartDiv));
    }
    drawCompareChart(cashInvested, securityMktVal, cashExtracted, handlingFee, chartDiv) {
        google.charts.load('current', { 'packages': ['corechart', 'bar'] });
        let dataIn = [
            ["Assets", "Value", { role: "style" }],
            ["Cash Invested", cashInvested, "#0a5"],
            ["Security Mkt Val", securityMktVal, "#b00"],
            ["Cash Extracted", cashExtracted, "#37e"],
            ["Fee", handlingFee, "#aaa"]
        ];
        let options = {
            title: '現金與市值',
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
            width: window.innerWidth / 3.5,
            height: window.innerHeight / 2.5,
            legend: { position: "none" }
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
            width: window.innerWidth / 3.5,
            height: window.innerHeight / 2.5
        };
        google.charts.setOnLoadCallback(() => this.applyChart(dataIn, options, "Histogram", chartDiv));
    }
    drawEachStockCompareChart(cashInvested, securityMktVal, chartDiv) {
        google.charts.load('current', { 'packages': ['corechart', 'bar'] });
        let mktColor = "#0a5";
        if (securityMktVal > cashInvested) {
            mktColor = "#b00";
        }
        let dataIn = [
            ["Assets", "Value", { role: "style" }],
            ["Cash Invested", cashInvested, "#aaa"],
            ["Market Value", securityMktVal, mktColor],
        ];
        let options = {
            title: '現金與市值',
            titleTextStyle: {
                fontSize: 14,
                bold: true,
                color: "#000"
            },
            vAxis: {
                minValue: 0
            },
            bar: { groupWidth: "40%" },
            width: window.innerWidth / 3.5,
            height: window.innerHeight / 2.5,
            legend: { position: "none" }
        };
        google.charts.setOnLoadCallback(() => this.applyChart(dataIn, options, "ColumnChart", chartDiv));
    }
}
