export interface requestbody {
    mode: string;
    toURLSearchParams(): URLSearchParams;
}

export class RequestBody implements requestbody {
    public mode;
    constructor(mode: string) {
        this.mode = mode;
    }
    public toURLSearchParams(): URLSearchParams {
        let result = new URLSearchParams();
        result.append("mode", this.mode);
        return result;
    }
}

export class CreateRequestBody extends RequestBody {
    public dealPrice: string | undefined;
    public dealQuantity: string | undefined;
    public dealTime: string | undefined;
    public handlingFee: string | undefined;
    public sid: string | undefined;
    constructor() {
        super("create");
    }
    public setAttribute(attrName: string, value: string): void {
        if (attrName === "deal-price") this.dealPrice = value;
        else if (attrName === "deal-quantity") this.dealQuantity = value;
        else if (attrName === "deal-time") this.dealTime = value;
        else if (attrName === "handling-fee") this.handlingFee = value;
        else if (attrName === "sid") this.sid = value;
    }
    public toURLSearchParams(): URLSearchParams {
        let result = super.toURLSearchParams();
        if (this.dealPrice != undefined && this.dealQuantity != undefined && this.dealTime != undefined && this.handlingFee != undefined && this.sid != undefined) {
            result.append("deal-price", this.dealPrice);
            result.append("deal-quantity", this.dealQuantity);
            result.append("deal-time", this.dealTime);
            result.append("handling-fee", this.handlingFee);
            result.append("sid", this.sid);
            return result;
        } else throw "Create Info Not Sufficient.";
    }
}

export class ReadRequestBody extends RequestBody {
    constructor() {
        super("read");
    }
}

export class UpdateRequestBody extends RequestBody {
    public id: string | undefined;
    public dealPrice: string | undefined;
    public dealQuantity: string | undefined;
    public dealTime: string | undefined;
    public handlingFee: string | undefined;
    public sid: string | undefined;
    constructor() {
        super("update");
    }
    public setAttribute(attrName: string, value: string): void {
        if (attrName === "id") this.id = value;
        else if (attrName === "deal-price") this.dealPrice = value;
        else if (attrName === "deal-quantity") this.dealQuantity = value;
        else if (attrName === "deal-time") this.dealTime = value;
        else if (attrName === "handling-fee") this.handlingFee = value;
        else if (attrName === "sid") this.sid = value;
    }
    public toURLSearchParams(): URLSearchParams {
        let result = super.toURLSearchParams();
        if (this.id != undefined && this.dealPrice != undefined && this.dealQuantity != undefined && this.dealTime != undefined && this.handlingFee != undefined && this.sid != undefined) {
            result.append("id", this.id);
            result.append("deal-price", this.dealPrice);
            result.append("deal-quantity", this.dealQuantity);
            result.append("deal-time", this.dealTime);
            result.append("handling-fee", this.handlingFee);
            result.append("sid", this.sid);
            return result;
        } else throw "Update Info Not Sufficient.";
    }
}

export class DeleteRequestBody extends RequestBody {
    public id: string;
    constructor(id: string) {
        super("delete");
        this.id = id;
    }
    public toURLSearchParams(): URLSearchParams {
        let result = super.toURLSearchParams();
        result.append("id", this.id);
        return result;
    }
}