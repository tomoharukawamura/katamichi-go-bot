import * as cheerio from 'cheerio'
import area from '../json/link.json' with { type: 'json' }
import * as fs from 'fs'
import { resolve } from 'path'

const shopPageLinkPrefix = 'https://cp.toyota.jp/rentacar/shoplist/'

const json = new Object()
const exec = async (area) => {
  const res = await fetch(`${shopPageLinkPrefix}${area}.html`)
  const html = await res.text()
  const $ = cheerio.load(html)
  const areaData = new Object()
  $('div.inner').find('li.shop').each((_, elem) => {
    const shopName = $(elem).find('div.shop__name > p.val').text().trim()
    const shopAddress = $(elem).find('div.shop__address > p.val').text().trim()
    const shopPhone = $(elem).find('div.shop__tel-pc > p.val').text().trim()
    const shopOpenTime = []
    $(elem).find('div.shop__time > div.vals > .val').each((_, val) => {
      shopOpenTime.push(`${$(val).find('span').first().text().trim().replace('-', '〜')}　${$(val).find('span').last().text().trim().replace('-', '〜')}`)
    })
    areaData[shopName] = {
      address: shopAddress,
      phone: shopPhone,
      openTime: shopOpenTime,
    }
  })
  json[area] = areaData 
}

for (const k of Object.keys(area)) {
  const areaLink = area[k].split(',')[0]
  await exec(areaLink == 'oita' ? 'ooita' : areaLink)
}

fs.writeFileSync(
  resolve(import.meta.filename, '../../json/shop-data.json'),
  JSON.stringify(json, null, 2),
  'utf8'
)