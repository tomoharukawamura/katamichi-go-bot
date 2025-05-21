const { App } = require('@slack/bolt');

const app = new App({
    signingSecret: process.env.SLACK_SIGNING_SECRET,
    token: process.env.SLACK_BOT_TOKEN
})

// const main = async () => {
//     const result = await app.client.chat.postMessage({
//         channel: process.env.SLACK_CHANNEL_ID_TEST,
//         attachments: [
//             {
//                 color: '#36a64f',
//                 fallback: "new cars",
//                 pretext: "【新着】\n🚫導入終了車🚫",
//                 fields: [
//                     {
//                         title: "区間",
//                         value: "東京→大阪",
//                         short: false
//                     },
//                     {
//                         title: "車両",
//                         value: "test",
//                         short: false
//                     },
//                     {
//                         title: "出発店舗",
//                         value: "トヨタモビリティサービス　日暮里店",
//                         short: false
//                     },
//                     {
//                         title: "返却",
//                         value: "トヨタレンタリース大阪（返却可能店舗は<https://cp.toyota.jp/rentacar/shoplist/hakodate.html|こちら>）",
//                         short: false
//                     },
//                     {
//                         title: "車両条件",
//                         value: "禁煙　５人乗り　ナビ・ETC・ドライブレコーダー",
//                         short: false
//                     },
//                     {
//                         title: '予約電話番号',
//                         value: '090-6388-3536',
//                     }
//                 ],
//                 image_url: "https://global.toyota/pages/news/images/2021/04/28/1330_alphard_velfire/20210428_01_01_s.jpg"
//             }
//         ]
//     })
// }

// main()

module.exports = { app }