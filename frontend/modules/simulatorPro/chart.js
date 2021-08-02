export class MyGoogleChart {
    static applyChart(dataIn, options, chartType, targetDiv) {
        targetDiv.innerHTML = "";
        let data = google.visualization.arrayToDataTable(dataIn);
        let chart = new google.visualization[chartType](targetDiv);
        chart.draw(data, options);
    }
    static drawMarketEqChart(dataIn, chartDiv) {
        if (chartDiv instanceof HTMLElement) {
            google.charts.load('current', { 'packages': ["corechart"] });
            let options = {
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
            google.charts.setOnLoadCallback(() => this.applyChart(dataIn, options, "LineChart", chartDiv));
        }
    }
    static drawDealAmountChart(dataIn, chartDiv) {
        if (chartDiv instanceof HTMLElement) {
            google.charts.load('current', { 'packages': ["corechart"] });
            let options = {
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
            google.charts.setOnLoadCallback(() => this.applyChart(dataIn, options, "ColumnChart", chartDiv));
        }
    }
    static drawCurveChart(dataIn, chartDiv) {
        if (chartDiv instanceof HTMLElement) {
            google.charts.load('current', { 'packages': ["corechart"] });
            let options = {
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
            google.charts.setOnLoadCallback(() => this.applyChart(dataIn, options, "LineChart", chartDiv));
        }
    }
    static drawAssetsCharts(dataIn, chartDiv) {
        if (chartDiv instanceof HTMLElement) {
            google.charts.load('current', { 'packages': ["corechart"] });
            let options = {
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
            google.charts.setOnLoadCallback(() => this.applyChart(dataIn, options, "LineChart", chartDiv));
        }
    }
}
