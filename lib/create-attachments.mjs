import links from '../json/link.json' with { type: 'json' }
import rareCars from '../json/rare-car.json' with { type: 'json' }
import abolishedCars from '../json/abolished-cars.json' with { type: 'json' }
import specialIcons from '../json/car-icon.json' with { type: 'json' }
import kanaMap from '../json/kana.json' with { type: 'json' }
import carColors from '../json/car-colors.json' with { type: 'json' }
import cars from '../json/toyota-cars.json' with { type: 'json' }
import shopArea from '../json/shop-area.json' with { type: 'json' }

const KANA_REGEXP = new RegExp(`(${Object.keys(kanaMap).join('|')})`, 'g')
const CAR_REGEXP = new RegExp(`^(${cars.join('|')}).+?$`)
const COLORRA_SUFFIX_REG = /^(ツーリング|アクシオ|フィールダー)/
const HIECE_SUFFIX_REG = /^(グランドキャビン)/

const checkCars = (rawName) => {
  const name = rawName
    .replace(' ', '')
    .replace('　', '')
    .replace(KANA_REGEXP, (match) => kanaMap[match])
    .replace(/[Ａ-Ｚａ-ｚ０-９]/g, (str) => String.fromCharCode(str.charCodeAt(0) - 0xFEE0))
    .replace('PHEV', 'PHV')
    .replace('α', 'アルファ')
    .replace(COLORRA_SUFFIX_REG, 'カローラ$1')
    .replace(HIECE_SUFFIX_REG, 'ハイエース$1')
    .replace(CAR_REGEXP, "$1")
  
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

const extractAreaLink = (shopStr) => {
  const [apartment, shop] = shopStr.split(' ')
  const areaData = links[apartment]
  if (!areaData) {
    throw new Error(`Start area not found for shop: ${shopStr}`)
  }
  const [link, area] = areaData.split(',')
  const detailedArea = shopArea[link]?.[shop] ?? null
  return { link, area: area.concat(detailedArea ? `(${detailedArea})` : '') }
}

const convertPhoneNumber = (phone) => {
  const phoneNumberWithoutHyphen = phone.replace(/-/g, '')
  if (phoneNumberWithoutHyphen.length == 10) {
    return phoneNumberWithoutHyphen.replace(/^(\d{3})(\d{3})(\d{4})$/, '$1-$2-$3')
  }
  return phone
}

const defienTitle = (type, icon) => {
  switch (type) {
    case 'new':
      return icon =='🚀' ? '着弾' : '新着'
    case 'updated':
      return '更新'
    case 'recovered':
      return '蘇生'
    case 'soldOut':
      return '受付終了'
    default:
      throw new Error(`Unknown type: ${type}`)
  }
}

const shopListUrlPrefix = "https://cp.toyota.jp/rentacar/shoplist/"

export const createAttachments = (car) => {
  const { area: startAreaName } = extractAreaLink(car.startShop)
  const { area: returnAreaName, link: returnAreaLink } = extractAreaLink(car.returnShop)
  const areaMessage = `${startAreaName}→${returnAreaName}`
  const returnShopCandidateLink = `${shopListUrlPrefix}${returnAreaLink}.html`
  const carData = checkCars(car.carName)
  const title = defienTitle(car.type, carData.icon)
  const imageUrl = car.type != 'soldOut' ? carData.photo : null
  const pretext = (car.type != 'soldOut' && carData.icon
    ? `${carData.icon}${title}${carData.icon}`
    : `【${title}】`)
    .concat(carData.isAbolished && car.type != 'soldOut' ? ' 🚫導入終了車🚫' : '')
  const color = car.type != 'soldOut' ? carData.color : '#d3d3d3'

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
          value: car.returnShop.concat(car.type != 'soldOut' ? `（返却可能店舗は<${returnShopCandidateLink}|こちら>）`: ''),
          short: false
      },
      ...(
        car.type != 'soldOut'
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