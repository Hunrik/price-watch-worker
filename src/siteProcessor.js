import AWS from 'aws-sdk'
import URL from 'url'
import Cheerio from 'cheerio'
import Request from 'request-promise'
import * as Product from './productSchema'
import * as SiteSchema from './siteSchema'
import Promise from 'bluebird'
import config from './config'

const sqs = new AWS.SQS()
Promise.promisifyAll(Object.getPrototypeOf(sqs))
export const SiteProcessor = (data) => {
  return new Promise(async function (resolve, reject) {
    try {
      const url = URL.parse(data)
      const site = await SiteSchema.findByDomain(url.hostname)
      if (!site || !site.enabled) {
        console.log('Site not found in mongo')
        return reject({err: 'Not found in mongo'})
      }
      let options = {
        uri: url.href,
        resolveWithFullResponse: true,
        time: true
      }
      const response = await Request(options)
      if (/^3/.test(response.statusCode) || response.request.uri.href !== url.href) {
        console.log('Redirected from: ', url.href)
        addToSqs(response.request.uri.href)
        return reject('Redirected')
      } else if (/^[45]/.test(response.statusCode)) {
        return reject('Server sent error', response.statusCode)
      }
      let $ = Cheerio.load(response.body)
      let isProductPage = isProduct($, site)
      if (isProductPage) {
        let pid = getProductId($, site)
        const data = {
          // url: url.href,
          // domainName: url.hostname,
          productId: pid || -1,
          updatedAt: Date.now()
        }
        await Product.default.update({url: url.href, domainName: url.hostname}, data)
      }
      (isProductPage ? process.stdout.write('+') : process.stdout.write('-'))
      // process.stdout.write((isProductPage ? '+' : '-'))
      return resolve()
    } catch (e) {
      reject(e)
    } })
}

const isProduct = ($, site) => {
  let selectors = site.productPageSelector
  return selectors.some((selector) => {
    return $(selector).length > 0
  })
}
const getProductId = ($, site) => {
  const selectors = site.productIdSelector
  if (!selectors) return false
  if (selectors.length === 0) {
    console.log('no Selector')
    return -1
  }
  var productId = -1
  selectors.some((selector) => {
    const elem = $(selector)
    // Exit if not found
    if (elem.length === 0) return false
    // <input name='something' value='pid' />
    if (elem.get(0).tagName === 'input') {
      productId = elem.val()
    // <a onClick='...pid...'
    } else if (elem.get(0).tagName === 'a') {
      productId = elem.attr('onclick').replace(/\D/g, '')
    }
    return productId
  })
  return productId
}
const addToSqs = (url) => {
  console.log('Redirected to: ', url)
  const payload = {
    type: 'page',
    data: url
  }
  const sqsData = {
    QueueUrl: config.sqsUrl,
    MessageBody: JSON.stringify(payload)
  }
  sqs.sendMessageAsync(sqsData)
}

