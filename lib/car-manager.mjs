import area from '../json/area.json' with { type: 'json' }
import links from '../json/link.json' with { type: 'json' }
import { lineClient as client } from './messaging-api-client.mjs'
import * as cheerio from 'cheerio'

export class CarManager {
  constructor() {
    this.url = "https://cp.toyota.jp/rentacar"
    this.shopListUrlPrefix = "https://cp.toyota.jp/rentacar/shoplist/"
    this.html = null
    this.availableCars = []
    this.newCars = []
    this.soldOut = []
  }

  createMessage (car, type) {
    const title = type === 'soldOut' ? '売り切れ' : '新着'
    const start = area[car.startArea]
    const returnArea = area[car.returnArea]
    const message = start === returnArea ? `${start}` : `${start}発${returnArea}行`
    const returnShopCandidateLink = `${this.shopListUrlPrefix}${links[car.returnShop]}.html`
    const messageArray = [
      `【${title}】`,
      `---${message}---`,
      `車両: ${car.carName}`,
      `出発店舗: ${car.startShop}`,
      `返却: ${car.returnShop}`,
    ].concat(type == 'new' ? [
      `返却可能店舗: ${returnShopCandidateLink}`,
      car.condition,
      `貸出期間: ${car.date}`,
      `電話番号: ${car.phone}`
    ] : [])
    return {
      type: 'text',
      text: messageArray.join('\n')
    }
  }

  async getCars (fetchAll = false) {
    const response = await fetch(this.url)
    const html = await response.text()
  
    // 変化なし
    if (this.html === html) return

    this.html = html
    const carsList = []
    const $ = cheerio.load(html)
    const avalableCarElems = $('ul#service-items-shop-type-start').find('li > div.service-item__body'.concat(fetchAll ? '' : ':not(.show-entry-end)'))
    avalableCarElems.each((idx, element) => {
      const carName = $(element).find('div.service-item__info__car-type > p:not(.label-sp)').text().trim()
      const startShop = $(element).find('div.service-item__shop-start > p:not(.label-sp)').text().replace(/（.+）/, '').trim()
      const startArea = $(element).parent().attr('data-start-area')
      const returnShop = $(element).find('div.service-item__shop-return > p:not(.label-sp)').text().replace(/（下記参照）| 返却可能店舗/g, '').trim()
      const returnArea = $(element).parent().attr('data-return-area')
      const condition = $(element).find('div.service-item__info__condition > p:not(.label-sp)').text().trim()
      const date = $(element).find('div.service-item__date > p:not(.label-sp)').text().trim()
      const phone = $(element).find('div.service-item__reserve-tel').text().trim()
      carsList.push({ carName, startShop,  returnShop, condition, date, phone, startArea, returnArea })
    })
    console.log(carsList)
    this.newCars = carsList.filter(car => !this.availableCars.some(c => c.carName == car.carName))
    this.soldOut = this.availableCars.filter(car => !carsList.some(c => c.carName == car.carName))
    this.availableCars = carsList
  }

  async pushLINEMessage () {
    if (this.newCars.length) {
      await client.pushMessage({
        to: process.env.LINE_USER_ID,
        messages: this.newCars.map(car => this.createMessage(car, 'new')).slice(0, 5),
      })
    }

    if (this.soldOut.length) {
      await client.pushMessage({
        to: process.env.LINE_GROUP_ID_SOLD,
        messages: this.soldOut.map(car => this.createMessage(car, 'soldOut')).slice(0, 5),
      })
    }
  }
}