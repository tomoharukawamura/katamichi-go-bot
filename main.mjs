import express from 'express'
import { CarManager } from './lib/car-manager.mjs'
import { createMessage } from './lib/create-flex-message.mjs'
import { Worker } from 'worker_threads'

const app = express()
const port = Number(process.env.PORT) || 3000
const carManager = new CarManager()

app.listen(port, async () => {
    console.log(`Server is running on port ${port}`);

    await carManager.getCars({ resetNewCars: false, resetSoldCars: false })
    while (true) {
      await carManager.getCars({ resetNewCars: true, resetSoldCars: true })

      if (!carManager.newCars.length && !carManager.soldOut.length) {
        setTimeout(() => {
          Promise.resolve()
        }, 2000)
      } else {
        if (carManager.newCars.length) {
          const classifiedNewCars = carManager.classifyCars(carManager.newCars)
          const newCarWorkers = classifiedNewCars.map(({ startArea, returnArea, cars }) => {
            const messages = cars.map(car => createMessage(car, 'new'))
            return new Worker('./lib/worker.mjs', { workerData: { startArea, returnArea, messages, type: 'new' }})
          })
          carManager.newCars = []
        }
        if (carManager.soldOut.length) {
          const classifiedSoldOutCars = carManager.classifyCars(carManager.soldOut)
          const soldOutCarWorkers = classifiedSoldOutCars.map(({ startArea, returnArea, cars }) => {
            const messages = cars.map(car => createMessage(car, 'soldOut'))
            return new Worker('./lib/worker.mjs', { workerData: { startArea, returnArea, messages, type: 'soldOut' }})
          })
          carManager.soldOut = []
        }
      }
    }
  }
);
