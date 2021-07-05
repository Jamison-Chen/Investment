export class Order {
    constructor(owner, type, today, p, q) {
        this._owner = owner;
        this._type = type;
        this._today = today;
        this._price = p;
        this._quantity = q;
    }
    get owner() {
        return this._owner;
    }
    get type() {
        return this._type;
    }
    get today() {
        return this._today;
    }
    get price() {
        return this._price;
    }
    get quantity() {
        return this._quantity;
    }
    set quantity(q) {
        this._quantity = q;
    }
}
