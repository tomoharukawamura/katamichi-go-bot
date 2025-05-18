import { workerData } from 'worker_threads'
import { createLineClient } from './messaging-api-client.mjs'

const { startArea, returnArea, messages, type } = workerData
const environmentVariableName = type == 'new' 
    ? `LINE_GROUP_ID_${startArea}_${returnArea}`
    : `LINE_GROUP_ID_SOLD_${startArea}_${returnArea}`
createLineClient(startArea, returnArea).pushMessage({
    to: process.env[environmentVariableName],
    messages
})