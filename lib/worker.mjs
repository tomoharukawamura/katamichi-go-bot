import { workerData } from 'worker_threads'
import { app as slackApp } from './slack-bot-app.cjs'
import { createAttachments } from './create-attachments.mjs'

const { startArea, returnArea, cars } = workerData

const slackChannelId = process.env[`SLACK_CHANNEL_ID_${startArea}_${returnArea}`] || process.env.SLACK_CHANNEL_ID_OTHER

if (slackChannelId) {
    await slackApp.client.chat.postMessage({
        channel: slackChannelId,
        attachments: cars.map(createAttachments)
    })
}