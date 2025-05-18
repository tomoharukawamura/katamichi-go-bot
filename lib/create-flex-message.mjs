import area from '../json/area.json' with { type: 'json' }
import links from '../json/link.json' with { type: 'json' }
import rareCars from '../json/rare-car.json' with { type: 'json' }

const checkCars = (name) => {
  for (const rareCarName of Object.keys(rareCars)) {
    if (name.includes(rareCarName)) {
      return rareCars[rareCarName]
    }
  }
  return null
}

const shopListUrlPrefix = "https://cp.toyota.jp/rentacar/shoplist/"

export const createMessage = (car, type) => {
  const title = type === 'soldOut' ? '売り切れ' : '新着'
  const start = area[car.startArea]
  const returnArea = area[car.returnArea]
  const message = start === returnArea ? `${start}` : `${start}発${returnArea}行`
  const returnShopCandidateLink = `${shopListUrlPrefix}${links[car.returnShop]}.html`
  const imageUrl = type == 'new' ? checkCars(car.carName) : null
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
    altText: `${title} ${car.carName}`,
    contents: {
      type: 'bubble',
      ...headerContent,
      body: {
        type: 'box',
        layout: 'vertical',
        paddingStart: '10px',
        paddingBottom: '0px',
        paddingTop: imageUrl ? '5px' : '10px',
        contents: [
          {
            type: 'text',
            text: `【${title}】`
          },
          {
            type: 'text',
            text: `---${message}---`,
          },
          {
            type: 'box',
            layout: 'baseline',
            paddingStart: '10px',
            paddingTop: '5px',
            paddingEnd: '10px',
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
            paddingEnd: '10px',
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
            paddingEnd: '10px',
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
            paddingEnd: '10px',
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
            paddingEnd: '10px',
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