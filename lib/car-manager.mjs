import * as cheerio from 'cheerio'

export class CarManager {
  constructor() {
    this.url = "https://cp.toyota.jp/rentacar"
    this.html = null
    this.availableCars = new Map()
    this.notAvailableCars = new Map()
    this.newCars = []
    this.soldOut = []
  }

  async getCars (config) {
    const response = await fetch(this.url)
    const html = await response.text()
  
    // 変化なし
    if (this.html === html) return
    this.html = html
    const $ = cheerio.load(html)
    const allCarElems = $('ul#service-items-shop-type-start').find(`li > div.service-item__body`)
    allCarElems.each((idx, element) => {
      const carName = $(element).find('div.service-item__info__car-type > p:not(.label-sp)').text().trim()
      const startShop = $(element).find('div.service-item__shop-start > p:not(.label-sp)').text().trim().replace(/(.+)（.+?）$/, (_m, p) => p).trim()
      const startArea = $(element).parent().attr('data-start-area')
      const returnShop = $(element).find('div.service-item__shop-return > p:not(.label-sp)').text().replace(/（下記参照）| 返却可能店舗/g, '').trim()
      const returnArea = $(element).parent().attr('data-return-area')
      const condition = $(element).find('div.service-item__info__condition > p:not(.label-sp)').text().trim()
      const date = $(element).find('div.service-item__date > p:not(.label-sp)').text().trim()
      const phone = $(element).find('div.service-item__reserve-tel').text().trim()
      const carData = { carName, startShop, returnShop, condition, date, phone, startArea, returnArea }
      if (config.isInit) {
        if ($(element).hasClass('show-entry-end')) {
          this.notAvailableCars.set(carName, carData)
        } else {
          this.availableCars.set(carName, carData)
        }
      } else {
        if ($(element).hasClass('show-entry-end')
            && !this.notAvailableCars.has(carName)
            && this.availableCars.delete(carName)
          ){
          this.notAvailableCars.set(carName, carData)
          this.soldOut.push({ ...carData, type: 'soldOut' })
        } else if (!$(element).hasClass('show-entry-end') && !this.availableCars.has(carName)) {
          this.availableCars.set(carName, carData)
          this.newCars.push({ ...carData, type: this.notAvailableCars.delete(carName) ? 'recovered' : 'new' })
        } else if (!$(element).hasClass('show-entry-end') && JSON.stringify(this.availableCars.get(carName)) != JSON.stringify(carData)) {
          this.availableCars.set(carName, carData)
          this.newCars.push({ ...carData, type: 'updated' })
        }

      }
    })
  }

  classifyCars (cars) {
    return cars.reduce((acc, car) => {
      const startArea = car.startArea
      const returnArea = car.returnArea
      const matchedConditionData = acc.find(item => item.startArea == startArea && item.returnArea == returnArea)
      const otherData = acc.filter(item => item.startArea != startArea || item.returnArea != returnArea)
      return matchedConditionData
        ? [...otherData, { ...matchedConditionData, cars: [...matchedConditionData.cars, car] }]
        : [...otherData, { startArea, returnArea, cars: [car] }]
    }, [])
  }
}