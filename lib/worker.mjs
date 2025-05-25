import { workerData, parentPort } from 'worker_threads'
import { app as slackApp } from './slack-bot-app.cjs'
import { createAttachments } from './create-attachments.mjs'

const { car, ts: providedTs } = workerData

const slackChannelId = process.env[`SLACK_CHANNEL_ID_${car.startArea}_${car.returnArea}`] || process.env.SLACK_CHANNEL_ID_OTHER

if (slackChannelId) {
    const result = await slackApp.client.chat.postMessage({
        channel: slackChannelId,
        attachments: [createAttachments(car)],
        ...((car.type == 'recovered' || car.type == 'updated') && providedTs ? 
            {
                thread_ts: providedTs,
                reply_broadcast: true
            } : {})
        })

    if (car.type == 'new') {
        const { ts } = result
        parentPort.postMessage({ carName: car.carName, ts })
    }
}

process.exit(0);