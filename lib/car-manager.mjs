import * as cheerio from 'cheerio'

export class CarManager {
  constructor() {
    this.url = "https://cp.toyota.jp/rentacar"
    this.html = null
    this.availableCars = []
    this.newCars = []
    this.soldOut = []
  }

  async getCars (config) {
    const response = await fetch(this.url)
    const html = await response.text()
  
    // 変化なし
    if (this.html === html) return

    this.html = html
    const carsList = []
    const $ = cheerio.load(html)
    const avalableCarElems = $('ul#service-items-shop-type-start').find(`li > div.service-item__body:not(.show-entry-end)`)
    avalableCarElems.each((idx, element) => {
      const carName = $(element).find('div.service-item__info__car-type > p:not(.label-sp)').text().trim()
      const startShop = $(element).find('div.service-item__shop-start > p:not(.label-sp)').text().trim().replace(/(.+)（.+?）$/, (_m, p) => p).trim()
      const startArea = $(element).parent().attr('data-start-area')
      const returnShop = $(element).find('div.service-item__shop-return > p:not(.label-sp)').text().replace(/（下記参照）| 返却可能店舗/g, '').trim()
      const returnArea = $(element).parent().attr('data-return-area')
      const condition = $(element).find('div.service-item__info__condition > p:not(.label-sp)').text().trim()
      const date = $(element).find('div.service-item__date > p:not(.label-sp)').text().trim()
      const phone = $(element).find('div.service-item__reserve-tel').text().trim()
      carsList.push({ carName, startShop, returnShop, condition, date, phone, startArea, returnArea })
    })

    if (config.resetNewCars) this.newCars = carsList.filter(car => !this.availableCars.some(c => c.carName == car.carName))
    
    if (config.resetSoldCars) this.soldOut = this.availableCars.filter(car => !carsList.some(c => c.carName == car.carName))  
    
    this.availableCars = carsList
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