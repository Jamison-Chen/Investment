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
const cashInvShowRangeInput = document.getElementById("cash-invested-show-range-input");
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
const mktValPieChart = document.getElementById('component-chart');
const compareChart = document.getElementById('compare-chart');
const individualPriceQuantityChart = document.getElementById("individual-price-quantity-chart");
const individualCompareChart = document.getElementById("individual-compare-chart");
let allHoldingSids = new Set();
let stockWarehouse = {}; // structure: {aSid:{aDealTime:{aPrice:curQ, ...},  ...}, ...}
let totalCashInvested = 0;
let cashExtracted = 0;
let totalMktVal = 0;
let handlingFee = 0;
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
function fetchStockInfo(sidList, date = "") {
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
        let hasUnfilledBlank = false;
        for (let each of allRecordFormInputs) {
            if (each instanceof HTMLInputElement && each.value != null && each.value != undefined) {
                if (each == dealTimeRecordInput) {
                    requestBody.setAttribute(each.name, each.value.split("-").join(""));
                }
                else if (each.value != "")
                    requestBody.setAttribute(each.name, each.value);
                else
                    hasUnfilledBlank = true;
            }
        }
        if (!hasUnfilledBlank) {
            yield tradeRecordCRUD(requestBody);
            location.reload();
        }
        else
            showInfoNotSufficientErr();
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
        totalCashInvested = latestCashInv;
    return result;
}
function calcBalanceQOfEachSidAndUpdateAllHoldingSids() {
    let hashMapResult = {};
    // Count Q for each Sid and remove those whose Q == 0
    for (let eachSid in stockWarehouse) {
        let eachRow = [eachSid, 0];
        for (let eachDay in stockWarehouse[eachSid]) {
            for (let eachP in stockWarehouse[eachSid][eachDay]) {
                eachRow[1] += stockWarehouse[eachSid][eachDay][eachP];
            }
        }
        if (eachRow[1] != 0)
            hashMapResult[eachRow[0]] = eachRow[1];
        else
            allHoldingSids.delete(eachSid); // update allHoldingSids
    }
    return hashMapResult;
}
function calcMktValOfEachSidAndCalcTotalMktVal(balanceQOfEachSids, stockInfoData) {
    let hashMap = balanceQOfEachSids;
    for (let eachStockInfo of stockInfoData) {
        hashMap[eachStockInfo["sid"]] *= eachStockInfo["close"];
        totalMktVal += hashMap[eachStockInfo["sid"]]; // calculate totalMktVal
    }
    return hashMap;
}
function prepareMktValPieChartData(balanceQOfEachSids, stockInfoData) {
    let mktValOfEachSids = calcMktValOfEachSidAndCalcTotalMktVal(balanceQOfEachSids, stockInfoData);
    // Merge small numbers into "Others"
    let smallMktValStocks = [];
    let result = [["Sid", "Market Value"]];
    for (let eachSid in mktValOfEachSids) {
        if (mktValOfEachSids[eachSid] / totalMktVal < 0.05) {
            smallMktValStocks.push([eachSid, mktValOfEachSids[eachSid]]);
        }
        else
            result.push([eachSid, mktValOfEachSids[eachSid]]);
    }
    let mktValOfOthers = 0;
    if (smallMktValStocks.length > 1) {
        for (let each of smallMktValStocks) {
            if (typeof each[1] == "number")
                mktValOfOthers += each[1];
        }
        result.push(["Others", mktValOfOthers]);
    }
    else
        result.push(...smallMktValStocks);
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
    if (e.target == createTradeRecordFormContainer) {
        createTradeRecordFormContainer === null || createTradeRecordFormContainer === void 0 ? void 0 : createTradeRecordFormContainer.classList.remove("active");
    }
}
function showInfoNotSufficientErr() {
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
function getStartDateStr(endDate, rollbackLength) {
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
    let cashInvstOfEachSid = calcCashInvstOfEachSid(sid);
    // arrange price quantity data
    let pqData = [["Date", "Price"]];
    for (let eachDate in stockWarehouse[sid]) {
        for (let eachP in stockWarehouse[sid][eachDate]) {
            for (let i = 0; i < parseInt(stockWarehouse[sid][eachDate][eachP]); i++) {
                pqData.push([eachDate, parseFloat(eachP)]);
            }
        }
    }
    mygooglechart.drawEachStockPQChart(pqData, individualPriceQuantityChart);
    mygooglechart.drawEachStockCompareChart(cashInvstOfEachSid, individualMktVal, individualCompareChart);
}
function calcCashInvstOfEachSid(sid) {
    let cashInvstOfEachSid = 0;
    for (let eachDate in stockWarehouse[sid]) {
        for (let eachP in stockWarehouse[sid][eachDate]) {
            cashInvstOfEachSid += parseFloat(eachP) * parseInt(stockWarehouse[sid][eachDate][eachP]);
        }
    }
    return cashInvstOfEachSid;
}
function decideEndPoint() {
    if (window.location.hostname == "127.0.0.1" || window.location.hostname == "localhost") {
        endPoint = "http://127.0.0.1:8000/stockInfoScraper/";
    }
    else
        endPoint = "https://stock-info-scraper.herokuapp.com/";
}
function decideOptionAnchorHref() {
    if (recorderOption instanceof HTMLAnchorElement && simulatorOption instanceof HTMLAnchorElement && simulatorProOption instanceof HTMLAnchorElement) {
        recorderOption.href = "#";
        recorderOption.classList.add("active");
        simulatorOption.href = "../simulator/";
        simulatorProOption.href = "../simulatorPro/";
    }
}
function addAllLstnrAboutCreatingRecord() {
    createRecordBtn === null || createRecordBtn === void 0 ? void 0 : createRecordBtn.addEventListener("click", expandTradeRecordForm);
    handlingFeeRecordInput === null || handlingFeeRecordInput === void 0 ? void 0 : handlingFeeRecordInput.addEventListener("click", autoCalcHandlingFee);
    submitBtn === null || submitBtn === void 0 ? void 0 : submitBtn.addEventListener("click", createTradeRecord);
    createTradeRecordFormContainer === null || createTradeRecordFormContainer === void 0 ? void 0 : createTradeRecordFormContainer.addEventListener("click", foldTradeRecordForm);
}
function addKeyboardEventLstnr() {
    window.addEventListener("keydown", (e) => {
        if (e.keyCode == 13) {
            if (createTradeRecordFormContainer === null || createTradeRecordFormContainer === void 0 ? void 0 : createTradeRecordFormContainer.classList.contains("active"))
                submitBtn === null || submitBtn === void 0 ? void 0 : submitBtn.click();
        }
    });
}
function makeViewTogglerControllable() {
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
function makeTabControllable() {
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
function setupCashInvShowRangeInput(todayStr, firstDayStr, cashInvestedData) {
    if (cashInvShowRangeInput instanceof HTMLInputElement) {
        let dayDelta = (new Date(todayStr).getTime() - new Date(firstDayStr).getTime()) / (1000 * 60 * 60 * 24);
        cashInvShowRangeInput.min = "0";
        cashInvShowRangeInput.max = dayDelta.toString();
        cashInvShowRangeInput.step = "1";
        cashInvShowRangeInput.value = cashInvShowRangeInput.max;
        cashInvShowRangeInput.addEventListener("input", () => {
            let endDate = getStartDateStr(new Date(), parseInt(cashInvShowRangeInput.value));
            mygooglechart.drawCashInvestedChart(endDate, cashInvestedData, cashInvestedChart);
        });
    }
}
function main() {
    return __awaiter(this, void 0, void 0, function* () {
        decideEndPoint();
        decideOptionAnchorHref();
        addAllLstnrAboutCreatingRecord();
        addKeyboardEventLstnr();
        makeViewTogglerControllable();
        makeTabControllable();
        // The cash-invested chart need info in trade-record table, so this need to be await
        let tradeRecordJson = yield tradeRecordCRUD(new ReadRequestBody());
        initAllHoldingSid(tradeRecordJson["data"]);
        buildStockWarehouse(tradeRecordJson["data"]);
        if (tradeRecordTableBody instanceof HTMLElement) {
            traderecordtable = new TradeRecordTable(tradeRecordTableBody, tradeRecordCRUD);
            traderecordtable.build(tradeRecordJson["data"]);
        }
        let todayStr = getStartDateStr(new Date(), 0);
        // stockWarehouse will be modified by the function below
        let cashInvestedData = prepareCashInvChartData(todayStr, tradeRecordJson["data"]);
        let firstDayStr = cashInvestedData[1][0].toString();
        firstDayStr = `${firstDayStr.slice(0, 4)}-${firstDayStr.slice(4, 6)}-${firstDayStr.slice(6)}`;
        mygooglechart.drawCashInvestedChart(firstDayStr, cashInvestedData, cashInvestedChart);
        // set default value for the deal-time field of the create-record form
        if (dealTimeRecordInput instanceof HTMLInputElement)
            dealTimeRecordInput.value = todayStr;
        setupCashInvShowRangeInput(todayStr, firstDayStr, cashInvestedData);
        // The component chart need info in stock-info table, so this need to be await.
        // Remember that stock info need to be fetched after calcBalanceQOfEachSidAndUpdateAllHoldingSids().
        // because calcBalanceQOfEachSidAndUpdateAllHoldingSids() will remove sids in allHoldingSids whose balanceQ == 0
        let balanceQOfEachSid = calcBalanceQOfEachSidAndUpdateAllHoldingSids(); // this function will modify allHoldingSids
        let stockInfoJson = yield fetchStockInfo([...allHoldingSids]);
        if (stockInfoTableBody instanceof HTMLElement) {
            stockinfotable = new StockInfoTable(stockInfoTableBody);
            stockinfotable.build(stockInfoJson["data"], allHoldingSids);
        }
        let mktValPieChartData = prepareMktValPieChartData(balanceQOfEachSid, stockInfoJson["data"]);
        mygooglechart.drawMktValPieChart(mktValPieChartData, mktValPieChart);
        mygooglechart.drawCompareChart(totalCashInvested, totalMktVal, cashExtracted, handlingFee, compareChart);
        if (stockWarehouseTableBody instanceof HTMLElement) {
            stockwarehousetable = new StockWarehouseTable(stockWarehouseTableBody);
            stockwarehousetable.build(stockInfoJson["data"], allHoldingSids, stockWarehouse, showEachStockDetail, calcCashInvstOfEachSid);
        }
    });
}
main();
