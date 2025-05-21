import links from '../json/link.json' with { type: 'json' }
import rareCars from '../json/rare-car.json' with { type: 'json' }
import abolishedCars from '../json/abolished-cars.json' with { type: 'json' }

const checkCars = (name) => {
  for (const rareCarName of Object.keys(rareCars)) {
    if (name.replace(/^(.+)\d{3,4}$/, (_m, p) => p).includes(rareCarName)) {
      return {
        color: rareCarName.includes('クラウン') ? '#ffd700' : '#ff0000',
        photo: rareCars[rareCarName],
        icon: rareCarName.includes('クラウン') ? '👑' : '‼️'
      }
    }
  }

  return {
    color: '#36a64f',
    photo: null,
    icon: null
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

const shopListUrlPrefix = "https://cp.toyota.jp/rentacar/shoplist/"

export const createAttachments = (car, type) => {
  const title = type === 'soldOut' ? '売り切れ' : '新着'
  const { area: startAreaName } = extractAreaLink(car.startShop)
  const { area: returnAreaName, link: returnAreaLink } = extractAreaLink(car.returnShop)
  const areaMessage = `${startAreaName}→${returnAreaName}`
  const returnShopCandidateLink = `${shopListUrlPrefix}${returnAreaLink}.html`
  const carData = checkCars(car.carName)
  const imageUrl = type == 'new' ? carData.photo : null
  const pretext = type == 'new' && carData.icon
    ? `${carData.icon}${title}${carData.icon}`
      .concat(abolishedCars.some(name => car.carName.includes(name))? ' 🚫導入終了車🚫' : '')
    : `【${title}】`
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
              value: '090-6388-3536',
              short: false,
          }]
        : []
      )
    ],
    ...(imageUrl ? { image_url: imageUrl } : {})
  }
}