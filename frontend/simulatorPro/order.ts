import { Individual } from './individual.js';
export class Order {
    private _owner: Individual;
    private _type: string;
    private _today: number;
    private _price: number;
    private _quantity: number;
    constructor(owner: Individual, type: string, today: number, p: number, q: number) {
        this._owner = owner;
        this._type = type;
        this._today = today;
        this._price = p;
        this._quantity = q;
    }
    public get owner(): Individual {
        return this._owner;
    }
    public get type(): string {
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