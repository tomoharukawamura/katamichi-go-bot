import { workerData } from 'worker_threads'
import { createLineClient } from '../lib/messaging-api-client.mjs'

const { startArea, returnArea, type } = workerData
const environmentVariableName = type == 'new' 
    ? `LINE_GROUP_ID_${startArea}_${returnArea}`
    : `LINE_GROUP_ID_SOLD_${startArea}_${returnArea}`
const to = process.env[environmentVariableName]
if (to) {
    try {
        await createLineClient(startArea, returnArea).pushMessage({ to, messages: { type: 'text', text: 'hello' } })
    } catch (error) {
        console.error('Error in worker:', error)
    }
}