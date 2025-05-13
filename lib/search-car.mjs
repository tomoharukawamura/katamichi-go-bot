import * as cheerio from 'cheerio'

class CarSearch {
  constructor() {
    this.url = "https://cp.toyota.jp/rentacar"
    this.shopListUrlPrefix = "https://cp.toyota.jp/rentacar/shoplist/"
    this.html = null
    this.resultElem = null
    this.result = []
  }

  async convertToJson(msg) {

  }

  async searchCars(params) {
    const html = await (await fetch(this.url)).text()
    const $ = cheerio.load(html)
    this.resultElem = $('ul#service-items-shop-type-start').find('li').has('div.service-item__body:not(.show-entry-end)')
    const { startArea: startA, returnArea: returnA, date, carNames } = params
    if (startA) {
      this.resultElem = $(this.resultElem).filter(`[data-start-area=${startA}]`)
    }
    if (returnA) {
      this.resultElem = $(this.resultElem).filter(`[data-return-area=${returnA}]`)
    }
    if (carNames.length) {
      const createdCarSelector = carNames.map(car => `:contains("${car}")`).join(', ')
      this.resultElem = $(this.resultElem).has(`div.service-item__info__car-type > p:not(.label-sp)${createdCarSelector}`)
    }

    const DATE_REGEX = /^.+(\d{1,2})月(\d{1,2})日/
    const year = new Date().getFullYear()
    this.resultElem.each((idx, element) => {
      const carName = $(element).find('div.service-item__info__car-type > p:not(.label-sp)').text().trim()
      const startShop = $(element).find('div.service-item__shop-start > p:not(.label-sp)').text().replace(/（.+）/, '').trim()
      const startArea = $(element).attr('data-start-area')
      const returnShop = $(element).find('div.service-item__shop-return > p:not(.label-sp)').text().replace(/（下記参照）| 返却可能店舗/g, '').trim()
      const returnArea = $(element).attr('data-return-area')
      const condition = $(element).find('div.service-item__info__condition > p:not(.label-sp)').text().trim()
      const dateTxt = $(element).find('div.service-item__date > p:not(.label-sp)').text().trim()
      const [startDate, deadDate] = dateTxt
                                    .split('～')
                                    .map(d => {
                                      const match = d.match(DATE_REGEX)
                                      const month = parseInt(match[1], 10)
                                      const day = parseInt(match[2], 10)
                                      return new Date(year, month - 1, day)
                                    })
      const phone = $(element).find('div.service-item__reserve-tel').text().trim()
      if (!date || (startDate <= date && date <= deadDate)) {
        this.result.push({ carName, startShop, returnShop, condition, date: dateTxt, phone, startArea, returnArea })
      }
    })
    console.log(this.result)
  }
}

const s = new CarSearch()
await s.searchCars({ startArea: '5', returnArea: '3', carNames: [], date: new Date(2025, 4, 6)})