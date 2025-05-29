import { app as slackApp } from './lib/slack-bot-app.cjs';

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
}