import { UpdateRequestBody, DeleteRequestBody } from "./requestBody.js";
interface Table {
    tableBodyDiv: HTMLElement;
    build(...args: any[]): void;
}

export class MyTable implements Table {
    public tableBodyDiv;
    public constructor(tableBodyDiv: HTMLElement) {
        this.tableBodyDiv = tableBodyDiv;
    }
    public build(...args: any[]): void { }
}

export class RecordTable extends MyTable {
    protected crudFunction: Function;
    protected tableType: "trade" | "dividend";
    protected CLASSNAME_RECORD_TABLE_ROW: string;
    protected CLASSNAME_UPDATE_BTN: string;
    protected CLASSNAME_DELETE_BTN: string;
    protected CLASSNAME_ID: string;
    protected CLASSNAME_COMPANY_NAME: string;
    protected CLASSNAME_INPUT: string;
    protected CLASSNAME_NOT_EDITING: string;
    protected CLASSNAME_EDITING: string;
    protected CLASSNAME_CRUD: string;
    public constructor(tableBodyDiv: HTMLElement, crudFunction: Function, tableType: "trade" | "dividend") {
        super(tableBodyDiv);
        this.crudFunction = crudFunction;
        this.tableType = tableType;
        this.CLASSNAME_RECORD_TABLE_ROW = "record-table-row";
        this.CLASSNAME_UPDATE_BTN = "update-btn";
        this.CLASSNAME_DELETE_BTN = "delete-btn";
        this.CLASSNAME_ID = "id";
        this.CLASSNAME_COMPANY_NAME = "company-name";
        this.CLASSNAME_INPUT = "input";
        this.CLASSNAME_NOT_EDITING = "not-editing";
        this.CLASSNAME_EDITING = "editing";
        this.CLASSNAME_CRUD = "crud";
    }
    public readyToUpdate(srcObject: RecordTable, e: Event): void {
        // Because readyToUpdate(e) is a cllBack function,
        // which is belong to the "Object" class but not "this",
        // if we want to use methods that is defined in "this" object,
        // we need a param that is exactly the source object.
        let targetRowDOM = srcObject.findEditedRow(e);
        let copyOriginal: any = {};
        if (targetRowDOM instanceof HTMLElement) {
            let allInputSpans = targetRowDOM.querySelectorAll(`.${srcObject.CLASSNAME_INPUT}.${srcObject.CLASSNAME_NOT_EDITING}`);
            for (let each of allInputSpans) {
                // find each table td of the row being edited
                if (each.parentNode instanceof HTMLElement && each.parentNode.className !== srcObject.CLASSNAME_ID && each.parentNode.className !== srcObject.CLASSNAME_COMPANY_NAME) {
                    each.classList.replace(srcObject.CLASSNAME_NOT_EDITING, srcObject.CLASSNAME_EDITING);
                    each.setAttribute("contenteditable", "true");
                    // copy original data
                    copyOriginal[each.parentNode.className] = each.innerHTML;
                }
            }
            // change the words displayed in the crud div of the target row
            srcObject.changeRecordTableRowEndDiv("clickUpdate", targetRowDOM, { "copyOriginal": copyOriginal });
        }
        window.addEventListener("keypress", srcObject.noSpaceAndNewLine);
    }
    public readyToDelete(srcObject: RecordTable, e: Event): void {
        // Because readyToUpdate(e) is a cllBack function,
        // which is belong to the "Object" class but not "this",
        // if we want to use methods that is defined in "this" object,
        // we need a param that is exactly the source object.
        if (window.confirm("???????????????????????????????????????\n???????????????????????????")) {
            let targetRowDOM = srcObject.findEditedRow(e);
            if (targetRowDOM instanceof HTMLElement) {
                for (let each of targetRowDOM.childNodes) {
                    if (each instanceof HTMLElement && each.className === srcObject.CLASSNAME_ID) {
                        srcObject.crudFunction(new DeleteRequestBody(each.innerText), srcObject.tableType);
                        break;
                    }
                }
            }
            location.reload();
        }
    }
    public async saveUpdate(srcObject: RecordTable, e: Event): Promise<void> {
        // Because readyToUpdate(e) is a cllBack function,
        // which is belong to the "Object" class but not "this",
        // if we want to use methods that is defined in "this" object,
        // we need a param that is exactly the source object.
        let targetRowDOM = srcObject.findEditedRow(e);
        let requestBody: UpdateRequestBody = new UpdateRequestBody();
        if (targetRowDOM instanceof HTMLElement) {
            let allInputSpans = targetRowDOM.querySelectorAll(`.${srcObject.CLASSNAME_INPUT}`);
            for (let each of allInputSpans) {
                // find each table td of the row being edited
                if (each.parentNode instanceof HTMLElement) {
                    if (each.parentNode.className !== srcObject.CLASSNAME_ID && each.parentNode.className !== srcObject.CLASSNAME_COMPANY_NAME) {
                        each.classList.replace(srcObject.CLASSNAME_EDITING, srcObject.CLASSNAME_NOT_EDITING);
                        each.setAttribute("contenteditable", "false");
                    }
                    requestBody.setAttribute(each.parentNode.className, each.innerHTML);
                }
            }
            await srcObject.crudFunction(requestBody, srcObject.tableType);
            // change the words displayed in the crud div of the target row
            srcObject.changeRecordTableRowEndDiv("clickSave", targetRowDOM, { "copyOriginal": requestBody });
        }
        window.removeEventListener("keypress", srcObject.noSpaceAndNewLine);
        location.reload();
    }
    public forgetUpdate(srcObject: RecordTable, e: Event, args: any): void {
        // Because readyToUpdate(e) is a cllBack function,
        // which is belong to the "Object" class but not "this",
        // if we want to use methods that is defined in "this" object,
        // we need a param that is exactly the source object.
        let targetRowDOM = srcObject.findEditedRow(e);
        if (targetRowDOM instanceof HTMLElement) {
            let allInputSpans = targetRowDOM.querySelectorAll(`.${srcObject.CLASSNAME_INPUT}`);
            for (let each of allInputSpans) {
                // find each table td of the row being edited
                if (each.parentNode instanceof HTMLElement && each.parentNode.className !== srcObject.CLASSNAME_ID && each.parentNode.className !== srcObject.CLASSNAME_COMPANY_NAME) {
                    each.classList.replace(srcObject.CLASSNAME_EDITING, srcObject.CLASSNAME_NOT_EDITING);
                    each.setAttribute("contenteditable", "false");
                    // set original data back
                    each.innerHTML = args["copyOriginal"][each.parentNode.className];
                }
            }
            // change the words displayed in the crud div of the target row
            srcObject.changeRecordTableRowEndDiv("clickCancel", targetRowDOM, {});
        }
        window.removeEventListener("keypress", srcObject.noSpaceAndNewLine);
    }
    public findEditedRow(e: Event): HTMLElement | null {
        let temp = e.target;
        // find the row being edited
        while (temp instanceof HTMLElement && temp.parentNode !== null && temp.className !== this.CLASSNAME_RECORD_TABLE_ROW) {
            temp = temp.parentNode;
        }
        return temp instanceof HTMLElement ? temp : null;
    }
    public changeRecordTableRowEndDiv(type: string, targetRowDOM: HTMLElement, args: any): void {
        let updateDeleteSection = targetRowDOM.querySelector(`.${this.CLASSNAME_CRUD}`);
        let btnConfigList = [];
        if (type === "clickUpdate") {
            btnConfigList = [
                {
                    "btnClassName": "save-change-btn",
                    "btnDisplayName": "??????",
                    "cllbackFunc": this.saveUpdate,
                    "args": {}
                },
                {
                    "btnClassName": "forget-change-btn",
                    "btnDisplayName": "??????",
                    "cllbackFunc": this.forgetUpdate,
                    "args": {
                        "copyOriginal": args["copyOriginal"]
                    }
                }
            ];
        } else {
            btnConfigList = [
                {
                    "btnClassName": this.CLASSNAME_UPDATE_BTN,
                    "btnDisplayName": "??????",
                    "cllbackFunc": this.readyToUpdate,
                    "args": {}
                },
                {
                    "btnClassName": this.CLASSNAME_DELETE_BTN,
                    "btnDisplayName": "??????",
                    "cllbackFunc": this.readyToDelete,
                    "args": {}
                }
            ];
        }
        let newDiv = this.genUpdDelDiv(btnConfigList);
        if (updateDeleteSection instanceof HTMLElement) {
            updateDeleteSection.innerHTML = "";
            updateDeleteSection.appendChild(newDiv);
        }
        // hide all the update/delete btns of other rows
        let rows = document.getElementsByClassName(this.CLASSNAME_RECORD_TABLE_ROW);
        for (let each of rows) {
            if (each !== targetRowDOM) {
                let crudOfOtherRow = each.querySelector(`.${this.CLASSNAME_CRUD}`);
                if (crudOfOtherRow instanceof HTMLElement) {
                    crudOfOtherRow.style.display = type === "clickUpdate" ? "none" : "";
                }
            }
        }
    }
    public noSpaceAndNewLine(e: Event): void {
        if (e instanceof KeyboardEvent && (e.keyCode === 13 || e.keyCode === 32)) e.preventDefault();
    }
    public genUpdDelDiv(btnConfigList: { "btnClassName": string, "btnDisplayName": string, "cllbackFunc": Function, "args": any }[]): HTMLDivElement {
        const innerDiv = document.createElement("div");

        const btn1 = document.createElement("div");
        btn1.className = btnConfigList[0]["btnClassName"];
        btn1.innerHTML = btnConfigList[0]["btnDisplayName"];
        btn1.addEventListener("click", (e) => btnConfigList[0]["cllbackFunc"](this, e, btnConfigList[0]["args"]));

        const divideLine = document.createElement("div");
        divideLine.className = "divide-line";
        divideLine.innerHTML = " / ";

        const btn2 = document.createElement("div");
        btn2.className = btnConfigList[1]["btnClassName"];
        btn2.innerHTML = btnConfigList[1]["btnDisplayName"];
        btn2.addEventListener("click", (e) => btnConfigList[1]["cllbackFunc"](this, e, btnConfigList[1]["args"]));

        innerDiv.appendChild(btn1);
        innerDiv.appendChild(divideLine);
        innerDiv.appendChild(btn2);
        return innerDiv;
    }
    public build(data: any[]): void {
        super.build();
        if (this.tableBodyDiv !== null) {
            const tableHead = this.tableBodyDiv.children[0];
            this.tableBodyDiv.innerHTML = "";
            this.tableBodyDiv.appendChild(tableHead);
            for (let eachRecord of data) {
                let tr = document.createElement("tr");
                tr.className = this.CLASSNAME_RECORD_TABLE_ROW;
                for (let eachField in eachRecord) {
                    let td = document.createElement("td");
                    td.className = eachField;
                    const innerInput = document.createElement("span");
                    innerInput.classList.add(this.CLASSNAME_INPUT);
                    innerInput.classList.add(this.CLASSNAME_NOT_EDITING);
                    innerInput.setAttribute("role", "textbox");
                    innerInput.setAttribute("type", "number");
                    innerInput.innerHTML = eachRecord[eachField];
                    td.appendChild(innerInput);
                    // Do not show the id in the table.
                    if (eachField.toLowerCase() === this.CLASSNAME_ID) td.style.display = "none";
                    tr.appendChild(td)
                }
                // show the update/delete btn at the end of each row
                const updateDeleteSection = document.createElement("td");
                updateDeleteSection.className = this.CLASSNAME_CRUD;
                const btnConfigList = [
                    {
                        "btnClassName": this.CLASSNAME_UPDATE_BTN,
                        "btnDisplayName": "??????",
                        "cllbackFunc": this.readyToUpdate,
                        "args": {}
                    },
                    {
                        "btnClassName": this.CLASSNAME_DELETE_BTN,
                        "btnDisplayName": "??????",
                        "cllbackFunc": this.readyToDelete,
                        "args": {}
                    }
                ];
                let updateDeleteDiv = this.genUpdDelDiv(btnConfigList);
                updateDeleteSection.appendChild(updateDeleteDiv);
                tr.appendChild(updateDeleteSection);
                this.tableBodyDiv.appendChild(tr);
            }
        }
    }
}

