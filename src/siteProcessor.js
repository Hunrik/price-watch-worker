import URL from 'url'
import Product from './diffSchema'
import { getSite, getBody, isProduct } from './utils'
import Promise from 'bluebird'

export default async (data) => {
  try {
    const url = URL.parse(data)
    const [site, $] = await Promise.all([getSite(url.hostname), getBody(url.href)])
    if (isProduct($, site)) {
      const price = $(site.priceSelector[0]).contents().first().text().replace(/\D/, '').replace(/[^0-9.]+/g, '')
      const name = $(site.productNameSelector[0]).contents().first().text().split(/\s/g).filter((n) => n).join(' ')
      if (!price) throw new Error(`Price not found, url: ${url.href}`)
      if (!name) throw new Error(`Product name not found, url: ${url.href}`)
      const data = {
        oldPrice: price,
        productName: name,
        difference: 0,
        updatedAt: Date.now()
      }
      await Product.update({url: url.href, domainName: url.hostname}, data)
    }

      // process.stdout.write((isProductPage ? '+' : '-'))
    return
  } catch (e) {
    return console.error(e)
  }
}

