import { CarManager } from "./lib/car-manager.mjs";
import { lineClient } from "./lib/messaging-api-client.mjs";
import { config } from "dotenv";
config()

const carManager = new CarManager()
await carManager.getCars(true)
lineClient.pushMessage({
  to: process.env.LINE_GROUP_ID,
  messages: carManager.availableCars.map(car => carManager.createMessage(car, 'new')).slice(0, 5),
})