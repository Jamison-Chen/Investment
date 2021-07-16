var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import { CreateRequestBody, ReadRequestBody } from "./requestBody.js";
import { MyGoogleChart } from "./chart.js";
import { StockInfoTable, StockWarehouseTable, TradeRecordTable } from "./table.js";
const recorderOption = document.getElementById("recorder-option");
const simulatorOption = document.getElementById("simulator-option");
const simulatorProOption = document.getElementById("simulator-pro-option");
const viewToggler = document.getElementById("view-toggler");
const togglerMask = document.getElementById("toggler-mask");
const upperPart = document.getElementById("upper-part");
const cashInvShowRangeInpt = document.getElementById("cash-invested-show-range-input");
const createRecordBtn = document.getElementById("create-trade-record-btn");
const createTradeRecordFormContainer = document.getElementById("create-trade-record-form-container");
const dealTimeRecordInput = document.getElementById("deal-time-record");
const dealPriceRecordInput = document.getElementById("deal-price-record");
const dealQuantityRecordInput = document.getElementById("deal-quantity-record");
const handlingFeeRecordInput = document.getElementById("handling-fee-record");
const allRecordFormInputs = document.getElementsByClassName("record-form-input");
const submitBtn = document.getElementById("submit-btn");
const createErrorDiv = document.getElementById("create-error");
const allTabs = document.getElementsByClassName("tab");
const allLowerTableContainers = document.getElementsByClassName("lower-table-container");
const stockWarehouseTableBody = document.querySelector("#stock-warehouse-table tbody");
const tradeRecordTableBody = document.querySelector("#trade-record-table tbody");
const stockInfoTableBody = document.querySelector("#stock-info-table tbody");
const allStockWarehouseTableRows = document.getElementsByClassName("stock-warehouse-table-row");
const cashInvestedChart = document.getElementById('cash-invested-chart');
const componentChart = document.getElementById('component-chart');
const compareChart = document.getElementById('compare-chart');
const individualPriceQuantityChart = document.getElementById("individual-price-quantity-chart");
const individualCompareChart = document.getElementById("individual-compare-chart");
let tradeRecordJson = {};
let stockInfoJson = {};
let allHoldingSids = new Set();
let stockWarehouse = {}; // structure: {aSid:{aPrice:curQ, ...}, ...}
let handlingFee = 0;
let cashInvested = 0;
let cashExtracted = 0;
let securityMktVal = 0;
let mygooglechart = new MyGoogleChart();
let traderecordtable;
let stockinfotable;
let stockwarehousetable;
let endPoint;
function tradeRecordCRUD(requestBody) {
    let bodyContent = requestBody.toURLSearchParams();
    return fetch(`${endPoint}records`, { method: 'post', body: bodyContent })
        .then(function (response) {
        return response.json();
    });
}
function fetchStockSingleDay(sidList, date = "") {
    const url = decideURL(sidList, date);
    return fetch(url)
        .then(function (response) {
        return response.json();
    });
}
function decideURL(sidList, date) {
    if (date != "" && sidList.length != 0) {
        return `${endPoint}fetch-stock-info?date=${date}&sid-list=${sidList.join(",")}`;
    }
    else if (date == "" && sidList.length != 0) {
        return `${endPoint}fetch-stock-info?sid-list=${sidList.join(",")}`;
    }
    else
        throw "decideURL: Info Not Sufficient";
}
function initAllHoldingSid(data) {
    for (let each of data)
        allHoldingSids.add(each["sid"]);
}
function buildStockWarehouse(data) {
    for (let eachSid of allHoldingSids)
        stockWarehouse[eachSid] = {};
    for (let eachTradeRecord in data) {
        let s = data[eachTradeRecord]["sid"];
        let t = data[eachTradeRecord]["deal-time"];
        stockWarehouse[s][t] = {};
    }
    for (let eachTradeRecord in data) {
        let s = data[eachTradeRecord]["sid"];
        let t = data[eachTradeRecord]["deal-time"];
        let p = data[eachTradeRecord]["deal-price"];
        let q = data[eachTradeRecord]["deal-quantity"];
        if (stockWarehouse[s][t][p])
            stockWarehouse[s][t][p] += q;
        else
            stockWarehouse[s][t][p] = q;
    }
}
function createTradeRecord(e) {
    return __awaiter(this, void 0, void 0, function* () {
        let requestBody = new CreateRequestBody();
        let hasEmpty = false;
        for (let each of allRecordFormInputs) {
            if (each instanceof HTMLInputElement && each.value != null && each.value != undefined) {
                if (each == dealTimeRecordInput)
                    requestBody.setAttribute(each.name, each.value.split("-").join(""));
                else if (each.value != "")
                    requestBody.setAttribute(each.name, each.value);
                else
                    hasEmpty = true;
            }
        }
        if (!hasEmpty) {
            yield tradeRecordCRUD(requestBody);
            location.reload();
        }
        else
            infoNotSufficientErr();
    });
}
function prepareCashInvChartData(endDateStr, data) {
    let startDateStr = data[data.length - 1]["deal-time"].toString();
    startDateStr = startDateStr.slice(0, 4) + "-" + startDateStr.slice(4, 6) + "-" + startDateStr.slice(6);
    let result = [];
    let dates = getDatesArray(new Date(startDateStr), new Date(endDateStr));
    for (let eachDate of dates) {
        const eachDateStr = eachDate.split("-").join("");
        let dataRow;
        // Create a new row whose values is the copy of the values of the previous(last) row.
        if (result[result.length - 1] != undefined) {
            dataRow = [eachDateStr, ...result[result.length - 1].slice(1, -1)];
        }
        else
            dataRow = [eachDateStr, ...[...allHoldingSids].map(x => 0)];
        for (let eachRecord of data) {
            let t = eachRecord["deal-time"];
            if (t == parseInt(eachDateStr)) {
                let s = eachRecord["sid"];
                let p = eachRecord["deal-price"];
                let q = eachRecord["deal-quantity"];
                let f = eachRecord["handling-fee"];
                handlingFee += f; // this will be used in compare chart
                let idx = [...allHoldingSids].indexOf(s) + 1;
                if (q >= 0) { // When buying
                    // The wierd way below is to comply TypeScript's rule. Actually, we can simply do:
                    // dataRow[idx] += p*q;
                    // if in Pure JavaScript.
                    dataRow[idx] = parseFloat(`${dataRow[idx]}`) + (p * q);
                }
                else { // When selling
                    for (let eachT in stockWarehouse[s]) {
                        if (q == 0)
                            break;
                        if (parseInt(eachT) < t) {
                            for (let eachP in stockWarehouse[s][eachT]) {
                                let eachQ = stockWarehouse[s][eachT][eachP];
                                let diff = q + eachQ;
                                if (diff >= 0) {
                                    stockWarehouse[s][eachT][eachP] = eachQ + q;
                                    dataRow[idx] = parseFloat(`${dataRow[idx]}`) + (parseFloat(eachP) * q);
                                    cashExtracted += (p - parseFloat(eachP)) * (-1 * q);
                                    q = 0;
                                    break;
                                }
                                else {
                                    stockWarehouse[s][eachT][eachP] = 0;
                                    dataRow[idx] = parseFloat(`${dataRow[idx]}`) - (parseFloat(eachP) * eachQ);
                                    cashExtracted += (p - parseFloat(eachP)) * eachQ;
                                    q = diff;
                                }
                            }
                        }
                    }
                    stockWarehouse[s][t][p] = q;
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
    // result = [["Date", ...allHoldingSids, "Total"], ...result];
    result = [["Date", "Cash Invested"], ...result.map(i => [i[0], i[i.length - 1]])]; // only use the "total" field
    let latestCashInv = result[result.length - 1][1];
    if (typeof latestCashInv == "number")
        cashInvested = latestCashInv;
    return result;
}
function getBalanceQForAllSids() {
    let result = [["Sid", "Market Value"]];
    // Count Q for each Sid and remove those whose Q == 0
    for (let eachStock in stockWarehouse) {
        let eachRow = [eachStock, 0];
        for (let eachDay in stockWarehouse[eachStock]) {
            for (let eachP in stockWarehouse[eachStock][eachDay]) {
                eachRow[1] += stockWarehouse[eachStock][eachDay][eachP];
            }
        }
        if (eachRow[1] != 0)
            result.push(eachRow);
        else
            allHoldingSids.delete(eachStock); // update allHoldingSids
    }
    return result;
}
function prepareComponentChartData(balanceQForAllSids, stockInfoData) {
    let result = balanceQForAllSids;
    // Q * market value
    for (let eachStock of stockInfoData) {
        for (let eachResult of result) {
            if (eachStock["sid"] == eachResult[0] && typeof eachResult[1] == "number") {
                eachResult[1] *= eachStock["close"];
                securityMktVal += eachResult[1];
            }
        }
    }
    // Merge small numbers into "others"
    let smallNum = result.filter(i => typeof i[1] == "number" && (i[1] / securityMktVal) < 0.05);
    result = result.filter(i => i[1] == "Market Value" || (typeof i[1] == "number" && (i[1] / securityMktVal) >= 0.05));
    let numForOthers = 0;
    if (smallNum.length > 1) {
        for (let each of smallNum) {
            if (typeof each[1] == "number")
                numForOthers += each[1];
        }
        result.push(["Others", numForOthers]);
    }
    else
        result.push(...smallNum);
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
function expandTradeRecordForm(e) {
    createTradeRecordFormContainer === null || createTradeRecordFormContainer === void 0 ? void 0 : createTradeRecordFormContainer.classList.add("active");
}
function foldTradeRecordForm(e) {
    if (e.target == createTradeRecordFormContainer)
        createTradeRecordFormContainer === null || createTradeRecordFormContainer === void 0 ? void 0 : createTradeRecordFormContainer.classList.remove("active");
}
function infoNotSufficientErr() {
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
function autoCalcHandlingFee(e) {
    if (dealPriceRecordInput instanceof HTMLInputElement && dealQuantityRecordInput instanceof HTMLInputElement && e.currentTarget instanceof HTMLInputElement) {
        let dealPNum = parseFloat(dealPriceRecordInput.value);
        let dealQNum = parseFloat(dealQuantityRecordInput.value);
        let fee;
        if (dealQNum >= 0)
            fee = Math.round(dealPNum * dealQNum * 0.001425);
        else
            fee = Math.round(dealPNum * -1 * dealQNum * 0.004425);
        e.currentTarget.value = fee >= 1 ? fee.toString() : "1";
    }
}
function controlToggler() {
    if (togglerMask != null && viewToggler != null) {
        togglerMask.style.left = "-1%";
        viewToggler.addEventListener("click", moveTogglerMask);
    }
}
function moveTogglerMask(e) {
    if (togglerMask instanceof HTMLElement && upperPart instanceof HTMLElement) {
        togglerMask.style.left = (-1 * parseFloat(togglerMask.style.left) + 50) + "%";
        if (upperPart.className == "overview")
            upperPart.className = "individual";
        else
            upperPart.className = "overview";
    }
}
function controlTab() {
    for (let each of allTabs) {
        if (each instanceof HTMLElement)
            each.addEventListener("click", highlightTab);
    }
}
function highlightTab(e) {
    for (let i = 0; i < allTabs.length; i++) {
        if (allTabs[i] == e.currentTarget && allLowerTableContainers[i] instanceof HTMLElement) {
            allTabs[i].classList.add("active");
            allLowerTableContainers[i].classList.add("active");
            allLowerTableContainers[i].classList.remove("close");
        }
        else {
            allTabs[i].classList.remove("active");
            allLowerTableContainers[i].classList.add("close");
            allLowerTableContainers[i].classList.remove("active");
        }
    }
}
function getStartDateStr(endDate, rollbackLength) {
    // if (rollbackLength == "aMonth") {
    //     let m = endDate.getMonth();
    //     endDate.setMonth(endDate.getMonth() - 1);
    //     // If still in same month, set date to last day of previous month.
    //     if (endDate.getMonth() == m) endDate.setDate(0);
    //     endDate.setHours(0, 0, 0, 0);
    // }
    endDate.setDate(endDate.getDate() - rollbackLength);
    return endDate.toISOString().slice(0, 10);
}
function showEachStockDetail(e, sid, individualMktVal) {
    // control which to highlight
    for (let i = 0; i < allStockWarehouseTableRows.length; i++) {
        if (allStockWarehouseTableRows[i] == e.currentTarget) {
            allStockWarehouseTableRows[i].classList.add("active");
        }
        else
            allStockWarehouseTableRows[i].classList.remove("active");
    }
    let eachStockCashInvst = calcEachStockCashInvst(sid);
    // arrange price quantity data
    let pqData = [["Date", "Price"]];
    for (let eachDate in stockWarehouse[sid]) {
        for (let eachP in stockWarehouse[sid][eachDate]) {
            for (let i = 0; i < parseInt(stockWarehouse[sid][eachDate][eachP]); i++)
                pqData.push([eachDate, parseFloat(eachP)]);
        }
    }
    mygooglechart.drawEachStockPQChart(pqData, individualPriceQuantityChart);
    mygooglechart.drawEachStockCompareChart(eachStockCashInvst, individualMktVal, individualCompareChart);
}
function calcEachStockCashInvst(sid) {
    let eachStockCashInvst = 0;
    for (let eachDate in stockWarehouse[sid]) {
        for (let eachP in stockWarehouse[sid][eachDate]) {
            eachStockCashInvst += parseFloat(eachP) * parseInt(stockWarehouse[sid][eachDate][eachP]);
        }
    }
    return eachStockCashInvst;
}
function addKeyboardEventLstnr() {
    window.addEventListener("keydown", (e) => {
        if (e.keyCode == 13) {
            if (createTradeRecordFormContainer === null || createTradeRecordFormContainer === void 0 ? void 0 : createTradeRecordFormContainer.classList.contains("active"))
                submitBtn === null || submitBtn === void 0 ? void 0 : submitBtn.click();
        }
    });
}
function main() {
    return __awaiter(this, void 0, void 0, function* () {
        if (window.location.hostname == "127.0.0.1" || window.location.hostname == "localhost") {
            endPoint = "http://127.0.0.1:8000/stockInfoScraper/";
        }
        else
            endPoint = "https://stock-info-scraper.herokuapp.com/";
        if (recorderOption instanceof HTMLAnchorElement && simulatorOption instanceof HTMLAnchorElement && simulatorProOption instanceof HTMLAnchorElement) {
            recorderOption.href = "#";
            recorderOption.classList.add("active");
            simulatorOption.href = "../simulator/";
            simulatorProOption.href = "../simulatorPro/";
        }
        if (createRecordBtn != null)
            createRecordBtn.addEventListener("click", expandTradeRecordForm);
        handlingFeeRecordInput === null || handlingFeeRecordInput === void 0 ? void 0 : handlingFeeRecordInput.addEventListener("click", autoCalcHandlingFee);
        if (submitBtn != null)
            submitBtn.addEventListener("click", createTradeRecord);
        if (createTradeRecordFormContainer != null)
            createTradeRecordFormContainer.addEventListener("click", foldTradeRecordForm);
        addKeyboardEventLstnr();
        controlToggler();
        controlTab();
        // The cash-invested chart need info in trade-record table, so this need to be await
        tradeRecordJson = yield tradeRecordCRUD(new ReadRequestBody());
        initAllHoldingSid(tradeRecordJson["data"]);
        buildStockWarehouse(tradeRecordJson["data"]);
        if (tradeRecordTableBody instanceof HTMLElement) {
            traderecordtable = new TradeRecordTable(tradeRecordTableBody, tradeRecordCRUD);
            traderecordtable.build(tradeRecordJson["data"]);
        }
        let todayStr = getStartDateStr(new Date(), 0);
        // stockWarehouse will be modified by the function below
        let cashInvestedData = prepareCashInvChartData(todayStr, tradeRecordJson["data"]);
        let firstDateStr = cashInvestedData[1][0];
        if (typeof firstDateStr == "string") {
            firstDateStr = `${firstDateStr.slice(0, 4)}-${firstDateStr.slice(4, 6)}-${firstDateStr.slice(6)}`;
        }
        let dateDelta = (new Date(todayStr).getTime() - new Date(firstDateStr).getTime()) / (1000 * 60 * 60 * 24);
        if (dealTimeRecordInput instanceof HTMLInputElement)
            dealTimeRecordInput.value = todayStr;
        mygooglechart.drawCashInvestedChart(firstDateStr.toString(), cashInvestedData, cashInvestedChart);
        if (cashInvShowRangeInpt instanceof HTMLInputElement) {
            cashInvShowRangeInpt.min = "0";
            cashInvShowRangeInpt.max = dateDelta.toString();
            cashInvShowRangeInpt.step = "1";
            cashInvShowRangeInpt.value = cashInvShowRangeInpt.max;
            cashInvShowRangeInpt.addEventListener("input", () => {
                let endDate = getStartDateStr(new Date(), parseInt(cashInvShowRangeInpt.value));
                mygooglechart.drawCashInvestedChart(endDate, cashInvestedData, cashInvestedChart);
            });
        }
        // The component chart need info in stock-info table, so this need to be await.
        // Remember that stock info need to be fetched after getBalanceQForAllSids().
        // because getBalanceQForAllSids() will remove sids in allHoldingSids whose balanceQ == 0
        let balanceQForAllSids = getBalanceQForAllSids(); // this function will modify allHoldingSids
        stockInfoJson = yield fetchStockSingleDay([...allHoldingSids]);
        if (stockInfoTableBody instanceof HTMLElement) {
            stockinfotable = new StockInfoTable(stockInfoTableBody);
            stockinfotable.build(stockInfoJson["data"], allHoldingSids);
        }
        let componentData = prepareComponentChartData(balanceQForAllSids, stockInfoJson["data"]);
        mygooglechart.drawComponentChart(componentData, componentChart);
        mygooglechart.drawCompareChart(cashInvested, securityMktVal, cashExtracted, handlingFee, compareChart);
        if (stockWarehouseTableBody instanceof HTMLElement) {
            stockwarehousetable = new StockWarehouseTable(stockWarehouseTableBody);
            stockwarehousetable.build(stockInfoJson["data"], allHoldingSids, stockWarehouse, showEachStockDetail, calcEachStockCashInvst);
        }
    });
}
main();
