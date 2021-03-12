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
                td.appendChild(innerInput);
                tr.appendChild(td);
            }
            const crud = document.createElement("td");
            crud.className = "crud";
            const btnConfigList = [
                { "btnClassName": "update-btn", "btnDisplayName": "更改", "cllbackFunc": updateTradeRecord },
                { "btnClassName": "delete-btn", "btnDisplayName": "刪除", "cllbackFunc": deleteTradeRecord }
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
    btn1.addEventListener("click", (e) => btnConfigList[0]["cllbackFunc"](e));
    const divideLine = document.createElement("div");
    divideLine.className = "divide-line";
    divideLine.innerHTML = " / ";
    const btn2 = document.createElement("div");
    btn2.className = btnConfigList[1]["btnClassName"];
    btn2.innerHTML = btnConfigList[1]["btnDisplayName"];
    btn2.addEventListener("click", (e) => btnConfigList[1]["cllbackFunc"](e));
    innerDiv.appendChild(btn1);
    innerDiv.appendChild(divideLine);
    innerDiv.appendChild(btn2);
    return innerDiv;
}
function collectDailyInfo() {
    let sidDivs = document.querySelectorAll(".sid>.input");
    for (let each of sidDivs) {
        allHoldingSids.push(each.innerHTML);
    }
    fetchStockSingleDay("", allHoldingSids);
}
function updateTradeRecord(e) {
    let temp = e.target;
    while (temp instanceof HTMLElement && temp.parentNode != null && temp.className != "trade-record-table-row") {
        temp = temp.parentNode;
    }
    if (temp instanceof HTMLElement) {
        let allInputSpans = temp.querySelectorAll(".input.not-editing");
        for (let each of allInputSpans) {
            if (each.parentNode instanceof HTMLElement && each.parentNode.className != "id") {
                each.classList.remove("not-editing");
                each.setAttribute("contenteditable", "true");
            }
        }
        // change the words displayed in the crud div of the target row
        let crud = temp.querySelector(".crud");
        const btnConfigList = [
            { "btnClassName": "save-change-btn", "btnDisplayName": "儲存", "cllbackFunc": saveUpdate },
            { "btnClassName": "forget-change-btn", "btnDisplayName": "取消", "cllbackFunc": forgetUpdate }
        ];
        let saveForgetDiv = appendUpdateDeleteDiv(btnConfigList);
        if (crud instanceof HTMLElement) {
            crud.innerHTML = "";
            crud.appendChild(saveForgetDiv);
        }
        // temporarily remove the crud divs of all the other rows
        let rows = document.getElementsByClassName("trade-record-table-row");
        for (let each of rows) {
            if (each != temp) {
                let crudOfOtherRow = each.querySelector(".crud");
                if (crudOfOtherRow instanceof HTMLElement) {
                    crudOfOtherRow.style.display = "none";
                }
            }
        }
    }
}
function deleteTradeRecord(e) {
    if (window.confirm("確定要刪除此筆交易紀錄嗎？\n刪除後將無法復原！")) {
        let temp = e.target;
        while (temp instanceof HTMLElement && temp.parentNode != null && temp.className != "trade-record-table-row") {
            temp = temp.parentNode;
        }
        let data = { "mode": "delete" };
        if (temp instanceof HTMLElement) {
            for (let each of temp.childNodes) {
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
// TODO
function saveUpdate(e) {
}
// TODO
function forgetUpdate(e) {
}
function main() {
    recordForm === null || recordForm === void 0 ? void 0 : recordForm.addEventListener("submit", doSubmit);
    queryTradeHistoryOnLoad();
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
main();
