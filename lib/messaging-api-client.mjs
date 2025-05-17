import * as line from '@line/bot-sdk';

export { line }

export const createLineClient = (startA, returnA) => new line.messagingApi.MessagingApiClient({
  channelAccessToken: process.env[`LINE_CHANNEL_ACCESS_TOKEN_${startA}_${returnA}`] || process.env.LINE_CHANNEL_ACCESS_TOKEN_3_5,
});