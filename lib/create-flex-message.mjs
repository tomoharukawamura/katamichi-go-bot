import area from '../json/area.json' with { type: 'json' }
import links from '../json/link.json' with { type: 'json' }
import rareCars from '../json/rare-car.json' with { type: 'json' }

const checkCars = (name) => {
  for (const rareCarName of Object.keys(rareCars)) {
    if (name.includes(rareCarName)) {
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

const shopListUrlPrefix = "https://cp.toyota.jp/rentacar/shoplist/"

export const createMessage = (car, type) => {
  const title = type === 'soldOut' ? '売り切れ' : '新着'
  const start = area[car.startArea]
  const returnArea = area[car.returnArea]
  const message = start === returnArea ? `${start}` : `${start}→${returnArea}`
  const returnShopCandidateLink = `${shopListUrlPrefix}${links[car.returnShop]}.html`
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
    altText: `${titleMsg}`,
    contents: {
      type: 'bubble',
      ...headerContent,
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
            text: titleMsg
          },
          {
            type: 'box',
            layout: 'horizontal',
            contents: [
              {
                type: 'text',
                text: message,
                align: 'start',
                weight: 'bold',
                size: 'xl'
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