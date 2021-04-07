const viewToggler = document.getElementById("view-toggler");
const togglerMask = document.getElementById("toggler-mask");
const createRecordBtn = document.getElementById("create-trade-record-btn");
const createRecordContainer = document.getElementById("create-trade-record-form-container");
const createRecordForm = document.getElementById("create-record-form");
const allRecordFormInputs = document.getElementsByClassName("record-form-input")
const submitBtn = document.getElementById("submit-btn");
const createErrorDiv = document.getElementById("create-error");
const allTabs = document.getElementsByClassName("tab");
const tradeRecordTab = document.getElementById("trade-record-tab");
const stockInfoTab = document.getElementById("stock-info-tab");
const stockWarehouseTab = document.getElementById("stock-warehouse-tab");
const allTableContainers = document.getElementsByClassName("table-container");
const tradeRecordTableContainer = document.getElementById("trade-record-table-container");
const tradeRecordTableBody = document.querySelector("#trade-record-table tbody");
const stockInfoTableContainer = document.getElementById("stock-info-table-container");
const stockInfoTableBody = document.querySelector("#stock-info-table tbody");
const cashInvestedChart = document.getElementById('cash-invested-chart');
const componentChart = document.getElementById('component-chart');
const compareChart = document.getElementById('compare-chart');

let tradeRecordJson: any = {};
let stockInfoJson: any = {};
let allHoldingSids: Set<string> = new Set();
let stockWarehouse: any = {};  // structure: {aSid:{aPrice:curQ, ...}, ...}
let handlingFee = 0;
let cashInvested = 0;
let cashExtracted = 0
let securityMktVal = 0;

const endPoint = "http://127.0.0.1:5000/";  // localhost api test

// const endPoint = "https://stock-info-scraper.herokuapp.com/";    // remote api test

// window.addEventListener("keydown", (e) => {
//     if ((e instanceof KeyboardEvent && e.keyCode == 13)) {
//         tradeRecordCRUD();
//     }
// });

function tradeRecordCRUD(inData: any): Promise<void> {
    let outData = new URLSearchParams();
    for (let each in inData) {
        outData.append(each, inData[each]);
    }
    return fetch(`${endPoint}records`, { method: 'post', body: outData })
        .then(function (response) {
            return response.json();
        });;
}

function buildRecordTable(myData: any[]): void {
    if (tradeRecordTableBody != null) {
        for (let eachRecord of myData) {
            let tr = document.createElement("tr");
            tr.className = "trade-record-table-row";
            for (let eachField in eachRecord) {
                let td = document.createElement("td");
                td.className = eachField;
                const innerInput = document.createElement("span");
                innerInput.className = "input not-editing";
                innerInput.setAttribute("role", "textbox");
                innerInput.setAttribute("type", "number");
                innerInput.innerHTML = eachRecord[eachField];
                td.appendChild(innerInput);
                // Do not show the id in the table.
                if (eachField.toLowerCase() == "id") {
                    td.style.display = "none";
                }
                tr.appendChild(td)
            }
            // show the update/delete btn at the end of each row
            const crud = document.createElement("td");
            crud.className = "crud";
            const btnConfigList = [
                { "btnClassName": "update-btn", "btnDisplayName": "更改", "cllbackFunc": updateTradeRecord, "args": {} },
                { "btnClassName": "delete-btn", "btnDisplayName": "刪除", "cllbackFunc": deleteTradeRecord, "args": {} }
            ];
            let updateDeleteDiv = appendUpdateDeleteDiv(btnConfigList);
            crud.appendChild(updateDeleteDiv);
            tr.appendChild(crud);
            tradeRecordTableBody.appendChild(tr);
        }
    }
}

function buildStockWarehouse(myData: any[]): void {
    for (let each of allHoldingSids) {
        stockWarehouse[each] = {};
    }
    for (let each in myData) {
        let s = myData[each]["sid"];
        let t = myData[each]["deal-time"];
        stockWarehouse[s][t] = {};
    }
    for (let each in myData) {
        let s = myData[each]["sid"];
        let t = myData[each]["deal-time"];
        let p = myData[each]["deal-price"];
        let q = parseFloat(myData[each]["deal-quantity"]);
        if (stockWarehouse[s][t][p]) {
            stockWarehouse[s][t][p] += q;
        } else {
            stockWarehouse[s][t][p] = q;
        }
    }
}

