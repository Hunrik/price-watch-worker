import { getSite, getBody, getDiff } from './utils'
import Product from './diffSchema'
export default async (data) => {
  try {
    const site = await getSite(data.domainName)
    const [$, product] = await Promise.all([ getBody(data.url), Product.get({url: data.url, domainName: data.domainName}) ])
      // const price = $('.offerPrice .newPrice').contents().first().text().replace(/\D/, '')
    const price = $(site.priceSelector[0]).contents().first().text().replace(/\D/, '').replace(/[^0-9.]+/g, '')
      // const name = $('.marketplaceOfferPage .offerTitle').contents().first().text().split(/\s/g).filter((n) => n).join(' ')
    const name = $(site.productNameSelector[0]).contents().first().text().split(/\s/g).filter((n) => n).join(' ')

    if (!price) throw new Error(`Price not found,  url: ${data.url}`)
    if (!product) throw new Error(`Product not found, url: ${data.url}`)

    product.productName = name
    product.oldPrice = price === product.newPrice ? product.oldPrice : product.newPrice
    product.newPrice = price
    product.difference = price === product.newPrice ? product.difference : getDiff(product.oldPrice, price)
    product.updatedAt = Date.now()
    await product.save()

    return true
  } catch (e) {
    return console.log(e)
    //return console.error(e.message)
  }
}
