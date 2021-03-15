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
    const url: string | null = decideURL(date, sidList, companyNameList);
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

function decideURL(date: string = "", sidList: string[] = [], companyNameList: string[] = []): string | null {
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
        return null;
    }
}

function printInfo(myJson: any): void {
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

function recordsCRUD(inData: any): boolean {
    let outData = new URLSearchParams();
    for (let each in inData) {
        outData.append(each, inData[each]);
    }
    fetch(`${endPoint}records`, { method: 'post', body: outData });
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
            createTradeRecordTable(myJson);
            collectDailyInfo();
        });
}

function createTradeRecordTable(myJson: any): void {
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
            tradeRecordTable.appendChild(tr);
        }
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

function collectDailyInfo(): void {
    let sidDivs = document.querySelectorAll(".sid>.input");
    for (let each of sidDivs) {
        allHoldingSids.push(each.innerHTML);
    }
    fetchStockSingleDay("", allHoldingSids);
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
    window.addEventListener("keypress", preventSpaceAndNewLine);
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
        recordsCRUD(data);
        location.reload();
    }
}

function saveUpdate(e: Event): void {
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
        recordsCRUD(newData);
        // change the words displayed in the crud div of the target row
        changeRowEndDiv("clickSave", targetRowDOM, { "copy-original": newData });
        location.reload();
    }
    window.removeEventListener("keypress", preventSpaceAndNewLine);
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
    window.removeEventListener("keypress", preventSpaceAndNewLine);
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

function main(): void {
    recordForm?.addEventListener("submit", doSubmit);
    queryTradeHistoryOnLoad();
}

function doSubmit(): void {
    let data: any = {};
    for (let each of allRecordFormInputs) {
        if (each instanceof HTMLInputElement && each.value != null && each.value != undefined) {
            data[each.name] = each.value;
        }
    }
    recordsCRUD(data);
}

function preventSpaceAndNewLine(e: Event): void {
    if (e instanceof KeyboardEvent && (e.keyCode == 13 || e.keyCode == 32)) {
        e.preventDefault();
    }
}

main()

function arrangeAssetsInfo(): void {

}

google.charts.load('current', { 'packages': ['line'] });
google.charts.setOnLoadCallback(drawChart);
function drawChart() {
    let data = new google.visualization.DataTable();
    data.addColumn('number', 'Day');
    data.addColumn('number', 'Guardians of the Galaxy');
    data.addColumn('number', 'The Avengers');
    data.addColumn('number', 'Transformers: Age of Extinction');

    data.addRows([
        [1, 37.8, 80.8, 41.8],
        [2, 30.9, 69.5, 32.4],
        [3, 25.4, 57, 25.7],
        [4, 11.7, 18.8, 10.5],
        [5, 11.9, 17.6, 10.4],
        [6, 8.8, 13.6, 7.7],
        [7, 7.6, 12.3, 9.6],
        [8, 12.3, 29.2, 10.6],
        [9, 16.9, 42.9, 14.8],
        [10, 12.8, 30.9, 11.6],
        [11, 5.3, 7.9, 4.7],
        [12, 6.6, 8.4, 5.2],
        [13, 4.8, 6.3, 3.6],
        [14, 4.2, 6.2, 3.4]
    ]);

    let options = {
        chart: {
            title: 'Box Office Earnings in First Two Weeks of Opening',
            subtitle: 'in millions of dollars (USD)'
        },
        width: 500,
        height: 300
    };

    let chart = new google.charts.Line(document.getElementById('comprehensive-assets-chart'));

    chart.draw(data, google.charts.Line.convertOptions(options));
}