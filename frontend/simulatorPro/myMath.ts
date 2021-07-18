export class MyMath {
    public static suffleArray(anArray: any[]): any[] {
        for (let i = anArray.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            const temp = anArray[i];
            anArray[i] = anArray[j];
            anArray[j] = temp;
        }
        return anArray;
    }
    public static avg(arr: number[]): number {
        if (arr.length == 0) return 0;
        return arr.reduce((prev: number, curr: number) => prev + curr, 0) / arr.length;
    }
    public static mySigmoid(x: number): number {
        return 1 / (1 + 150 * Math.pow(Math.E, -10 * x));
    }
    public static normalSample(mu: number, std: number): number {
        let u = 0, v = 0;
        while (u === 0) u = Math.random(); //Converting [0,1) to (0,1)
        while (v === 0) v = Math.random();
        return std * Math.sqrt(-2.0 * Math.log(u)) * Math.cos(2.0 * Math.PI * v) + mu;
    }
    public static oneTailNormalSample(mu: number, std: number, side: string): number {
        let u = 0, v = 0;
        while (u === 0) u = Math.random(); //Converting [0,1) to (0,1)
        while (v === 0) v = Math.random();
        if (side == "left") {
            return Math.abs(std * Math.sqrt(-2.0 * Math.log(u)) * Math.cos(2.0 * Math.PI * v)) * -1 + mu;
        }
        return Math.abs(std * Math.sqrt(-2.0 * Math.log(u)) * Math.cos(2.0 * Math.PI * v)) + mu;
    }
}