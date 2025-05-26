import { Worker } from 'worker_threads';
import { CarManager } from '../lib/car-manager.mjs';
import { redisClient } from '../lib/redis-client.mjs';

const areadata = [
  ['2','3'], 
  // ['3','2'],
  // ['3','4'],
  // ['4','3'],
  // ['4','5'],
  // ['5','4'],
  // ['5','3'],
  // ['3','5'],
]

const carData = {
  carName: 'アルファード 車両番号865',
  startShop: 'トヨタレンタリース福島 いわき平店',
  returnShop: 'トヨタモビリティサービス',
  condition: '禁煙・8人乗',
  date: '2025/5/22 ~ 2025/5/25', 
  phone: '0746321020', 
  startArea: '2', 
  returnArea: '3' ,
  type: 'soldOut',
}

const car2 = {
  carName: 'ヤリス 車両番号865',
  startShop: 'トヨタレンタリース福島 いわき平店',
  returnShop: 'トヨタモビリティサービス',
  condition: '禁煙・5人乗',
  date: '2025/5/22 ~ 2025/5/25', 
  phone: '0746321020', 
  startArea: '2', 
  returnArea: '3' ,
  type: 'recovered',
}

const type = process.env.TYPE_FOR_TEST;
const tsData = await redisClient.hgetall('car_ts_data')
Promise.all([carData].map(car => 
  new Promise((resolve) => {
    new Worker('./lib/worker.mjs', { workerData: { car, ts: tsData[car.carName] || null } })
    .on('error', error => { throw error })
    .on('message', async (data) => {
      tsData[car.carName] = data.ts;
    })
    .on('exit', (code) => {
      if (code == 0) {
        resolve()
      }
    });
  })
)).then(async () => {
  await redisClient.hset('car_ts_data', tsData);
  await redisClient.quit();
})
// carManager.newCars = []
// if (carManager.soldOut.length) {
//   await slackApp.client.chat.postMessage({
//     channel: process.env.SLACK_CHANNEL_ID_SOLD,
//     attachments: carManager.soldOut.map(createAttachments)
//   })
//   carManager.soldOut = []
// }

// const cm = new CarManager()
// await cm.getCars({ resetNewCars: false, resetSoldCars: false })
// console.log(cm.availableCars)