export class StockInfoTable extends MyTable {
    public build(data: any[], allHoldingSids: Set<string>): void {
        super.build();
        if (this.tableBodyDiv !== null) {
            for (let eachStock of data) {
                if (allHoldingSids.has(eachStock["sid"])) {
                    let tr = document.createElement("tr");
                    tr.className = "stock-info-table-row";
                    for (let eachField in eachStock) {
                        if (eachField) {
                            if (eachField.indexOf("date") === -1 && eachField.indexOf("trade-type") === -1 && eachField.indexOf("open") === -1 && eachField.indexOf("highest") === -1 && eachField.indexOf("lowest") === -1) {
                                let td = document.createElement("td");
                                td.className = eachField;
                                td.innerHTML = eachStock[eachField];
                                tr.appendChild(td);
                                if (eachField === "fluct-price") {
                                    if (parseFloat(eachStock[eachField]) > 0) {
                                        td.innerHTML = "???" + Math.abs(parseFloat(eachStock[eachField]))
                                        tr.style.color = "#DE5246";
                                    } else if (parseFloat(eachStock[eachField]) < 0) {
                                        td.innerHTML = "???" + Math.abs(parseFloat(eachStock[eachField]))
                                        tr.style.color = "#1AA260";
                                    } else tr.style.color = "#888";
                                } else if (eachField === "quantity" || eachField === "close") {
                                    td.innerHTML = parseFloat(eachStock[eachField]).toLocaleString();
                                } else if (eachField === "fluct-rate") {
                                    let rate = Math.abs(Math.round((parseFloat(eachStock[eachField]) * 100 + Number.EPSILON) * 100) / 100);
                                    if (parseFloat(eachStock[eachField]) > 0) td.innerHTML = "???" + rate + "%";
                                    else if (parseFloat(eachStock[eachField]) < 0) td.innerHTML = "???" + rate + "%";
                                }
                            }
                        }
                    }
                    this.tableBodyDiv.appendChild(tr);
                }
            }
        }
    }
}