async function createTradeRecord(e: Event): Promise<void> {
    let data: any = { "mode": "create" };
    let hasEmpty = false;
    for (let each of allRecordFormInputs) {
        if (each instanceof HTMLInputElement && each.value != null && each.value != undefined) {
            if (each.value != "") {
                data[each.name] = each.value;
            } else {
                hasEmpty = true;
            }
        }
    }
    if (!hasEmpty) {
        await tradeRecordCRUD(data);
        location.reload();
    } else {
        infoNotSufficientErr();
    }
}

function appendUpdateDeleteDiv(btnConfigList: { "btnClassName": string, "btnDisplayName": string, "cllbackFunc": Function, "args": any }[]): HTMLDivElement {
    const innerDiv = document.createElement("div");

    const btn1 = document.createElement("div");
    btn1.className = btnConfigList[0]["btnClassName"];
    btn1.innerHTML = btnConfigList[0]["btnDisplayName"];
    btn1.addEventListener("click", (e) => btnConfigList[0]["cllbackFunc"](e, btnConfigList[0]["args"]));

    const divideLine = document.createElement("div");
    divideLine.className = "divide-line";
    divideLine.innerHTML = " / ";

    const btn2 = document.createElement("div");
    btn2.className = btnConfigList[1]["btnClassName"];
    btn2.innerHTML = btnConfigList[1]["btnDisplayName"];
    btn2.addEventListener("click", (e) => btnConfigList[1]["cllbackFunc"](e, btnConfigList[1]["args"]));

    innerDiv.appendChild(btn1);
    innerDiv.appendChild(divideLine);
    innerDiv.appendChild(btn2);
    return innerDiv;
}

function updateTradeRecord(e: Event): void {
    let targetRowDOM = findEditedRow(e);
    let copyOriginal: any = {};
    if (targetRowDOM instanceof HTMLElement) {
        let allInputSpans = targetRowDOM.querySelectorAll(".input.not-editing");
        for (let each of allInputSpans) {
            // find each table td of the row being edited
            if (each.parentNode instanceof HTMLElement && each.parentNode.className != "id" && each.parentNode.className != "company-name") {
                each.classList.remove("not-editing");
                each.setAttribute("contenteditable", "true");
                // copy original data
                copyOriginal[each.parentNode.className] = each.innerHTML;
            }
        }
        // change the words displayed in the crud div of the target row
        changeRowEndDiv("clickUpdate", targetRowDOM, { "copy-original": copyOriginal });
    }
    window.addEventListener("keypress", noSpaceAndNewLine);
}

function deleteTradeRecord(e: Event): void {
    if (window.confirm("確定要刪除此筆交易紀錄嗎？\n刪除後將無法復原！")) {
        let targetRowDOM = findEditedRow(e);
        let data: any = { "mode": "delete" };
        if (targetRowDOM instanceof HTMLElement) {
            for (let each of targetRowDOM.childNodes) {
                if (each instanceof HTMLElement) {
                    if (each.className == "id") {
                        data[each.className] = each.innerText;
                    }
                }
            }
        }
        tradeRecordCRUD(data);
        location.reload();
    }
}

async function saveUpdate(e: Event): Promise<void> {
    let targetRowDOM = findEditedRow(e);
    let newData: any = { "mode": "update" };
    if (targetRowDOM instanceof HTMLElement) {
        let allInputSpans = targetRowDOM.querySelectorAll(".input");
        for (let each of allInputSpans) {
            // find each table td of the row being edited
            if (each.parentNode instanceof HTMLElement) {
                if (each.parentNode.className != "id" && each.parentNode.className != "company-name") {
                    each.classList.add("not-editing");
                    each.setAttribute("contenteditable", "false");
                }
                newData[each.parentNode.className] = each.innerHTML;
            }
        }
        await tradeRecordCRUD(newData);
        // change the words displayed in the crud div of the target row
        changeRowEndDiv("clickSave", targetRowDOM, { "copy-original": newData });
    }
    window.removeEventListener("keypress", noSpaceAndNewLine);
    location.reload();
}

