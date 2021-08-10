export class MyGoogleChart {
    protected _chartDiv: HTMLElement;
    protected _chartType: string;
    protected _chart: any;
    public constructor(chartDiv: HTMLElement) {
        this._chartDiv = chartDiv;
        this._chartType = "";
    }
}

export class PriceChart extends MyGoogleChart {
    public constructor(chartDiv: HTMLElement) {
        super(chartDiv);
        this._chartType = "LineChart";
        google.charts.load('current', { 'packages': ["corechart"] });
        google.charts.setOnLoadCallback(() => {
            this._chart = new google.visualization[this._chartType](chartDiv);
        });
    }
    public drawChart(dataIn: any[][]): void {
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
        } else setTimeout(() => this.drawChart(dataIn), 50);
        // });
    }
}

export class AssetChart extends MyGoogleChart {
    public constructor(chartDiv: HTMLElement) {
        super(chartDiv);
        this._chartType = "LineChart";
        google.charts.load('current', { 'packages': ["corechart"] });
        google.charts.setOnLoadCallback(() => {
            this._chart = new google.visualization[this._chartType](chartDiv);
        });
    }
    public drawChart(dataIn: any[][], title: string): void {
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
        } else setTimeout(() => this.drawChart(dataIn, title), 50);
    }
}