export class StockWarehouseTable extends MyTable {
    protected CLASSNAME_STOCK_WAREHOUSE_TABLE_ROW: string;
    protected CLASSNAME_SID: string;
    protected CLASSNAME_NAME: string;
    protected CLASSNAME_TOTAL: string;
    protected CLASSNAME_PRICE: string;
    protected CLASSNAME_AVERAGE_PRICE: string;
    public constructor(tableBodyDiv: HTMLElement) {
        super(tableBodyDiv);
        this.CLASSNAME_STOCK_WAREHOUSE_TABLE_ROW = "stock-warehouse-table-row";
        this.CLASSNAME_SID = "sid";
        this.CLASSNAME_NAME = "name";
        this.CLASSNAME_TOTAL = "total";
        this.CLASSNAME_PRICE = "price";
        this.CLASSNAME_AVERAGE_PRICE = "avg-price";
    }
    public build(stockWarehouseData: any[], tradeRecordData: any[], allHoldingSids: Set<string>, stockWarehouse: any, showEachStockDetail: Function, calcEachStockCashInvst: Function): void {
        super.build();
        if (this.tableBodyDiv !== null) {
            for (let eachSid of allHoldingSids) {
                let tr = document.createElement("tr");
                tr.className = this.CLASSNAME_STOCK_WAREHOUSE_TABLE_ROW;
                let sidTd = document.createElement("td");
                sidTd.className = this.CLASSNAME_SID;
                let nameTd = document.createElement("td");
                nameTd.className = this.CLASSNAME_NAME;
                let quantityTd = document.createElement("td");
                quantityTd.className = this.CLASSNAME_TOTAL;
                let priceTd = document.createElement("td");
                priceTd.className = this.CLASSNAME_PRICE;
                let avgPriceTd = document.createElement("td");
                avgPriceTd.className = this.CLASSNAME_AVERAGE_PRICE;

                tr.appendChild(sidTd);
                tr.appendChild(nameTd);
                tr.appendChild(quantityTd);
                tr.appendChild(priceTd);
                tr.appendChild(avgPriceTd);

                let price = 0;
                sidTd.innerHTML = eachSid;

                // find name and price from stockWarehouseData(stockInfo)
                for (let eachStockInfo of stockWarehouseData) {
                    if (eachSid === eachStockInfo["sid"]) {
                        nameTd.innerHTML = eachStockInfo["name"];
                        priceTd.innerHTML = eachStockInfo["close"];
                        price = parseFloat(eachStockInfo["close"])
                    }
                }

                // count indovidual stock total quantity
                let individualQ = 0;
                for (let eachDate in stockWarehouse[eachSid]) {
                    for (let eachP in stockWarehouse[eachSid][eachDate]) {
                        individualQ += parseInt(stockWarehouse[eachSid][eachDate][eachP])
                    }
                }
                quantityTd.innerHTML = `${individualQ}`;
                let avgPrice = Math.round((calcEachStockCashInvst(eachSid) / individualQ + Number.EPSILON) * 100) / 100;
                avgPriceTd.innerHTML = avgPrice.toLocaleString();
                let mktVal = Math.round((price * individualQ + Number.EPSILON) * 100) / 100;
                tr.addEventListener("click", (e) => { showEachStockDetail(e, eachSid, mktVal, tradeRecordData) });
                this.tableBodyDiv.appendChild(tr);
            }
        }
    }
}