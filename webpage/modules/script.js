"use strict";
const body = document.getElementById("body");
const inputDate = document.getElementById("date");
const inputSid = document.getElementById("sid");
const inputCompanyName = document.getElementById("companyName");
const queryBtn = document.getElementById("query-btn");
const recordForm = document.getElementById("record-form");
const allRecordFormInputs = document.getElementsByClassName("record-form-input");
const submitBtn = document.getElementById("submit-btn");
const tradeRecordTable = document.getElementById("trade-record-table");
let url;
queryBtn === null || queryBtn === void 0 ? void 0 : queryBtn.addEventListener("click", fetchContent);
recordForm === null || recordForm === void 0 ? void 0 : recordForm.addEventListener("submit", recordsCRUD);
window.addEventListener("keydown", (e) => {
    if ((e instanceof KeyboardEvent && e.keyCode == 13)) {
        recordsCRUD();
    }
});
function fetchContent(e) {
    if (inputDate instanceof HTMLInputElement && inputSid instanceof HTMLInputElement && inputCompanyName instanceof HTMLInputElement) {
        if (inputDate.value != "" && inputSid.value != "") {
            // localhost api test
            url = `http://127.0.0.1:5000/singleStockSingleDay?date=${inputDate.value}&sid=${inputSid.value}`;
            // remote api test
            // url = `https://stock-info-scraper.herokuapp.com/singleStockSingleDay?date=${inputDate.value}&sid=${inputSid.value}`;
        }
        else if (inputDate.value != "" && inputCompanyName.value != "") {
            // localhost api test
            url = `http://127.0.0.1:5000/singleStockSingleDay?date=${inputDate.value}&name=${inputCompanyName.value}`;
            // remote api test
            // url = `https://stock-info-scraper.herokuapp.com/singleStockSingleDay?date=${inputDate.value}&name=${inputCompanyName.value}`;
        }
        else if (inputDate.value == "" && inputSid.value != "") {
            // localhost api test
            url = `http://127.0.0.1:5000/singleStockSingleDay?sid=${inputSid.value}`;
            // remote api test
            // url = `https://stock-info-scraper.herokuapp.com/singleStockSingleDay?sid=${inputSid.value}`;
        }
        else if (inputDate.value == "" && inputCompanyName.value != "") {
            // localhost api test
            url = `http://127.0.0.1:5000/singleStockSingleDay?name=${inputCompanyName.value}`;
            // remote api test
            // url = `https://stock-info-scraper.herokuapp.com/singleStockSingleDay?name=${inputCompanyName.value}`;
        }
        else {
            console.log("Info insufficient.");
        }
    }
    if (url != null) {
        if (body != null) {
            body.innerHTML = "Waiting...";
        }
        fetch(url)
            .then(function (response) {
            return response.json();
        })
            .then(function (myJson) {
            if (body != null) {
                body.innerHTML = "";
                for (let each in myJson) {
                    let d = document.createElement("div");
                    d.innerHTML = `${each}: ${myJson[each]}`;
                    body.appendChild(d);
                }
            }
        });
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
    fetch("http://127.0.0.1:5000/records", { method: 'post', body: data })
        .then(function (response) {
        return response.json();
    })
        .then(function (myJson) {
        if (tradeRecordTable != null) {
            // console.log(myJson["data"]);
            for (let each in myJson["data"]) {
                let tr = document.createElement("tr");
                tr.className = "trade-record-table-row";
                for (let eachField in myJson["data"][each]) {
                    let td = document.createElement("td");
                    td.innerHTML = myJson["data"][each][eachField];
                    tr.appendChild(td);
                }
                tradeRecordTable.appendChild(tr);
            }
        }
    });
}
queryTradeHistoryOnLoad();
