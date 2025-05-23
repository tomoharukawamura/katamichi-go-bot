import links from '../json/link.json' with { type: 'json' }
import rareCars from '../json/rare-car.json' with { type: 'json' }
import abolishedCars from '../json/abolished-cars.json' with { type: 'json' }
import specialIcons from '../json/car-icon.json' with { type: 'json' }
import kanaMap from '../json/kana.json' with { type: 'json' }
import carColors from '../json/car-colors.json' with { type: 'json' }
import { cars } from '../json/toyota-cars.mjs'

const KANA_REGEXP = new RegExp(`(${Object.keys(kanaMap).join('|')})`, 'g')
const CAR_REGEXP = new RegExp(`^(${cars.join('|')}).+?$`)
const COLORRA_SUFFIX_REG = /^(ツーリング|アクシオ|フィールダー)/

const checkCars = (rawName) => {
  const name = rawName
    .replace(' ', '')
    .replace('　', '')
    .replace(KANA_REGEXP, (match) => kanaMap[match])
    .replace(/[Ａ-Ｚａ-ｚ０-９]/g, (str) => String.fromCharCode(str.charCodeAt(0) - 0xFEE0))
    .replace('PHEV', 'PHV')
    .replace('α', 'アルファ')
    .replace(COLORRA_SUFFIX_REG, 'カローラ$1')
    .replace(/^グランドキャビン/, 'ハイエースグランキャビン')
    .replace(CAR_REGEXP, "$1")
  
  console.log(name)
  return rareCars[name]
  ? {
    isAbolished: abolishedCars[name] ?? false,
    icon: specialIcons[name] ?? '‼️',
    photo: rareCars[name],
    color: carColors[name] ?? 'ff0000'
  }
  : {
    isAbolished: abolishedCars[name] ?? false,
    icon: specialIcons[name] ?? null,
    photo: null,
    color: '#36a64f'
  }
}

const extractAreaLink = (shop) => {
  const areaData = Object.entries(links).find(([area]) => shop.includes(area))
  if (!areaData) {
    throw new Error(`Start area not found for shop: ${shop}`)
  }
  const link = areaData[1].split(',')[0]
  const area = shop.includes('成田空港店') ? "成田" : areaData[1].split(',')[1]
  return { link, area }
}

const convertPhoneNumber = (phone) => {
  const phoneNumberWithoutHyphen = phone.replace(/-/g, '')
  if (phoneNumberWithoutHyphen.length == 10) {
    return phoneNumberWithoutHyphen.replace(/^(\d{3})(\d{3})(\d{4})$/, '$1-$2-$3')
  }
  return phone
}

const shopListUrlPrefix = "https://cp.toyota.jp/rentacar/shoplist/"

export const createAttachments = (car, type) => {
  const { area: startAreaName } = extractAreaLink(car.startShop)
  const { area: returnAreaName, link: returnAreaLink } = extractAreaLink(car.returnShop)
  const areaMessage = `${startAreaName}→${returnAreaName}`
  const returnShopCandidateLink = `${shopListUrlPrefix}${returnAreaLink}.html`
  const carData = checkCars(car.carName)
  const title = type === 'soldOut'
                ? '売り切れ' : 
                  carData.icon == '🚀'
                  ? '着弾' : '新着'
  const imageUrl = type == 'new' ? carData.photo : null
  const pretext = (type == 'new' && carData.icon
    ? `${carData.icon}${title}${carData.icon}`
    : `【${title}】`)
    .concat(carData.isAbolished && type == 'new' ? ' 🚫導入終了車🚫' : '')
  const color = type == 'new' ? carData.color : '#d3d3d3'

  return {
    color,
    fallback: pretext,
    pretext,
    fields: [
      {
          title: "区間",
          value: areaMessage,
          short: false
      },
      {
          title: "車両",
          value: car.carName,
          short: false
      },
      {
          title: "出発店舗",
          value: car.startShop,
          short: false
      },
      {
          title: "返却",
          value: car.returnShop.concat(type == 'new' ? `（返却可能店舗は<${returnShopCandidateLink}|こちら>）`: ''),
          short: false
      },
      ...(
        type == 'new'
        ? [{
            title: "車両条件",
            value: car.condition,
            short: false
          },
          {
            title: "貸出期間",
            value: car.date,
            short: false,
          },
          {
              title: '予約電話番号',
              value: convertPhoneNumber(car.phone),
              short: false,
          }]
        : []
      )
    ]
  }
}