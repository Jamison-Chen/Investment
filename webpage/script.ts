const body = document.getElementById("body");
// const inputDate = document.getElementById("date");
// const inputSid = document.getElementById("sid");
// const inputCompanyName = document.getElementById("companyName");
// const queryBtn = document.getElementById("query-btn");
const recordForm = document.getElementById("record-form");
const allRecordFormInputs = document.getElementsByClassName("record-form-input")
const submitBtn = document.getElementById("submit-btn");
const tradeRecordTable = document.getElementById("trade-record-table");
let allHoldingSids: string[] = [];
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

function fetchStockSingleDay(date: string = "", sidList: string[] = [], companyNameList: string[] = []): void {
    let url: string | null = null;
    if (date != "" && sidList.length != 0) {
        url = `${endPoint}stockSingleDay?date=${date}&sidList=${sidList.join(",")}`;
    } else if (date != "" && companyNameList.length != 0) {
        url = `${endPoint}stockSingleDay?date=${date}&companyNameList=${companyNameList.join(",")}`;
    } else if (date == "" && sidList.length != 0) {
        url = `${endPoint}stockSingleDay?sidList=${sidList.join(",")}`;
    } else if (date == "" && companyNameList.length != 0) {
        url = `${endPoint}stockSingleDay?companyNameList=${companyNameList.join(",")}`;
    } else {
        console.log("Please at least input sidList or company name.");
    }
    if (url != null) {
        if (infoToday != null) {
            infoToday.innerHTML = "Waiting...";
        }
        fetch(url)
            .then(function (response) {
                return response.json();
            })
            .then(function (myJson) {
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
            });
    }
}

function recordsCRUD(): boolean {
    let data = new URLSearchParams();
    for (let each of allRecordFormInputs) {
        if (each instanceof HTMLInputElement) {
            data.append(each.name, each.value);
        }
    }
    fetch("http://127.0.0.1:5000/records", { method: 'post', body: data });
    return false;
}

function queryTradeHistoryOnLoad(): void {
    let data = new URLSearchParams();
    data.append("mode", "read");
    let url = `${endPoint}records`;
    fetch(url, { method: 'post', body: data })
        .then(function (response) {
            return response.json();
        })
        .then(function (myJson) {
            if (tradeRecordTable != null) {
                // create table
                for (let each in myJson["data"]) {
                    let tr = document.createElement("tr");
                    tr.className = "trade-record-table-row";
                    for (let eachField in myJson["data"][each]) {
                        let td = document.createElement("td");
                        td.className = eachField.split(" ").join("-");
                        td.innerHTML = myJson["data"][each][eachField]
                        tr.appendChild(td)
                    }
                    tradeRecordTable.appendChild(tr);
                }
                // collect all sid holding
                let sidDivs = document.getElementsByClassName("Sid");
                for (let each of sidDivs) {
                    allHoldingSids.push(each.innerHTML);
                }
                fetchStockSingleDay("", allHoldingSids);
            }
        });
}

function main(): void {
    recordForm?.addEventListener("submit", recordsCRUD);
    queryTradeHistoryOnLoad();
}


main()