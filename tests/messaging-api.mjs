import { Worker } from 'worker_threads';
import { CarManager } from '../lib/car-manager.mjs';

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
  carName: 'プリウスPHEV4545',
  startShop: 'トヨタモビリティサービス羽田空港(国際線)店',
  returnShop: 'トヨタレンタリース大阪（返却可能店舗）',
  condition: '禁煙・8人乗',
  date: '2025/5/22 ~ 2025/5/25', 
  phone: '0746321020', 
  startArea: '2', 
  returnArea: '3' 
}

const type = process.env.TYPE_FOR_TEST
areadata.forEach(([startArea, returnArea]) => {
  console.log('push-message')
  new Worker('./lib/worker.mjs', { workerData: { startArea, returnArea, cars: [...Array.from({ length: 1 })].map(_i => carData), type } })
})

// const cm = new CarManager()
// await cm.getCars({ resetNewCars: false, resetSoldCars: false })
// console.log(cm.availableCars)