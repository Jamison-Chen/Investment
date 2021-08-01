export class Order {
    private _type: "buy" | "sell";
    private _today: number;
    private _price: number;
    private _quantity: number;
    public constructor(type: "buy" | "sell", today: number, p: number, q: number) {
        this._type = type;
        this._today = today;
        this._price = p;
        this._quantity = q;
    }
    public get type(): "buy" | "sell" {
        return this._type;
    }
    public get today(): number {
        return this._today;
    }
    public get price(): number {
        return this._price;
    }
    public get quantity(): number {
        return this._quantity;
    }
    public set quantity(q: number) {
        this._quantity = q;
    }
}
export interface OrderSet {
    sellOrder: Order;
    buyOrder: Order;
}