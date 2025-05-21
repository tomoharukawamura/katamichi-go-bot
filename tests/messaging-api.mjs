import { Worker } from 'worker_threads';

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
  carName: 'パッソ',
  startShop: 'トヨタレンタリース宮城　仙台空港店',
  returnShop: 'トヨタモビリティサービス',
  condition: '禁煙・8人乗',
  date: '2025/5/22 ~ 2025/5/25', 
  phone: '090-6388-3536', 
  startArea: '2', 
  returnArea: '3' 
}

const type = process.env.TYPE_FOR_TEST
areadata.forEach(([startArea, returnArea]) => {
  console.log('push-message')
  new Worker('./lib/worker.mjs', { workerData: { startArea, returnArea, cars: [carData], type } })
})