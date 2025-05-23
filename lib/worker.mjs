import { workerData } from 'worker_threads'
import { app as slackApp } from './slack-bot-app.cjs'
import { createAttachments } from './create-attachments.mjs'

const { startArea, returnArea, cars, type } = workerData

const slackChannelId = type == 'soldOut'
    ? process.env.SLACK_CHANNEL_ID_SOLD
    : process.env[`SLACK_CHANNEL_ID_${startArea}_${returnArea}`] || process.env.SLACK_CHANNEL_ID_OTHER

if (slackChannelId) {
    try {
        await slackApp.client.chat.postMessage({
            channel: slackChannelId,
            attachments: cars.map(createAttachments)
        })
    } catch (error) {
        console.error('Error in worker:', error)
    }
}