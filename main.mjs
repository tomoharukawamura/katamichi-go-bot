import { CarManager } from './lib/car-manager.mjs'
import { Worker } from 'worker_threads'
import { errorNotifyClient } from './lib/messaging-api-client.mjs'
import { app as slackApp } from './lib/slack-bot-app.cjs'
import cron from 'node-cron'
import { createAttachments } from './lib/create-attachments.mjs'

const carManager = new CarManager()

const main = async () => {
  try {
    await carManager.getCars({ isInit: false })
    console.log(CarManager.availableCars)
    console.log(CarManager.notAvailableCars)
    if (carManager.newCars.length) {
      const classifiedNewCars = carManager.classifyCars(carManager.newCars)
      const newCarWorkers = classifiedNewCars.map(cnc => 
        new Worker('./lib/worker.mjs', { workerData: cnc })
        .on('error', error => { throw error })
      )
      carManager.newCars = []
    }
    if (carManager.soldOut.length) {
      await slackApp.client.chat.postMessage({
        channel: process.env.SLACK_CHANNEL_ID_SOLD,
        attachments: carManager.soldOut.map(createAttachments)
      })
      carManager.soldOut = []
    }
  } catch (error) {
    carManager.newCars = []
    carManager.soldOut = []
    await errorNotifyClient.pushMessage({
      to: process.env.LINE_USER_ID,
      messages: [{
        type: 'text',
        text: 'エラーが発生しました。LOGを確認してください。'
      }]
    })
  }
}

const startRoutine = async () => {
  carManager.availableCars.clear()
  carManager.notAvailableCars.clear()
  await carManager.getCars({ isInit: true })
  cron.schedule('*/30 * * * * *', main)
}

process.on('SIGINT', () => {
  console.log('SIGINT received. Exiting...');
  process.exit(0);
});

startRoutine()
// const start = performance.now()
// main()
// .then(() => {
//   const end = performance.now()
//   console.log(`Execution time: ${(end - start)} milliseconds`)
// })
