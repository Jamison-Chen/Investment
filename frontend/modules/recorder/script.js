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
import { CashInvestedChart, MktValPieChart, CompareChart, EachStockPQChart, EachStockCompareChart } from "./chart.js";
import { StockInfoTable, StockWarehouseTable, RecordTable } from "./table.js";
const recorderOption = document.getElementById("recorder-option");
const simulatorOption = document.getElementById("simulator-option");
const simulatorProOption = document.getElementById("simulator-pro-option");
const viewToggler = document.getElementById("view-toggler");
const togglerMask = document.getElementById("toggler-mask");
const upperPart = document.getElementById("upper-part");
const cashInvShowRangeInput = document.getElementById("cash-invested-show-range-input");
const createRecordBtn = document.getElementById("create-trade-record-btn");
const createTradeRecordFormBackground = document.getElementById("create-trade-record-form-background");
const allRecordFormOptions = document.getElementsByClassName("record-form-option");
const allCreateRecordForms = document.getElementsByClassName("create-record-form");
const tradeDealTimeRecordInput = document.getElementById("trade-deal-time-record");
const cashDividendDealTimeRecordInput = document.getElementById("cash-dividend-deal-time-record");
const dealPriceRecordInput = document.getElementById("deal-price-record");
const dealQuantityRecordInput = document.getElementById("deal-quantity-record");
const handlingFeeRecordInput = document.getElementById("handling-fee-record");
const submitBtn = document.getElementById("submit-btn");
const createErrorDiv = document.getElementById("create-error");
const allLowerTableTabs = document.getElementsByClassName("tab");
const allLowerTableContainers = document.getElementsByClassName("lower-table-container");
const stockWarehouseTableBody = document.querySelector("#stock-warehouse-table tbody");
const tradeRecordTableBody = document.querySelector("#trade-record-table tbody");
const cashDividendTableBody = document.querySelector("#cash-dividend-table tbody");
const individualRecordTableBody = document.querySelector("#individual-record-table tbody");
const stockInfoTableBody = document.querySelector("#stock-info-table tbody");
const cashInvestedChart = document.getElementById('cash-invested-chart');
const mktValPieChart = document.getElementById('component-chart');
const compareChart = document.getElementById('compare-chart');
const individualPriceQuantityChart = document.getElementById("individual-price-quantity-chart");
const individualCompareChart = document.getElementById("individual-compare-chart");
const loading = document.getElementById("loading");
let allHoldingSids = new Set();
let stockWarehouse = {}; // structure: {aSid:{aDealTime:{aPrice:curQ, ...},  ...}, ...}
let cashDividendJson;
let totalCashInvested = 0;
let cashExtracted = 0;
let totalMktVal = 0;
let handlingFee = 0;
let cashInvestedChartDrawer = new CashInvestedChart(cashInvestedChart);
let mktValPieChartDrawer = new MktValPieChart(mktValPieChart);
let compareChartDrawer = new CompareChart(compareChart);
let individualPriceQuantityChartDrawer = new EachStockPQChart(individualPriceQuantityChart);
let individualCompareChartDrawer = new EachStockCompareChart(individualCompareChart);
let traderecordtable;
let cashdividendrecordtable;
let individualtraderecordtable;
let stockinfotable;
let stockwarehousetable;
let endPoint;
function recordCRUD(requestBody, type) {
    let bodyContent = requestBody.toURLSearchParams();
    return fetch(`${endPoint}${type}`, { method: 'post', body: bodyContent })
        .then((resp) => resp.json());
}
function fetchStockInfo(sidList, date = "") {
    const url = decideURL(sidList, date);
    return fetch(url).then((resp) => resp.json());
}
function decideURL(sidList, date) {
    if (date !== "" && sidList.length !== 0) {
        return `${endPoint}fetch-stock-info?date=${date}&sid-list=${sidList.join(",")}`;
    }
    else if (date === "" && sidList.length !== 0) {
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
function createRecord(e) {
    return __awaiter(this, void 0, void 0, function* () {
        let requestBody = new CreateRequestBody();
        let hasUnfilledBlank = false;
        const allRecordFormInputs = document.querySelectorAll(".create-record-form.active .record-form-input");
        for (let each of allRecordFormInputs) {
            if (each instanceof HTMLInputElement && each.value !== null && each.value !== undefined) {
                if (each === tradeDealTimeRecordInput || each === cashDividendDealTimeRecordInput) {
                    requestBody.setAttribute(each.name, each.value.split("-").join(""));
                }
                else if (each.value !== "")
                    requestBody.setAttribute(each.name, each.value);
                else
                    hasUnfilledBlank = true;
            }
        }
        if (!hasUnfilledBlank) {
            const selectedForm = document.querySelector(".create-record-form.active");
            if ((selectedForm === null || selectedForm === void 0 ? void 0 : selectedForm.id) === "trade-record-form")
                yield recordCRUD(requestBody, "trade");
            else if ((selectedForm === null || selectedForm === void 0 ? void 0 : selectedForm.id) === "cash-dividend-form")
                yield recordCRUD(requestBody, "dividend");
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
        if (result[result.length - 1] !== undefined) {
            dataRow = [eachDateStr, ...result[result.length - 1].slice(1, -1)];
        }
        else
            dataRow = [eachDateStr, ...[...allHoldingSids].map(x => 0)];
        for (let eachRecord of data) {
            let t = eachRecord["deal-time"];
            if (t === parseInt(eachDateStr)) {
                let s = eachRecord["sid"];
                let p = eachRecord["deal-price"];
                let q = eachRecord["deal-quantity"];
                let f = eachRecord["handling-fee"];
                handlingFee += f; // this will be used in compare chart
                let idx = [...allHoldingSids].indexOf(s) + 1;
                if (q >= 0)
                    dataRow[idx] = parseFloat(`${dataRow[idx]}`) + (p * q);
                else { // When selling
                    for (let eachT in stockWarehouse[s]) {
                        if (q === 0)
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
        const reducer = (a, b) => a + b;
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
    if (typeof latestCashInv === "number")
        totalCashInvested = latestCashInv;
    return result;
}
function addCashDividendOnCashExtracted(data) {
    for (let eachRecord of data)
        cashExtracted += eachRecord["cash-dividend"];
}
function calcBalanceQOfEachSidAndUpdateAllHoldingSids() {
    let hashMapResult = {};
    // Count Q for each Sid and remove those whose Q === 0
    for (let eachSid in stockWarehouse) {
        let eachRow = [eachSid, 0];
        for (let eachDay in stockWarehouse[eachSid]) {
            for (let eachP in stockWarehouse[eachSid][eachDay]) {
                eachRow[1] += stockWarehouse[eachSid][eachDay][eachP];
            }
        }
        if (eachRow[1] !== 0)
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
            if (typeof each[1] === "number")
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
    createTradeRecordFormBackground === null || createTradeRecordFormBackground === void 0 ? void 0 : createTradeRecordFormBackground.classList.add("active");
}
function foldTradeRecordForm(e) {
    if (e.target === createTradeRecordFormBackground) {
        createTradeRecordFormBackground === null || createTradeRecordFormBackground === void 0 ? void 0 : createTradeRecordFormBackground.classList.remove("active");
    }
}
function showInfoNotSufficientErr() {
    if (createErrorDiv !== null) {
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
function showEachStockDetail(e, sid, individualMktVal, tradeRecordData) {
    // control which to highlight
    const allStockWarehouseTableRows = document.getElementsByClassName("stock-warehouse-table-row");
    for (let i = 0; i < allStockWarehouseTableRows.length; i++) {
        if (allStockWarehouseTableRows[i] === e.currentTarget) {
            allStockWarehouseTableRows[i].classList.add("active");
        }
        else
            allStockWarehouseTableRows[i].classList.remove("active");
    }
    let cashInvstOfEachSid = calcCashInvstOfEachSid(sid);
    let cashDividendOfEachSid = calcCashDividendOfEachSid(sid);
    // arrange price quantity data
    let pqData = [["Date", "Price"]];
    for (let eachDate in stockWarehouse[sid]) {
        for (let eachP in stockWarehouse[sid][eachDate]) {
            for (let i = 0; i < parseInt(stockWarehouse[sid][eachDate][eachP]); i++) {
                pqData.push([eachDate, parseFloat(eachP)]);
            }
        }
    }
    // select trade records of that sid
    let selectedTradeRecordData = tradeRecordData.filter(each => each["sid"] === sid);
    individualPriceQuantityChartDrawer.drawChart(pqData);
    individualCompareChartDrawer.drawChart(cashInvstOfEachSid, individualMktVal, cashDividendOfEachSid);
    if (individualRecordTableBody instanceof HTMLElement) {
        individualtraderecordtable = new RecordTable(individualRecordTableBody, recordCRUD, "trade");
        individualtraderecordtable.build(selectedTradeRecordData);
    }
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
function calcCashDividendOfEachSid(sid) {
    let c = cashDividendJson["data"];
    let d = 0;
    for (let each of c) {
        if (each["sid"] === sid)
            d += each["cash-dividend"];
    }
    return d;
}
function decideEndPoint() {
    if (window.location.hostname === "127.0.0.1" || window.location.hostname === "localhost") {
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
    submitBtn === null || submitBtn === void 0 ? void 0 : submitBtn.addEventListener("click", createRecord);
    createTradeRecordFormBackground === null || createTradeRecordFormBackground === void 0 ? void 0 : createTradeRecordFormBackground.addEventListener("click", foldTradeRecordForm);
}
function addKeyboardEventLstnr() {
    window.addEventListener("keydown", (e) => {
        if (e.keyCode === 13) {
            if (createTradeRecordFormBackground === null || createTradeRecordFormBackground === void 0 ? void 0 : createTradeRecordFormBackground.classList.contains("active"))
                submitBtn === null || submitBtn === void 0 ? void 0 : submitBtn.click();
        }
    });
}
function makeViewTogglerControllable() {
    if (togglerMask !== null && viewToggler !== null) {
        togglerMask.style.left = "-1%";
        viewToggler.addEventListener("click", moveTogglerMask);
    }
}
function moveTogglerMask(e) {
    if (togglerMask instanceof HTMLElement && upperPart instanceof HTMLElement) {
        togglerMask.style.left = (-1 * parseFloat(togglerMask.style.left) + 50) + "%";
        if (upperPart.className === "overview")
            upperPart.className = "individual";
        else
            upperPart.className = "overview";
    }
}
function makeTabControllable(tabGroup, controlledSections) {
    for (let each of tabGroup) {
        if (each instanceof HTMLElement) {
            each.addEventListener("click", (e) => { highlightTab(e, tabGroup, controlledSections); });
        }
    }
}
function highlightTab(e, tabGroup, controlledSections) {
    for (let i = 0; i < tabGroup.length; i++) {
        if (tabGroup[i] === e.currentTarget && controlledSections[i] instanceof HTMLElement) {
            tabGroup[i].classList.add("active");
            controlledSections[i].classList.replace("close", "active");
        }
        else {
            tabGroup[i].classList.remove("active");
            controlledSections[i].classList.replace("active", "close");
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
            cashInvestedChartDrawer.drawChart(endDate, cashInvestedData);
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
        makeTabControllable(allRecordFormOptions, allCreateRecordForms);
        makeTabControllable(allLowerTableTabs, allLowerTableContainers);
        // The cash-invested chart need info in trade-record table, so this need to be await
        cashDividendJson = yield recordCRUD(new ReadRequestBody(), "dividend");
        let tradeRecordJson = yield recordCRUD(new ReadRequestBody(), "trade");
        initAllHoldingSid(tradeRecordJson["data"]);
        buildStockWarehouse(tradeRecordJson["data"]);
        if (tradeRecordTableBody instanceof HTMLElement) {
            traderecordtable = new RecordTable(tradeRecordTableBody, recordCRUD, "trade");
            traderecordtable.build(tradeRecordJson["data"]);
        }
        if (cashDividendTableBody instanceof HTMLElement) {
            cashdividendrecordtable = new RecordTable(cashDividendTableBody, recordCRUD, "dividend");
            cashdividendrecordtable.build(cashDividendJson["data"]);
        }
        let todayStr = getStartDateStr(new Date(), 0);
        // stockWarehouse will be modified by the prepareCashInvChartData function
        // cashExtracted will be counted in the prepareCashInvChartData function,
        // but cashExtracted is not complete yet, because dividend hasn't been added
        let cashInvestedData = prepareCashInvChartData(todayStr, tradeRecordJson["data"]);
        let firstDayStr = cashInvestedData[1][0].toString();
        firstDayStr = `${firstDayStr.slice(0, 4)}-${firstDayStr.slice(4, 6)}-${firstDayStr.slice(6)}`;
        cashInvestedChartDrawer.drawChart(firstDayStr, cashInvestedData);
        addCashDividendOnCashExtracted(cashDividendJson["data"]);
        // set default value for the deal-time field of the create-record form
        if (tradeDealTimeRecordInput instanceof HTMLInputElement)
            tradeDealTimeRecordInput.value = todayStr;
        if (cashDividendDealTimeRecordInput instanceof HTMLInputElement)
            cashDividendDealTimeRecordInput.value = todayStr;
        setupCashInvShowRangeInput(todayStr, firstDayStr, cashInvestedData);
        // The component chart need info in stock-info table, so this need to be await.
        // Remember that stock info need to be fetched after calcBalanceQOfEachSidAndUpdateAllHoldingSids().
        // because calcBalanceQOfEachSidAndUpdateAllHoldingSids() will remove sids in allHoldingSids whose balanceQ === 0
        let balanceQOfEachSid = calcBalanceQOfEachSidAndUpdateAllHoldingSids(); // this function will modify allHoldingSids
        let stockInfoJson = yield fetchStockInfo([...allHoldingSids]);
        if (stockInfoTableBody instanceof HTMLElement) {
            stockinfotable = new StockInfoTable(stockInfoTableBody);
            stockinfotable.build(stockInfoJson["data"], allHoldingSids);
        }
        let mktValPieChartData = prepareMktValPieChartData(balanceQOfEachSid, stockInfoJson["data"]);
        mktValPieChartDrawer.drawChart(mktValPieChartData);
        compareChartDrawer.drawChart(totalCashInvested, totalMktVal, cashExtracted, handlingFee);
        if (stockWarehouseTableBody instanceof HTMLElement) {
            stockwarehousetable = new StockWarehouseTable(stockWarehouseTableBody);
            stockwarehousetable.build(stockInfoJson["data"], tradeRecordJson["data"], allHoldingSids, stockWarehouse, showEachStockDetail, calcCashInvstOfEachSid);
        }
        if (loading instanceof HTMLElement)
            loading.style.display = "none";
    });
}
main();
