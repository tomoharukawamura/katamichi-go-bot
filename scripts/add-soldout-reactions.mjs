import { CarManager } from "../lib/car-manager.mjs";
import { redisClient } from "../lib/redis-client.mjs";
import { app as slackApp } from "../lib/slack-bot-app.cjs";

const exec  = async () => {
    const cm = new CarManager();
    await cm.getCars({ isInit: true });
    const tsData = await redisClient.hgetall('car_ts_data');
    cm.notAvailableCars.forEach(async ({ startArea, returnArea }, carName) => {
        const result = await slackApp.client.reactions.add({
            channel: process.env[`SLACK_CHANNEL_ID_${startArea}_${returnArea}`] || process.env.SLACK_CHANNEL_ID_OTHER,
            name: 'sold_out',
            timestamp: tsData[carName]
        })
    })
}

exec()