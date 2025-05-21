const { App } = require('@slack/bolt');

const app = new App({
    signingSecret: process.env.SLACK_SIGNING_SECRET,
    token: process.env.SLACK_BOT_TOKEN
})

// const main = async () => {
//     const result = await app.client.chat.postMessage({
//         channel: process.env.SLACK_CHANNEL_ID_TEST,
//         text: 'Hello world!'
//     })
// }

// main()

module.exports = { app }