function forgetUpdate(e: Event, args: any): void {
    let targetRowDOM = findEditedRow(e);
    if (targetRowDOM instanceof HTMLElement) {
        let allInputSpans = targetRowDOM.querySelectorAll(".input");
        for (let each of allInputSpans) {
            // find each table td of the row being edited
            if (each.parentNode instanceof HTMLElement && each.parentNode.className != "id" && each.parentNode.className != "company-name") {
                each.classList.add("not-editing");
                each.setAttribute("contenteditable", "false");
                // set original data back
                each.innerHTML = args["copy-original"][each.parentNode.className];
            }
        }
        // change the words displayed in the crud div of the target row
        changeRowEndDiv("clickCancel", targetRowDOM, {});
    }
    window.removeEventListener("keypress", noSpaceAndNewLine);
}

function findEditedRow(e: Event): HTMLElement | null {
    let temp = e.target;
    // find the row being edited
    while (temp instanceof HTMLElement && temp.parentNode != null && temp.className != "trade-record-table-row") {
        temp = temp.parentNode;
    }
    return temp instanceof HTMLElement ? temp : null;
}

function changeRowEndDiv(type: string, targetRowDOM: HTMLElement, args: any): void {
    let crud = targetRowDOM.querySelector(".crud");
    let btnConfigList = []
    if (type == "clickUpdate") {
        btnConfigList = [
            { "btnClassName": "save-change-btn", "btnDisplayName": "儲存", "cllbackFunc": saveUpdate, "args": {} },
            { "btnClassName": "forget-change-btn", "btnDisplayName": "取消", "cllbackFunc": forgetUpdate, "args": { "copy-original": args["copy-original"] } }
        ];
    } else {
        btnConfigList = [
            { "btnClassName": "update-btn", "btnDisplayName": "更改", "cllbackFunc": updateTradeRecord, "args": {} },
            { "btnClassName": "delete-btn", "btnDisplayName": "刪除", "cllbackFunc": deleteTradeRecord, "args": {} }
        ];
    }
    let newDiv = appendUpdateDeleteDiv(btnConfigList);
    if (crud instanceof HTMLElement) {
        crud.innerHTML = "";
        crud.appendChild(newDiv);
    }
    let rows = document.getElementsByClassName("trade-record-table-row");
    for (let each of rows) {
        if (each != targetRowDOM) {
            let crudOfOtherRow = each.querySelector(".crud");
            if (crudOfOtherRow instanceof HTMLElement) {
                crudOfOtherRow.style.display = type == "clickUpdate" ? "none" : "";
            }
        }
    }
}

function noSpaceAndNewLine(e: Event): void {
    if (e instanceof KeyboardEvent && (e.keyCode == 13 || e.keyCode == 32)) {
        e.preventDefault();
    }
}

