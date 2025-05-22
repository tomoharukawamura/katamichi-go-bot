import express from 'express'
import { CarManager } from './lib/car-manager.mjs'
import { Worker } from 'worker_threads'
import { errorNotifyClient } from './lib/messaging-api-client.mjs'
import cron from 'node-cron'

const carManager = new CarManager()

const main = async () => {
  try {
    await carManager.getCars({ resetNewCars: true, resetSoldCars: true })
    if (carManager.newCars.length) {
      const classifiedNewCars = carManager.classifyCars(carManager.newCars)
      const newCarWorkers = classifiedNewCars.map(cnc => 
        new Worker('./lib/worker.mjs', { workerData: { ...cnc, type: 'new' }})
        .on('error', error => { throw error })
      )
      carManager.newCars = []
    }
    if (carManager.soldOut.length) {
      const classifiedSoldOutCars = carManager.classifyCars(carManager.soldOut)
      const soldOutCarWorkers = classifiedSoldOutCars.map(csoc => 
        new Worker('./lib/worker.mjs', { workerData: { ...csoc, type: 'soldOut' }})
        .on('error', error => { throw error })
      )
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

const startRoutine = async () => {
  // 毎日午前7時に開始し、午後9時に停止する方法
  await carManager.getCars({ resetNewCars: false, resetSoldCars: false })

  cron.schedule('*/30 * * * * *', main)
}

process.on('SIGINT', () => {
  console.log('SIGINT received. Exiting...');
  process.exit(0);
});

startRoutine()
