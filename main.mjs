import express from 'express'
import { CarManager } from './lib/car-manager.mjs'
import { createLineClient } from './lib/messaging-api-client.mjs'

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
        console.log('push message')
        for await (const nc of carManager.newCars){
          createLineClient(nc.startArea, nc.returnArea).pushMessage({
            to: process.env[`LINE_GROUP_ID_${nc.startArea}_${nc.returnArea}`],
            messages: [carManager.createMessage(nc, 'new')]
          })
        }
        carManager.newCars = []

        for await (const nc of carManager.soldOut){
          createLineClient(nc.startArea, nc.returnArea).pushMessage({
            to: process.env[`LINE_GROUP_ID_SOLD_${nc.startArea}_${nc.returnArea}`],
            messages: [carManager.createMessage(nc, 'soldOut')]
          })
        }
        carManager.soldOut = []
      }
    }
  }
);
