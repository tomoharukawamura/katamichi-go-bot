import express from 'express'
import { CarManager } from './lib/car-manager.mjs'
import { Worker } from 'worker_threads'
import { errorNotifyClient } from './lib/messaging-api-client.mjs'

const app = express()
const port = Number(process.env.PORT) || 3000
const carManager = new CarManager()

app.listen(port, async () => {
    console.log(`Server is running on port ${port}`);
    try {
      await carManager.getCars({ resetNewCars: false, resetSoldCars: false })
      while (true) {
        await carManager.getCars({ resetNewCars: true, resetSoldCars: true })
  
        if (!carManager.newCars.length && !carManager.soldOut.length) {
          setTimeout(() => {
            Promise.resolve()
          }, 1000 * 30)
        } else {
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
        }
      }
    } catch (error) {
      await errorNotifyClient.pushMessage({
        to: process.env.LINE_USER_ID,
        messages: [{
          type: 'text',
          text: JSON.stringify(error.body)
        }]
      })
    }
  }
);