function cashInvChartData(endDateStr: string, tradeRecordData: any[]): (string | number)[][] {
    let startDateStr = tradeRecordData[tradeRecordData.length - 1]["deal-time"].slice(0, 4) + "-" + tradeRecordData[tradeRecordData.length - 1]["deal-time"].slice(4, 6) + "-" + tradeRecordData[tradeRecordData.length - 1]["deal-time"].slice(6);
    let result: (string | number)[][] = [];
    let dates = getDatesArray(new Date(startDateStr), new Date(endDateStr));
    for (let eachDate of dates) {
        const eachDateStr = eachDate.split("-").join("");
        let dataRow: (string | number)[];

        // Create a new row whose values is the copy of the values of the previous(last) row.
        if (result[result.length - 1] != undefined) {
            dataRow = [eachDateStr, ...result[result.length - 1].slice(1, -1)];
        } else {
            dataRow = [eachDateStr, ...[...allHoldingSids].map(x => 0)];
        }

        for (let eachRecord of tradeRecordData) {
            let t = parseInt(eachRecord["deal-time"]);
            if (t == parseInt(eachDateStr)) {
                let s = eachRecord["sid"];
                let p = parseFloat(eachRecord["deal-price"]);
                let q = parseFloat(eachRecord["deal-quantity"]);
                let f = parseFloat(eachRecord["handling-fee"]);
                handlingFee += f;   // currently not used
                let idx = [...allHoldingSids].indexOf(s) + 1;
                if (q >= 0) {   // When buying
                    // The wierd way below is to comply TypeScript's rule. Actually, we can simply do:
                    // dataRow[idx] += p*q;
                    // if in JavaScript.
                    dataRow[idx] = parseFloat(`${dataRow[idx]}`) + (p * q);
                } else {    // When selling
                    while (q < 0) {
                        for (let eachT in stockWarehouse[s]) {
                            if (parseInt(eachT) < t) {
                                for (let eachP in stockWarehouse[s][eachT]) {
                                    let eachQ = stockWarehouse[s][eachT][eachP];
                                    let diff = q + eachQ;
                                    if (diff >= 0) {
                                        stockWarehouse[s][eachT][eachP] = eachQ + q;
                                        dataRow[idx] = parseFloat(`${dataRow[idx]}`) + (parseFloat(eachP) * q);
                                        cashExtracted += (p - parseFloat(eachP)) * (-1 * q);
                                        q = 0;
                                    } else {
                                        stockWarehouse[s][eachT][eachP] = 0;
                                        dataRow[idx] = parseFloat(`${dataRow[idx]}`) + (parseFloat(eachP) * eachQ);
                                        cashExtracted += (p - parseFloat(eachP)) * eachQ;
                                        q = diff;
                                    }
                                }
                            }
                        }
                    }
                    stockWarehouse[s][t][p] = 0;
                }
            }
        }
        const reducer = (previousValue: number, currentValue: number) => previousValue + currentValue;
        // The wierd way below is to comply TypeScript's rule. Actually, we can simply do:
        // [...dataRow].slice(1).reduce(reducer);
        // if in JavaScript.
        const total = [...dataRow].slice(1).reduce((i, j) => reducer(parseInt(`${i}`), parseInt(`${j}`)));
        dataRow.push(total);
        result.push(dataRow);
    }
    // result = [["Date", ...allHoldingSids, "Total"], ...result];
    result = [["Date", "Cash Invested"], ...result.map(i => [i[0], i[i.length - 1]])];  // only use the "total" field
    let latestCashInv = result[result.length - 1][1];
    if (typeof latestCashInv == "number") {
        cashInvested = latestCashInv;
    }
    return result;
}

function componentChartData(): (string | number)[][] {
    let result: (string | number)[][] = [["Sid", "Market Value"]];
    // Count Q for each Sid
    for (let eachStock in stockWarehouse) {
        let eachRow = [eachStock, 0];
        for (let eachDay in stockWarehouse[eachStock]) {
            for (let eachP in stockWarehouse[eachStock][eachDay]) {
                eachRow[1] += stockWarehouse[eachStock][eachDay][eachP]
            }
        }
        if (eachRow[1] != 0) {
            result.push(eachRow);
        } else {
            // update allHoldingSids
            allHoldingSids.delete(eachStock);
        }
    }

    // Q * market value
    for (let eachStock of stockInfoJson["data"]) {
        for (let eachResult of result) {
            if (eachStock["證券代號"] == eachResult[0]) {
                if (typeof eachResult[1] == "number") {
                    eachResult[1] *= parseFloat(eachStock["收盤價"].split(",").join(""));
                    securityMktVal += eachResult[1];
                }
            }
        }
    }

    // Merge small numbers into "others"
    let smallNum = result.filter(i => typeof i[1] == "number" && i[1] / securityMktVal < 0.05);
    result = result.filter(i => i[1] == "Market Value" || (typeof i[1] == "number" && i[1] / securityMktVal >= 0.05));
    let numForOthers = 0;
    if (smallNum.length > 1) {
        for (let each of smallNum) {
            if (typeof each[1] == "number") {
                numForOthers += each[1];
            }
        }
        result.push(["Others", numForOthers]);
    } else {
        result.push(...smallNum);
    }
    return result;
}

