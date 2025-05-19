import express from 'express';
import { createLineClient, line } from './lib/messaging-api-client.mjs';
import { extractData } from './lib/extract-data.mjs';
import { CarInfomation } from './lib/car-tags.mjs';

const botServer = express();

const config = {
  channelSecret: process.env.LINE_CHANNEL_SECRET,
};
const carInfo = new CarInfomation();

botServer.get('/', (_req, res) => { res.send('bot is alive') });

botServer.post('/webhook',
  line.middleware(config),
  async (req, res) => {
    Promise
      .all(req.body.events.map(handleEvent))
      .then((result) => res.json(result))
      .catch((err) => {
        console.error(err);
        res.status(500).end();
      });
    }
)

const handleEvent = async (event) => {
  if (event.type !== 'message' || event.message.type !== 'text') {
    return Promise.resolve(null);
  }

  if (event.message.text === 'get group id') {
    return await createLineClient(process.env.STRAT_FOR_BOT, process.env.RETURN_FOR_BOT).replyMessage({
      replyToken: event.replyToken,
      messages: [
        {
          type: 'text',
          text: `group id: ${event.source.groupId}`
        }
      ]
    });
  }
  
  // // 通常の検索
  // const message = event.message.text;
  // // メッセージをjsonに変換
  // const { carName, startArea, returnArea, date, tags } = await extractData(message);
  // const params = {
  //   carName,
  //   startArea,
  //   returnArea,
  //   date,
  //   tags
  // }
  // if (!carName && tags.length) {
  //   params.carName = await carInfo.listCars(tags.join(','))
  // }
  
}

botServer.listen(3000, () => {
  console.log("bot server is running on port 3000");
})