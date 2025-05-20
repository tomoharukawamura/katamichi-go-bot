import links from '../json/link.json' with { type: 'json' }
import rareCars from '../json/rare-car.json' with { type: 'json' }
import abolishedCars from '../json/abolished-cars.json' with { type: 'json' }

const checkCars = (name) => {
  for (const rareCarName of Object.keys(rareCars)) {
    if (name.replace(/^(.+)\d{3,4}$/, (_m, p) => p).includes(rareCarName)) {
      return {
        photo: rareCars[rareCarName],
        icon: rareCarName.includes('クラウン') ? '👑' : '‼️'
      }
    }
  }

  return {
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
  if (!link) {
    throw new Error(`Link not found for area: ${area}`)
  }
  return { link, area }
}

const shopListUrlPrefix = "https://cp.toyota.jp/rentacar/shoplist/"

export const createMessage = (car, type) => {
  const title = type === 'soldOut' ? '売り切れ' : '新着'
  const { area: startAreaName } = extractAreaLink(car.startShop)
  const { area: returnAreaName, link: returnAreaLink } = extractAreaLink(car.returnShop)
  const areaMessage = `${startAreaName}→${returnAreaName}`
  const returnShopCandidateLink = `${shopListUrlPrefix}${returnAreaLink}.html`
  const rareCarData = checkCars(car.carName)
  const imageUrl = type == 'new' ? rareCarData.photo : null
  const titleMsg = type == 'new' && rareCarData.icon
    ? `${rareCarData.icon}${title}${rareCarData.icon}`
    : `【${title}】`
  const headerContent = imageUrl ? {
    header: {
      type: 'box',
      layout: 'vertical',
      paddingAll: '0px',
      contents: [
        {
          type: 'image',
          url: imageUrl,
          size: 'full',
          aspectMode: 'cover',
          aspectRatio: '1.91:1',
        }
      ]
    }
  }: {}
  return {
    type: 'flex',
    altText: titleMsg.concat(type == 'new' && abolishedCars.some(name => car.carName.includes(name)) ? '　🚫生産終了🚫' : ''),
    contents: {
      type: 'bubble',
      ...(imageUrl ? {
        header: {
          type: 'box',
          layout: 'vertical',
          paddingAll: '0px',
          contents: [
            {
              type: 'image',
              url: imageUrl,
              size: 'full',
              aspectMode: 'cover',
              aspectRatio: '1.91:1',
            }
          ]
        }
      }: {}),
      body: {
        type: 'box',
        layout: 'vertical',
        paddingStart: '10px',
        paddingEnd: '10px',
        paddingBottom: '0px',
        paddingTop: "10px",
        contents: [
          {
            type: 'text',
            text: titleMsg.concat(type == 'new' && abolishedCars.some(name => car.carName.includes(name)) ? '\n🚫生産終了🚫' : ''),
            wrap: true,
          },
          ...(type == 'new' ? [{
            type: 'box',
            layout: 'horizontal',
            paddingTop: '5px',
            contents: [
              {
                type: 'text',
                text: areaMessage,
                align: 'start',
                weight: 'bold',
                size: 'xl'
              }
            ]
          }]: []),
          {
            type: 'box',
            layout: 'baseline',
            paddingStart: '10px',
            paddingTop: '5px',
            paddingEnd: '5px',
            contents: [
              {
                type: 'text',
                text: '車両',
                wrap: true,
                flex: 1,
              },
              {
                type: 'text',
                text: `${car.carName}`,
                wrap: true,
                flex: 2,
              }
            ]
          },
          {
            type: 'box',
            layout: 'baseline',
            paddingStart: '10px',
            paddingTop: '5px',
            paddingEnd: '5px',
            contents: [
              {
                type: 'text',
                text: '出発店舗',
                wrap: true,
                flex: 1,
              },
              {
                type: 'text',
                text: `${car.startShop}`,
                wrap: true,
                flex: 2,
              }
            ]
          },
          {
            type: 'box',
            layout: 'baseline',
            paddingStart: '10px',
            paddingTop: '5px',
            paddingEnd: '5px',
            contents: [
              {
                type: 'text',
                text: '返却',
                wrap: true,
                flex: 1,
              },
              {
                type: 'text',
                text: `${car.returnShop}`,
                wrap: true,
                flex: 2,
              }
            ]
          },
          {
            type: 'box',
            layout: 'baseline',
            paddingStart: '10px',
            paddingTop: '5px',
            paddingEnd: '5px',
            contents: [
              {
                type: 'text',
                text: '車両条件',
                wrap: true,
                flex: 1,
              },
              {
                type: 'text',
                text: `${car.condition}`,
                wrap: true,
                flex: 2,
              }
            ]
          },
          {
            type: 'box',
            layout: 'baseline',
            paddingStart: '10px',
            paddingTop: '5px',
            paddingEnd: '5px',
            paddingBottom: '5px',
            contents: [
              {
                type: 'text',
                text: '貸出期間',
                wrap: true,
                flex: 1,
              },
              {
                type: 'text',
                text: `${car.date}`,
                wrap: true,
                flex: 2
              }
            ]
          }
        ].concat(
          type == 'new' ? [{
            type: "button",
            style: 'primary',
            height: 'sm',
            action: {
              type: "uri",
              label: "予約する",
              uri: `tel:${car.phone}`
            }
          },
          {
            type: "button",
            style: 'link',
            action: {
              type: "uri",
              label: "返却可能店舗一覧",
              uri: returnShopCandidateLink
            }
          }] : []
        )
      }
    }
  }
}