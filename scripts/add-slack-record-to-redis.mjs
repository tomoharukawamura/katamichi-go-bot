// import { redisClient } from "../lib/redis-client.mjs";
import { redisClient } from "../lib/redis-client.mjs";
import { app as slackApp } from "../lib/slack-bot-app.cjs";

const channelIds = [
  process.env.SLACK_CHANNEL_ID_2_2,
  process.env.SLACK_CHANNEL_ID_2_3,
  process.env.SLACK_CHANNEL_ID_3_4,
  process.env.SLACK_CHANNEL_ID_4_5,
  process.env.SLACK_CHANNEL_ID_3_5,
  process.env.SLACK_CHANNEL_ID_OTHER
]

const exec = async (channel) => {
  const history = await slackApp.client.conversations.history({
    channel
  })
  const result = history.messages.reverse()
                  .reduce((acc, { attachments, ts }) => {
                    if (attachments && attachments.length > 0) {
                      attachments
                      .filter(att => att.pretext.includes('新着') || att.pretext.includes('着弾'))
                      .forEach(att => {
                        acc = {
                          ...acc,
                          ...Object.fromEntries([[att.fields[1].value, ts]])
                        }
                      })
                    }
                    return acc;
                  }, {});
 return result
}

for await (const channel of channelIds) {
  const result = await exec(channel)
  console.log(result)
  redisClient.hset('car_ts_data', result)
}
redisClient.quit()

