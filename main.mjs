import { CarManager } from './lib/car-manager.mjs'
import { Worker } from 'worker_threads'
import { errorNotifyClient } from './lib/messaging-api-client.mjs'
import { app as slackApp } from './lib/slack-bot-app.cjs'
import cron from 'node-cron'
import { createAttachments } from './lib/create-attachments.mjs'
import { redisClient } from './lib/redis-client.mjs'

const carManager = new CarManager()

const notifyNewCars = async () => {
  const tsData = await redisClient.hgetall('car_ts_data')
  Promise.all(carManager.newCars.map(car => 
    new Promise((resolve) => {
      const ts = tsData[car.carName] ?? null
      new Worker('./lib/worker.mjs', { workerData: { car , ts } })
      .on('error', error => { throw error })
      .on('message', (data) => {
        tsData[car.carName] = data.ts
      })
      .on('exit', (code) => {
        if (code == 0) {
          resolve()
        }
      });
    })
  ))
  .then(async () => {
    await redisClient.hset('car_ts_data', tsData)
  })
  .finally(async () => {
    carManager.newCars = []
  })
}

const main = async () => {
  try {
    await carManager.getCars({ isInit: false })
    if (carManager.newCars.length) {
      await notifyNewCars()
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
    console.error('Error occurred:', error);
    await errorNotifyClient.pushMessage({
      to: process.env.LINE_USER_ID,
      messages: [{
        type: 'text',
        text: 'エラーが発生しました。LOGを確認してください。'
      }]
    })
  }
}

const deleteUnnecessaryKeys = async () => { 
  try {
    // carManagerリセット
    console.log('reset carManager')
    carManager.reset()
    await carManager.getCars({ isInit: true })
    // キー削除
    const redisKeys = await redisClient.hkeys('car_ts_data')
    const deleteKeys = redisKeys.filter(k => !carManager.availableCars.has(k) && !carManager.notAvailableCars.has(k))
    if (!deleteKeys.length) return
    console.log('delete unnecessary keys:' + deleteKeys.join('\n'))
    Promise.all(deleteKeys.map(key => (async () => { await redisClient.hdel('car_ts_data', key) })))
  } catch (error) {
    console.error('Error occurred while deleting unnecessary keys:', error);
    await errorNotifyClient.pushMessage({
      to: process.env.LINE_USER_ID,
      messages: [{
        type: 'text',
        text: '不要なキーの削除中にエラーが発生しました。LOGを確認してください。'
      }]
    })
  }
}

const startRoutine = async () => {
  await carManager.getCars({ isInit: true })
  // 30sおきに実行
  cron.schedule('*/30 * * * * *', main)
  // 毎日深夜0時にredisの不要なキーを削除
  cron.schedule('0 0 * * *', deleteUnnecessaryKeys)
}

process.on('SIGINT', async () => {
  await redisClient.quit()
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
