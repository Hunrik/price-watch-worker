import Cheerio from 'cheerio'
import Request from 'request-promise'
import ProductSchema from './productSchema'
import * as SiteSchema from './siteSchema'

export const priceCheck = (data) => {
  return new Promise(async function (resolve, reject) {
    try {
      const site = await SiteSchema.findByDomain(data.domainName)
      if (!site || !site.enabled) {
        console.log('Site not found in mongo')
        return reject({err: 'Not found in mongo'})
      }
      let options = {
        uri: data.url,
        resolveWithFullResponse: true
      }
      const response = await Request(options)
      if (/^3/.test(response.statusCode) || response.request.uri.href !== data.url) {
        return reject({err: 'Redirected'})
      } else if (/^[45]/.test(response.statusCode)) {
        return reject('Server sent error', response.statusCode)
      }
      let $ = Cheerio.load(response.body)
      // const price = $('.offerPrice .newPrice').contents().first().text().replace(/\D/, '')
      const price = $(site.priceSelector[0]).contents().first().text().replace(/\D/, '').replace(/[^0-9.]+/g, '')
      // const name = $('.marketplaceOfferPage .offerTitle').contents().first().text().split(/\s/g).filter((n) => n).join(' ')
      const name = $(site.productNameSelector[0]).contents().first().text().split(/\s/g).filter((n) => n).join(' ')

      if (!price) {
        return reject(`Price not found: ${data.url}`)
      }

      const product = await ProductSchema.get({url: data.url, domainName: data.domainName})
      if (!product) {
        return reject('Product not found')
      }
      if (!product.price) product.price = []
      console.log(product.price.concat([price]))
      // product.productName = name
      const schema = {
        prices: product.price,
        productName: name
      }
      await ProductSchema.update({url: data.url, domainName: data.domainName}, schema)
      // await product.save()
      return resolve()
    } catch (e) {
      console.log(e)
      reject(e)
    }
  })
}
