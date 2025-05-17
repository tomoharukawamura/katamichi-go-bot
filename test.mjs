import { CarManager } from "./lib/car-manager.mjs";
import { lineClient } from "./lib/messaging-api-client.mjs";
import express from "express";

const app = express()

class Test {
    constructor() {
        this.array = []
        this.num = 0
    }
    add () {
        this.array.push(this.num)
        this.num++
    }
}

const test = new Test()
app.listen(3000, () => {
    console.log(`Server is running on port 3000`);
    setInterval(() => {
        test.add()
        console.log(test.array)
    }, 1000 * 2) // 2sごとに実行
})

