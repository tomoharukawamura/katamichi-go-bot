import { workerData } from 'worker_threads'
import { createLineClient } from './messaging-api-client.mjs'
import { createMessage } from './create-flex-message.mjs'

const { startArea, returnArea, cars, type } = workerData
const messages = cars.map(car => createMessage(car, type))
const environmentVariableName = type == 'new' 
    ? `LINE_GROUP_ID_${startArea}_${returnArea}`
    : `LINE_GROUP_ID_SOLD_${startArea}_${returnArea}`
createLineClient(startArea, returnArea).pushMessage({
    to: process.env[environmentVariableName],
    messages
})