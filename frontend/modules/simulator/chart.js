export class MyGoogleChart {
    constructor(chartDiv) {
        this._chartDiv = chartDiv;
        this._chartType = "";
    }
}
export class PriceChart extends MyGoogleChart {
    constructor(chartDiv) {
        super(chartDiv);
        this._chartType = "LineChart";
        google.charts.load('current', { 'packages': ["corechart"] });
        google.charts.setOnLoadCallback(() => {
            this._chart = new google.visualization[this._chartType](chartDiv);
        });
    }
    drawChart(dataIn) {
        // google.charts.setOnLoadCallback(() => {
        if (google.visualization !== undefined && this._chart !== undefined) {
            let data = google.visualization.arrayToDataTable(dataIn);
            let option = {
                title: '價格走勢',
                titleTextStyle: {
                    fontSize: 16,
                    bold: false,
                    color: "#777"
                },
                curveType: 'none',
                width: this._chartDiv.offsetWidth - 1,
                height: this._chartDiv.offsetHeight - 1,
                legend: { position: 'none' }
            };
            this._chart.draw(data, option);
        }
        else
            setTimeout(() => this.drawChart(dataIn), 50);
        // });
    }
}
export class AssetChart extends MyGoogleChart {
    constructor(chartDiv) {
        super(chartDiv);
        this._chartType = "LineChart";
        google.charts.load('current', { 'packages': ["corechart"] });
        google.charts.setOnLoadCallback(() => {
            this._chart = new google.visualization[this._chartType](chartDiv);
        });
    }
    drawChart(dataIn, title) {
        if (google.visualization !== undefined && this._chart !== undefined) {
            let data = google.visualization.arrayToDataTable(dataIn);
            let option = {
                title: title,
                titleTextStyle: {
                    fontSize: 16,
                    bold: false,
                    color: "#777"
                },
                curveType: 'none',
                width: this._chartDiv.offsetWidth - 1,
                height: this._chartDiv.offsetHeight - 1,
                // legend: { position: 'none' },
                // hAxis: {
                //     title: "Day"
                // }
            };
            this._chart.draw(data, option);
        }
        else
            setTimeout(() => this.drawChart(dataIn, title), 50);
    }
}
