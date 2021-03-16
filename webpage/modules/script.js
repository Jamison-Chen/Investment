"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
const body = document.getElementById("body");
// const inputDate = document.getElementById("date");
// const inputSid = document.getElementById("sid");
// const inputCompanyName = document.getElementById("companyName");
// const queryBtn = document.getElementById("query-btn");
const recordForm = document.getElementById("record-form");
const allRecordFormInputs = document.getElementsByClassName("record-form-input");
const submitBtn = document.getElementById("submit-btn");
const tradeRecordTable = document.getElementById("trade-record-table");
let allHoldingSids = new Set();
const infoToday = document.getElementById("info-today");
const comprehensiveAssetsChart = document.getElementById('comprehensive-assets-chart');
// localhost api test
const endPoint = "http://127.0.0.1:5000/";
// remote api test
// const endPoint = "https://stock-info-scraper.herokuapp.com/";
// if (queryBtn != null) {
//     queryBtn.addEventListener("click", (e) => {
//         if (inputDate instanceof HTMLInputElement && inputSid instanceof HTMLInputElement && inputCompanyName instanceof HTMLInputElement) {
//             // fetchSingleStockSingleDay();
//         }
//     });
// }
// window.addEventListener("keydown", (e) => {
//     if ((e instanceof KeyboardEvent && e.keyCode == 13)) {
//         recordsCRUD();
//     }
// });
function fetchStockSingleDay(date = "", sidList = [], companyNameList = []) {
    const url = decideURL(date, sidList, companyNameList);
    if (url != null && infoToday != null) {
        infoToday.innerHTML = "Waiting...";
        fetch(url)
            .then(function (response) {
            return response.json();
        })
            .then(function (myJson) {
            printInfo(myJson);
        });
    }
}
function decideURL(date = "", sidList = [], companyNameList = []) {
    if (date != "" && sidList.length != 0) {
        return `${endPoint}stockSingleDay?date=${date}&sid-list=${sidList.join(",")}`;
    }
    else if (date != "" && companyNameList.length != 0) {
        return `${endPoint}stockSingleDay?date=${date}&companyName-list=${companyNameList.join(",")}`;
    }
    else if (date == "" && sidList.length != 0) {
        return `${endPoint}stockSingleDay?sid-list=${sidList.join(",")}`;
    }
    else if (date == "" && companyNameList.length != 0) {
        return `${endPoint}stockSingleDay?companyName-list=${companyNameList.join(",")}`;
    }
    else {
        console.log("Please at least input sid-list or company name.");
        return null;
    }
}
function printInfo(myJson) {
    if (infoToday != null) {
        infoToday.innerHTML = "";
        for (let eachStock in myJson["data"]) {
            let d1 = document.createElement("div");
            for (let eachField in myJson["data"][eachStock]) {
                let d2 = document.createElement("div");
                d2.innerHTML = `${eachField}: ${myJson["data"][eachStock][eachField]}`;
                d1.appendChild(d2);
            }
            infoToday.appendChild(d1);
        }
    }
}
function recordsCRUD(inData) {
    let outData = new URLSearchParams();
    for (let each in inData) {
        outData.append(each, inData[each]);
    }
    fetch(`${endPoint}records`, { method: 'post', body: outData });
    return false;
}
function queryTradeHistoryOnLoad() {
    let data = new URLSearchParams();
    data.append("mode", "read");
    let url = `${endPoint}records`;
    return fetch(url, { method: 'post', body: data })
        .then(function (response) {
        return response.json();
    });
}
function createTradeRecordTable(myJson) {
    if (tradeRecordTable != null) {
        for (let each in myJson["data"]) {
            let tr = document.createElement("tr");
            tr.className = "trade-record-table-row";
            for (let eachField in myJson["data"][each]) {
                let td = document.createElement("td");
                td.className = eachField.split(" ").join("-").toLowerCase();
                const innerInput = document.createElement("span");
                innerInput.className = "input not-editing";
                innerInput.setAttribute("role", "textbox");
                innerInput.setAttribute("type", "number");
                innerInput.innerHTML = myJson["data"][each][eachField];
                td.appendChild(innerInput);
                tr.appendChild(td);
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
            tradeRecordTable.appendChild(tr);
        }
    }
}
function appendUpdateDeleteDiv(btnConfigList) {
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
function collectDailyInfo() {
    let sidDivs = document.querySelectorAll(".sid>.input");
    for (let each of sidDivs) {
        allHoldingSids.add(each.innerHTML);
    }
    fetchStockSingleDay("", [...allHoldingSids]);
}
function updateTradeRecord(e) {
    let targetRowDOM = findEditedRow(e);
    let copyOriginal = {};
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
    window.addEventListener("keypress", preventSpaceAndNewLine);
}
function deleteTradeRecord(e) {
    if (window.confirm("確定要刪除此筆交易紀錄嗎？\n刪除後將無法復原！")) {
        let targetRowDOM = findEditedRow(e);
        let data = { "mode": "delete" };
        if (targetRowDOM instanceof HTMLElement) {
            for (let each of targetRowDOM.childNodes) {
                if (each instanceof HTMLElement) {
                    if (each.className == "id") {
                        data[each.className] = each.innerText;
                    }
                }
            }
        }
        recordsCRUD(data);
        location.reload();
    }
}
function saveUpdate(e) {
    let targetRowDOM = findEditedRow(e);
    let newData = { "mode": "update" };
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
        recordsCRUD(newData);
        // change the words displayed in the crud div of the target row
        changeRowEndDiv("clickSave", targetRowDOM, { "copy-original": newData });
        location.reload();
    }
    window.removeEventListener("keypress", preventSpaceAndNewLine);
}
function forgetUpdate(e, args) {
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
    window.removeEventListener("keypress", preventSpaceAndNewLine);
}
function findEditedRow(e) {
    let temp = e.target;
    // find the row being edited
    while (temp instanceof HTMLElement && temp.parentNode != null && temp.className != "trade-record-table-row") {
        temp = temp.parentNode;
    }
    return temp instanceof HTMLElement ? temp : null;
}
function changeRowEndDiv(type, targetRowDOM, args) {
    let crud = targetRowDOM.querySelector(".crud");
    let btnConfigList = [];
    if (type == "clickUpdate") {
        btnConfigList = [
            { "btnClassName": "save-change-btn", "btnDisplayName": "儲存", "cllbackFunc": saveUpdate, "args": {} },
            { "btnClassName": "forget-change-btn", "btnDisplayName": "取消", "cllbackFunc": forgetUpdate, "args": { "copy-original": args["copy-original"] } }
        ];
    }
    else {
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
function main() {
    return __awaiter(this, void 0, void 0, function* () {
        recordForm === null || recordForm === void 0 ? void 0 : recordForm.addEventListener("submit", doSubmit);
        const jsonResponsed = yield queryTradeHistoryOnLoad();
        createTradeRecordTable(jsonResponsed);
        collectDailyInfo();
        let assetsData = arrangeAssetsData("2021-03-01", "2021-03-16");
        applyGoogleChart(assetsData);
    });
}
function doSubmit() {
    let data = {};
    for (let each of allRecordFormInputs) {
        if (each instanceof HTMLInputElement && each.value != null && each.value != undefined) {
            data[each.name] = each.value;
        }
    }
    recordsCRUD(data);
}
function preventSpaceAndNewLine(e) {
    if (e instanceof KeyboardEvent && (e.keyCode == 13 || e.keyCode == 32)) {
        e.preventDefault();
    }
}
main();
function arrangeAssetsData(startDateStr, endDateStr) {
    let result = [];
    if (tradeRecordTable != null) {
        let dates = getDatesArray(new Date(startDateStr), new Date(endDateStr));
        const allTradeHistoryRows = tradeRecordTable.getElementsByClassName("trade-record-table-row");
        for (let eachDate of dates) {
            const eachDateStr = eachDate.split("-").join("");
            let dataRow;
            if (result[result.length - 1] != undefined) {
                dataRow = [eachDateStr, ...result[result.length - 1].slice(1)];
            }
            else {
                dataRow = [eachDateStr, ...[...allHoldingSids].map(x => 0)];
            }
            for (let eachRow of allTradeHistoryRows) {
                const eachDealTime = eachRow.querySelector(".deal-time");
                const eachSid = eachRow.querySelector(".sid");
                const eachDealPrice = eachRow.querySelector(".deal-price");
                const eachDealQuantity = eachRow.querySelector(".deal-quantity");
                if (eachRow instanceof HTMLElement && eachDealTime instanceof HTMLElement && eachSid instanceof HTMLElement && eachDealPrice instanceof HTMLElement && eachDealQuantity instanceof HTMLElement) {
                    if (parseInt(eachDealTime.innerText) == parseInt(eachDateStr)) {
                        let idx = [...allHoldingSids].indexOf(eachSid.innerText) + 1;
                        // The wierd way below is to comply TypeScript's rule. Actually, we can simply do:
                        // dataRow[idx] += (parseFloat(eachDealPrice.innerText) * parseFloat(eachDealQuantity.innerText))
                        // if in JavaScript.
                        dataRow[idx] = parseInt(`${dataRow[idx]}`) + (parseFloat(eachDealPrice.innerText) * parseFloat(eachDealQuantity.innerText));
                    }
                }
            }
            result.push(dataRow);
        }
        result = [["Date", ...allHoldingSids], ...result];
    }
    return result;
}
function getDatesArray(startDate, endDate) {
    let result = [];
    for (let date = new Date(startDate); date <= endDate; date.setDate(date.getDate() + 1)) {
        result.push(new Date(date).toISOString().slice(0, 10));
    }
    return result;
}
;
function applyGoogleChart(dataIn) {
    google.charts.load('current', { 'packages': ['line'] });
    google.charts.setOnLoadCallback(() => drawChart(dataIn));
}
function drawChart(dataIn) {
    let data = new google.visualization.arrayToDataTable(dataIn);
    let options = {
        chart: {
            title: 'Box Office Earnings in First Two Weeks of Opening',
            subtitle: 'in millions of dollars (USD)'
        },
        width: 500,
        height: 300
    };
    let chart = new google.charts.Line(comprehensiveAssetsChart);
    chart.draw(data, google.charts.Line.convertOptions(options));
}
