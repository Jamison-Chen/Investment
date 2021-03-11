"use strict";
const body = document.getElementById("body");
// const inputDate = document.getElementById("date");
// const inputSid = document.getElementById("sid");
// const inputCompanyName = document.getElementById("companyName");
// const queryBtn = document.getElementById("query-btn");
const recordForm = document.getElementById("record-form");
const allRecordFormInputs = document.getElementsByClassName("record-form-input");
const submitBtn = document.getElementById("submit-btn");
const tradeRecordTable = document.getElementById("trade-record-table");
let allHoldingSids = [];
const infoToday = document.getElementById("info-today");
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
        return `${endPoint}stockSingleDay?date=${date}&sidList=${sidList.join(",")}`;
    }
    else if (date != "" && companyNameList.length != 0) {
        return `${endPoint}stockSingleDay?date=${date}&companyNameList=${companyNameList.join(",")}`;
    }
    else if (date == "" && sidList.length != 0) {
        return `${endPoint}stockSingleDay?sidList=${sidList.join(",")}`;
    }
    else if (date == "" && companyNameList.length != 0) {
        return `${endPoint}stockSingleDay?companyNameList=${companyNameList.join(",")}`;
    }
    else {
        console.log("Please at least input sidList or company name.");
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
function recordsCRUD() {
    let data = new URLSearchParams();
    for (let each of allRecordFormInputs) {
        if (each instanceof HTMLInputElement) {
            data.append(each.name, each.value);
        }
    }
    fetch("http://127.0.0.1:5000/records", { method: 'post', body: data });
    return false;
}
function queryTradeHistoryOnLoad() {
    let data = new URLSearchParams();
    data.append("mode", "read");
    let url = `${endPoint}records`;
    fetch(url, { method: 'post', body: data })
        .then(function (response) {
        return response.json();
    })
        .then(function (myJson) {
        createTradeRecordTable(myJson);
        collectDailyInfo();
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
                innerInput.innerHTML = myJson["data"][each][eachField];
                // innerInput.setAttribute("contenteditable", "true");
                td.appendChild(innerInput);
                tr.appendChild(td);
            }
            const status = document.createElement("td");
            status.className = "crud";
            const innerDiv = document.createElement("div");
            const updateBtn = document.createElement("div");
            updateBtn.className = "update-btn";
            updateBtn.innerHTML = "更改";
            // updateBtn.addEventListener("click", ...);
            const divideLine = document.createElement("div");
            divideLine.className = "divide-line";
            divideLine.innerHTML = " / ";
            const deleteBtn = document.createElement("div");
            deleteBtn.className = "delete-btn";
            deleteBtn.innerHTML = "刪除";
            // deleteBtn.addEventListener("click", ...);
            innerDiv.appendChild(updateBtn);
            innerDiv.appendChild(divideLine);
            innerDiv.appendChild(deleteBtn);
            status.appendChild(innerDiv);
            tr.appendChild(status);
            tradeRecordTable.appendChild(tr);
        }
    }
}
function collectDailyInfo() {
    let sidDivs = document.querySelectorAll(".sid>.input");
    for (let each of sidDivs) {
        allHoldingSids.push(each.innerHTML);
    }
    fetchStockSingleDay("", allHoldingSids);
}
function main() {
    recordForm === null || recordForm === void 0 ? void 0 : recordForm.addEventListener("submit", recordsCRUD);
    queryTradeHistoryOnLoad();
}
main();
