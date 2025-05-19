import { CarManager } from "./lib/car-manager.mjs";
import { createMessage } from "./lib/create-flex-message.mjs";
import express from "express";
import { Worker } from "worker_threads";

// const app = express()

// class Test {
//     constructor() {
//         this.array = []
//         this.num = 0
//     }
//     add () {
//         this.array.push(this.num)
//         this.num++
//     }
// }

// const test = new Test()
// app.listen(3000, () => {
//     console.log(`Server is running on port 3000`);
//     setInterval(() => {
//         test.add()
//         console.log(test.array)
//     }, 1000 * 2) // 2sごとに実行
// })

const carManager = new CarManager()
const testList = [
    {
        carName: "GRヤリス",
        startShop: "東京駅八重洲口",
        returnShop: "東京駅八重洲口",
        condition: "新車",
        date: "2023/10/01 - 2023/10/31",
        phone: "03-1234-5678",
        startArea: "3",
        returnArea: "5",
    },
    {
        carName: "エスクァイア",
        startShop: "東京駅八重洲口",
        returnShop: "トヨタモビリティサービス",
        condition: "新車",
        date: "2023/10/01 - 2023/10/31",
        phone: "03-1234-5678",
        startArea: "5",
        returnArea: "3"
    },
    {
        carName: "プリウスPHV 車両番号8643",
        startShop: "東京駅八重洲口",
        returnShop: "東京駅八重洲口",
        condition: "新車",
        date: "2023/10/01 - 2023/10/31",
        phone: "03-1234-5678",
        startArea: "5",
        returnArea: "3"
    }
]
const result = carManager.classifyCars(testList)
// console.log(result)
// result.forEach((car) => {
//     console.log(car.cars)
// })

const classifiedNewCars = carManager.classifyCars(testList)
const newCarWorkers = classifiedNewCars.map((c) => {
    return new Worker('./lib/worker.mjs', { workerData: { ...c, type: 'new' }})
})
carManager.newCars = []