function getDatesArray(startDate: Date, endDate: Date) {
    let result = []
    for (let date = new Date(startDate); date <= endDate; date.setDate(date.getDate() + 1)) {
        result.push(new Date(date).toISOString().slice(0, 10));
    }
    return result;
};

function applyCashInvestedChart(startDate: string, dataIn: (string | number)[][]): void {
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
    google.charts.setOnLoadCallback(() => configAndDrawChart(dataIn, options, "LineChart", cashInvestedChart));
}

function applyComponentChart(dataIn: (string | number)[][]): void {
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
    google.charts.setOnLoadCallback(() => configAndDrawChart(dataIn, options, "PieChart", componentChart));
}

function applyCompareChart(cashInvested: number, securityMktVal: number, cashExtracted: number): void {
    google.charts.load('current', { 'packages': ['corechart', 'bar'] });
    let dataIn = [
        ["Assets", "Value", { role: "style" }],
        ["Cash Invested", cashInvested, "#0a5"],
        ["Security Mkt Val", securityMktVal, "#b00"],
        ["Cash Extracted", cashExtracted, "#00b"]
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
    google.charts.setOnLoadCallback(() => configAndDrawChart(dataIn, options, "ColumnChart", compareChart));
}

function configAndDrawChart(dataIn: any[][], options: any, chartType: string, targetDiv: HTMLElement | null): void {
    let data = google.visualization.arrayToDataTable(dataIn);
    let chart = new google.visualization[chartType](targetDiv);
    chart.draw(data, options);
}

function expandTradeRecordForm(e: Event): void {
    if (submitBtn != null && createRecordContainer != null) {
        submitBtn.addEventListener("click", createTradeRecord);
        createRecordContainer.removeEventListener("click", expandTradeRecordForm);
        createRecordContainer.addEventListener("click", foldTradeRecordForm);
        createRecordContainer.style.display = "flex";
    }
}

function foldTradeRecordForm(e: Event): void {
    if (submitBtn != null && createRecordContainer != null && e.target instanceof HTMLElement && e.target.id == createRecordContainer.id) {
        submitBtn.removeEventListener("click", createTradeRecord);
        createRecordContainer.removeEventListener("click", foldTradeRecordForm);
        createRecordContainer.addEventListener("click", expandTradeRecordForm);
        createRecordContainer.style.display = "none";
    }
}

function infoNotSufficientErr(): void {
    if (createErrorDiv != null) {
        createErrorDiv.style.display = "unset";
        setTimeout(() => {
            createErrorDiv.style.opacity = "100%";
            setTimeout(() => {
                createErrorDiv.style.opacity = "0%";
                setTimeout(() => {
                    createErrorDiv.style.display = "none";
                }, 300);
            }, 1000);
        });
    }
}

function initAllHoldingSid(): void {
    for (let each of tradeRecordJson["data"]) {
        allHoldingSids.add(each["sid"]);
    }
}


function fetchStockSingleDay(date: string = "", sidList: string[] = [], companyNameList: string[] = []): Promise<void> {
    const url: string | null = decideURL(date, sidList, companyNameList);
    if (stockInfoTableContainer != null) {
        stockInfoTableContainer.classList.add("waiting-data");
        stockInfoTableContainer.classList.remove("data-arrived");
    }
    return fetch(url)
        .then(function (response) {
            return response.json();
        });
}

function decideURL(date: string = "", sidList: string[] = [], companyNameList: string[] = []): string {
    if (date != "" && sidList.length != 0) {
        return `${endPoint}stockSingleDay?date=${date}&sid-list=${sidList.join(",")}`;
    } else if (date != "" && companyNameList.length != 0) {
        return `${endPoint}stockSingleDay?date=${date}&companyName-list=${companyNameList.join(",")}`;
    } else if (date == "" && sidList.length != 0) {
        return `${endPoint}stockSingleDay?sid-list=${sidList.join(",")}`;
    } else if (date == "" && companyNameList.length != 0) {
        return `${endPoint}stockSingleDay?companyName-list=${companyNameList.join(",")}`;
    } else {
        console.log("Please at least input sid-list or company name.");
        return "";
    }
}

function buildStockInfoTb(myData: any[]): void {
    if (stockInfoTableContainer != null && stockInfoTableBody != null) {
        stockInfoTableContainer.classList.remove("waiting-data");
        stockInfoTableContainer.classList.add("data-arrived");
        for (let eachStock of myData) {
            if (allHoldingSids.has(eachStock["證券代號"])) {
                let tr = document.createElement("tr");
                tr.className = "stock-info-table-row";
                let temp: HTMLElement | undefined;
                for (let eachField in eachStock) {
                    if (eachField) {
                        if (eachField.indexOf("最後") == -1) {
                            if (eachField.indexOf("價差") == -1) {
                                let td = document.createElement("td");
                                td.className = eachField;
                                td.innerHTML = eachStock[eachField];
                                tr.appendChild(td);
                                if (eachField.indexOf("(+/-)") != -1) {
                                    temp = td;
                                }
                            } else if (temp instanceof HTMLElement) {
                                temp.innerHTML += eachStock[eachField];
                            }
                        }
                    }
                }
                stockInfoTableBody.appendChild(tr);
            }
        }
    }
}

function controlToggler(): void {
    if (togglerMask != null && viewToggler != null) {
        togglerMask.style.left = "-1%";
        viewToggler.addEventListener("click", moveTogglerMask);
    }
}

function moveTogglerMask(e: Event): void {
    if (togglerMask instanceof HTMLElement) {
        togglerMask.style.left = (-1 * parseFloat(togglerMask.style.left) + 50) + "%";
    }
}

function controlTab(): void {
    for (let each of allTabs) {
        if (each instanceof HTMLElement) {
            each.addEventListener("click", highlightTab);
        }
    }
}

function highlightTab(e: Event): void {
    for (let i = 0; i < allTabs.length; i++) {
        if (allTabs[i] == e.currentTarget && allTableContainers[i] instanceof HTMLElement) {
            allTabs[i].classList.add("active");
            allTableContainers[i].classList.add("active");
            allTableContainers[i].classList.remove("close");
        } else {
            allTabs[i].classList.remove("active");
            allTableContainers[i].classList.add("close");
            allTableContainers[i].classList.remove("active");
        }
    }
}

function getDateStr(endDate: Date, interval: string): string {
    if (interval == "aMonth") {
        let m = endDate.getMonth();
        endDate.setMonth(endDate.getMonth() - 1);
        // If still in same month, set date to last day of previous month.
        if (endDate.getMonth() == m) endDate.setDate(0);
        endDate.setHours(0, 0, 0, 0);
    }
    let result = endDate.toISOString().slice(0, 10);
    return result;
}

async function main(): Promise<void> {
    if (createRecordBtn != null) {
        createRecordBtn.addEventListener("click", expandTradeRecordForm);
    }
    controlToggler();
    controlTab();
    // The cash-invested chart need info in trade-record table, so this need to be await
    tradeRecordJson = await tradeRecordCRUD({ "mode": "read" });
    initAllHoldingSid();
    buildStockWarehouse(tradeRecordJson["data"]);

    let todayStr = getDateStr(new Date(), "noInterval");
    let cashInvestedData = cashInvChartData(todayStr, tradeRecordJson["data"]);
    let startDateStr = getDateStr(new Date(), "aMonth");
    applyCashInvestedChart(startDateStr, cashInvestedData);

    // The component chart need info in stock-info table, so this need to be await
    stockInfoJson = await fetchStockSingleDay("", [...allHoldingSids]);
    let componentData = componentChartData();
    applyComponentChart(componentData);

    applyCompareChart(cashInvested, securityMktVal, cashExtracted);

    buildRecordTable(tradeRecordJson["data"]);
    buildStockInfoTb(stockInfoJson["data"]);
}

main();