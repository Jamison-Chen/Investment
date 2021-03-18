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
const createRecordBtn = document.getElementById("create-trade-record-btn");
const createRecordContainer = document.getElementById("create-trade-record-form-container");
const createRecordForm = document.getElementById("create-record-form");
const allRecordFormInputs = document.getElementsByClassName("record-form-input");
const submitBtn = document.getElementById("submit-btn");
const createErrorDiv = document.getElementById("create-error");
const allTabs = document.getElementsByClassName("tab");
const tradeRecordTab = document.getElementById("trade-record-tab");
const stockInfoTab = document.getElementById("stock-info-tab");
const tradeRecordTableContainer = document.getElementById("trade-record-table-container");
const tradeRecordTableBody = document.querySelector("#trade-record-table tbody");
let allHoldingSids = new Set();
const stockInfoTableContainer = document.getElementById("stock-info-table-container");
const stockInfoTableBody = document.querySelector("#stock-info-table tbody");
const fundInvestedChart = document.getElementById('fund-invested-chart');
const todayStr = new Date().toISOString().slice(0, 10);
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
//         tradeRecordCRUD();
//     }
// });
function tradeRecordCRUD(inData) {
    let outData = new URLSearchParams();
    for (let each in inData) {
        outData.append(each, inData[each]);
    }
    fetch(`${endPoint}records`, { method: 'post', body: outData });
    return false;
}
function queryTradeRecordOnLoad() {
    let data = new URLSearchParams();
    data.append("mode", "read");
    let url = `${endPoint}records`;
    return fetch(url, { method: 'post', body: data })
        .then(function (response) {
        return response.json();
    });
}
function constructTradeRecordTable(myJson) {
    if (tradeRecordTableBody != null) {
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
            tradeRecordTableBody.appendChild(tr);
        }
    }
}
function createTradeRecord(e) {
    let data = { "mode": "create" };
    let hasEmpty = false;
    for (let each of allRecordFormInputs) {
        if (each instanceof HTMLInputElement && each.value != null && each.value != undefined) {
            if (each.value != "") {
                data[each.name] = each.value;
                console.log(each.value.length);
            }
            else {
                hasEmpty = true;
            }
        }
    }
    if (!hasEmpty) {
        tradeRecordCRUD(data);
        location.reload();
    }
    else {
        infoNotSufficientError();
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
        tradeRecordCRUD(data);
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
        tradeRecordCRUD(newData);
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
function preventSpaceAndNewLine(e) {
    if (e instanceof KeyboardEvent && (e.keyCode == 13 || e.keyCode == 32)) {
        e.preventDefault();
    }
}
function arrangeAssetsData(startDateStr, endDateStr) {
    let result = [];
    if (tradeRecordTableBody != null) {
        let dates = getDatesArray(new Date(startDateStr), new Date(endDateStr));
        const allTradeHistoryRows = tradeRecordTableBody.getElementsByClassName("trade-record-table-row");
        for (let eachDate of dates) {
            const eachDateStr = eachDate.split("-").join("");
            let dataRow;
            if (result[result.length - 1] != undefined) {
                dataRow = [eachDateStr, ...result[result.length - 1].slice(1, -1)];
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
            const reducer = (previousValue, currentValue) => previousValue + currentValue;
            // The wierd way below is to comply TypeScript's rule. Actually, we can simply do:
            // [...dataRow].slice(1).reduce(reducer);
            // if in JavaScript.
            const total = [...dataRow].slice(1).reduce((i, j) => reducer(parseInt(`${i}`), parseInt(`${j}`)));
            dataRow.push(total);
            result.push(dataRow);
        }
        result = [["Date", ...allHoldingSids, "Total"], ...result];
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
            title: "累計投入資金",
            subtitle: '近一個月'
        },
        width: window.innerWidth / 2.7,
        height: window.innerHeight / 2
    };
    let chart = new google.charts.Line(fundInvestedChart);
    chart.draw(data, google.charts.Line.convertOptions(options));
}
function expandTradeRecordForm(e) {
    if (submitBtn != null && createRecordContainer != null) {
        submitBtn.addEventListener("click", createTradeRecord);
        createRecordContainer.removeEventListener("click", expandTradeRecordForm);
        createRecordContainer.addEventListener("click", foldTradeRecordForm);
        createRecordContainer.style.display = "flex";
    }
}
function foldTradeRecordForm(e) {
    if (submitBtn != null && createRecordContainer != null && e.target instanceof HTMLElement && e.target.id == createRecordContainer.id) {
        submitBtn.removeEventListener("click", createTradeRecord);
        createRecordContainer.removeEventListener("click", foldTradeRecordForm);
        createRecordContainer.addEventListener("click", expandTradeRecordForm);
        createRecordContainer.style.display = "none";
    }
}
function infoNotSufficientError() {
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
function collectDailyInfo() {
    let sidDivs = document.querySelectorAll(".sid>.input");
    for (let each of sidDivs) {
        allHoldingSids.add(each.innerHTML);
    }
    fetchStockSingleDay("", [...allHoldingSids]);
}
function fetchStockSingleDay(date = "", sidList = [], companyNameList = []) {
    const url = decideURL(date, sidList, companyNameList);
    if (url != null && stockInfoTableContainer != null) {
        stockInfoTableContainer.classList.add("waiting-data");
        stockInfoTableContainer.classList.remove("data-arrived");
        fetch(url)
            .then(function (response) {
            return response.json();
        })
            .then(function (myJson) {
            constructStockInfoTable(myJson);
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
function constructStockInfoTable(myJson) {
    if (stockInfoTableContainer != null && stockInfoTableBody != null) {
        stockInfoTableContainer.classList.remove("waiting-data");
        stockInfoTableContainer.classList.add("data-arrived");
        for (let eachStock in myJson["data"]) {
            let tr = document.createElement("tr");
            tr.className = "stock-info-table-row";
            let temp;
            for (let eachField in myJson["data"][eachStock]) {
                if (eachField) {
                    if (eachField.indexOf("最後") == -1) {
                        if (eachField.indexOf("價差") == -1) {
                            let td = document.createElement("td");
                            td.className = eachField;
                            td.innerHTML = myJson["data"][eachStock][eachField];
                            tr.appendChild(td);
                            if (eachField.indexOf("(+/-)") != -1) {
                                temp = td;
                            }
                        }
                        else if (temp instanceof HTMLElement) {
                            temp.innerHTML += myJson["data"][eachStock][eachField];
                        }
                    }
                }
            }
            stockInfoTableBody.appendChild(tr);
        }
    }
}
function controlLowerPageTabs() {
    for (let each of allTabs) {
        if (each instanceof HTMLElement) {
            each.addEventListener("click", highlightTab);
        }
    }
}
function highlightTab(e) {
    if (e.target instanceof HTMLElement && tradeRecordTableContainer instanceof HTMLElement && stockInfoTableContainer instanceof HTMLElement) {
        if (e.target.innerText == "交易紀錄") {
            tradeRecordTab === null || tradeRecordTab === void 0 ? void 0 : tradeRecordTab.classList.add("active");
            stockInfoTab === null || stockInfoTab === void 0 ? void 0 : stockInfoTab.classList.remove("active");
            tradeRecordTableContainer.classList.remove("close");
            stockInfoTableContainer.classList.remove("active");
        }
        else {
            stockInfoTab === null || stockInfoTab === void 0 ? void 0 : stockInfoTab.classList.add("active");
            tradeRecordTab === null || tradeRecordTab === void 0 ? void 0 : tradeRecordTab.classList.remove("active");
            tradeRecordTableContainer.classList.add("close");
            stockInfoTableContainer.classList.add("active");
        }
    }
    // for (let each of allTabs) {
    //     if (each instanceof HTMLElement && e.target instanceof HTMLElement) {
    //         if (each.innerText != e.target.innerText) {
    //             each.classList.remove("active");
    //         } else {
    //             each.classList.add("active");
    //         }
    //     }
    // }
}
function main() {
    return __awaiter(this, void 0, void 0, function* () {
        if (createRecordBtn != null) {
            createRecordBtn.addEventListener("click", expandTradeRecordForm);
        }
        const jsonResponsed = yield queryTradeRecordOnLoad();
        constructTradeRecordTable(jsonResponsed);
        collectDailyInfo();
        let assetsData = arrangeAssetsData("2021-02-18", todayStr);
        applyGoogleChart(assetsData);
        controlLowerPageTabs();
    });
}
main();
