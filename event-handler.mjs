import { app as slackApp } from './lib/slack-bot-app.cjs';
import { CarManager } from './lib/car-manager.mjs';
import areaNumbers from './json/area.json' with { type: 'json' };
import { createAttachments } from './lib/create-attachments.mjs';

export const startHandler = () => {
  slackApp.event('reaction_added', async ({ event, client }) => {
    if (event.reaction == 'sold_out' && event.user != process.env.SLACK_BOT_USER_ID) {
      try {
          await client.chat.postEphemeral({
              channel: event.item.channel,
              text: `おい、<@${event.user}>！ 勝手に売り切れにするな！`,
              user: event.user
          })
      } catch (error) {
          console.error('Error sending message:', error);
      }
    }
  })

  slackApp.command('/search_car', async ({ command, ack, respond, client }) => {
    await ack()

    if (command.channel_id != process.env.SLACK_CHANNEL_ID_SEARCH) return

    if (!command.text) {
      await respond('目的地と出発地を入力してください。')
      return
    }

    const from = command.text.split('→')[0].trim();
    const to = command.text.split('→')[1]?.trim() ?? from

    const cm = new CarManager()
    await cm.getCars({ isInit: true })
    const results = []
    cm.availableCars.forEach((car, _carname) => {
      if (areaNumbers[car.startArea] == from.trim() && areaNumbers[car.returnArea] == to.trim()) {
        results.push({ ...car, type: 'search' })
      }
    })

    const { ts } = await client.chat.postMessage({
      channel: process.env.SLACK_CHANNEL_ID_SEARCH,
      text: `<@${command.user_id}>さんが「${from}」から「${to}」への車を検索しました。結果はスレッド参照。`
    })
    if (!results.length) {
      await client.chat.postMessage({
        channel: process.env.SLACK_CHANNEL_ID_SEARCH,
        text: '該当する車は見つかりませんでした。',
        thread_ts: ts
      })
    } else {
        await client.chat.postMessage({
          channel: process.env.SLACK_CHANNEL_ID_SEARCH,
          attachments: results.map(createAttachments),
          thread_ts: ts
        })
    }
  })
}