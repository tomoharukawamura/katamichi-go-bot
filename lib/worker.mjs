import { workerData } from 'worker_threads'
import { createLineClient } from './messaging-api-client.mjs'
import { createMessage } from './create-flex-message.mjs'
import { app as slackApp } from './slack-bot-app.cjs'

const { startArea, returnArea, cars, type } = workerData
const environmentVariableName = type == 'new' 
    ? `LINE_GROUP_ID_${startArea}_${returnArea}`
    : `LINE_GROUP_ID_SOLD_${startArea}_${returnArea}`
const to = process.env[environmentVariableName]
if (to) {
    try {
        const messages = cars.map(car => createMessage(car, type))
        await createLineClient(startArea, returnArea).pushMessage({ to, messages })
    } catch (error) {
        console.error('Error in worker:', error)
    }
}

const slackChannelId = process.env[`SLACK_CHANNEL_ID_${startArea}_${returnArea}`]
if (slackChannelId && type == 'new') {
    try {
        await slackApp.client.chat.postMessage({
            channel: slackChannelId,
            text: 'New Cars'
        })
    } catch (error) {
        console.error('Error in worker:', error)
    }
}