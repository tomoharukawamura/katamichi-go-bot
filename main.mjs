import express from 'express'
import { config } from 'dotenv'
import { CarManager } from './lib/car-manager.mjs'
import { line, lineClient } from './lib/messaging-api-client.mjs'

config()

const app = express()
const port = Number(process.env.PORT) || 3000
app.listen(port, async () => {
    console.log(`Server is running on port ${port}`);
    console.log(process.env.LINE_CHANNEL_ACCESS_TOKEN);
    await lineClient.pushMessage({
      to: process.env.LINE_USER_ID,
      messages: [
        {
          type: 'text',
          text: `bot started`
        }
      ]
    })
    const carManager = new CarManager()
    await carManager.getCars()
    setInterval(async () => {
      await carManager.getCars()
      if (!carManager.newCars.length || !carManager.soldOut.length) return
      await carManager.pushLINEMessage()
    }, 1000 * 2) // 2sごとに実行
  }
);
