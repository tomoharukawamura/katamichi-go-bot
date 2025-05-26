import { workerData, parentPort } from 'worker_threads'
import { app as slackApp } from './slack-bot-app.cjs'
import { createAttachments } from './create-attachments.mjs'

const { car, ts: providedTs } = workerData

const messageChannelId = process.env[`SLACK_CHANNEL_ID_${car.startArea}_${car.returnArea}`] || process.env.SLACK_CHANNEL_ID_OTHER
const channel = car.type == 'soldOut' ? process.env.SLACK_CHANNEL_ID_SOLD : messageChannelId

try {
    if (channel) {
        const result = await slackApp.client.chat.postMessage({
            channel,
            attachments: [createAttachments(car)],
            ...((car.type == 'recovered' || car.type == 'updated') && providedTs ? 
                {
                    thread_ts: providedTs,
                    reply_broadcast: true
                } : {})
            })
        if (car.type == 'new') {
            parentPort.postMessage({ carName: car.carName, ts: result.ts })
        } else if (car.type == 'soldOut' && providedTs) {
            await slackApp.client.reactions.add({
                channel: messageChannelId,
                name: 'sold_out',
                timestamp: providedTs
            })
        } else if (car.type == 'recovered' && providedTs) {
            await slackApp.client.reactions.remove({
                channel: messageChannelId,
                name: 'sold_out',
                timestamp: providedTs
            })
        }
    }
} catch (error) {
    throw error
}

process.exit(0);