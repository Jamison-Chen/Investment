export class MyMath {
    static normalSample(mu, std) {
        let u = 0, v = 0;
        while (u === 0)
            u = Math.random(); //Converting [0,1) to (0,1)
        while (v === 0)
            v = Math.random();
        return std * Math.sqrt(-2.0 * Math.log(u)) * Math.cos(2.0 * Math.PI * v) + mu;
    }
    static avg(arr) {
        if (arr.length == 0)
            return 0;
        return arr.reduce((prev, curr) => prev + curr, 0) / arr.length;
    }
    static mySigmoid(x) {
        return 1 / (1 + 150 * Math.pow(Math.E, -10 * x));
    }
}
