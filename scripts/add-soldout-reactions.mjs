import { CarManager } from "../lib/car-manager.mjs";
import { app as slackApp } from "../lib/slack-bot-app.cjs";

const exec  = async (channel) => {
    const history = await slackApp.client.conversations.history({ channel })
    const result = history.messages
                  .reduce((acc, { attachments, ts, reactions }) => {
                    if (attachments && attachments.length > 0 && reactions && reactions.every(({ name }) => name != 'sold_out')) {
                      const soldOuts = attachments
                                        .filter(att => att.pretext.includes('新着') || att.pretext.includes('着弾'))
                                        .filter(att => !cm.availableCars.has(att.fields[1].value))
                      if(soldOuts.length) {
                        acc.push(ts)
                      }
                    }
                    return acc;
                  }, []);

    for await (const timestamp of result) {
        try {
            slackApp.client.reactions.add({
                channel,
                name: 'sold_out',
                timestamp
            })
        } catch (error) {
            continue
        }
    }
}

const channelIds = [
  process.env.SLACK_CHANNEL_ID_2_2,
  process.env.SLACK_CHANNEL_ID_2_3,
  process.env.SLACK_CHANNEL_ID_3_4,
  process.env.SLACK_CHANNEL_ID_4_5,
  process.env.SLACK_CHANNEL_ID_3_5,
  process.env.SLACK_CHANNEL_ID_OTHER
]

const cm = new CarManager();
await cm.getCars({ isInit: true });
for await (const channel of channelIds) {
  exec(channel)
}