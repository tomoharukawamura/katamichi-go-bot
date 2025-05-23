import { CarManager } from './lib/car-manager.mjs'
import { Worker } from 'worker_threads'
import { errorNotifyClient } from './lib/messaging-api-client.mjs'
import cron from 'node-cron'

const carManager = new CarManager()

const main = async () => {
  try {
    await carManager.getCars({ isInit: false })
    if (carManager.newCars.length) {
      const classifiedNewCars = carManager.classifyCars(carManager.newCars)
      const newCarWorkers = classifiedNewCars.map(cnc => 
        new Worker('./lib/worker.mjs', { workerData: { ...cnc, type: 'new' } })
        .on('error', error => { throw error })
      )
      carManager.newCars = []
    }
    if (carManager.soldOut.length) {
      new Worker('./lib/worker.mjs', { workerData: { startArea: '0', returnArea: '0', cars: carManager.soldOut, type: 'soldOut' }})
      .on('error', error => { throw error })
      carManager.soldOut = []
    }
 
  } catch (error) {
    await errorNotifyClient.pushMessage({
      to: process.env.LINE_USER_ID,
      messages: [{
        type: 'text',
        text: error.body ? JSON.stringify(error.body) : error
      }]
    })
  }
}

// const startRoutine = async () => {
//   await carManager.getCars({ isInit: true })
//   cron.schedule('*/30 * * * * *', main)
// }

// process.on('SIGINT', () => {
//   console.log('SIGINT received. Exiting...');
//   process.exit(0);
// });

// startRoutine()
const start = performance.now()
main()
.then(() => {
  const end = performance.now()
  console.log(`Execution time: ${(end - start)} milliseconds`)
})
