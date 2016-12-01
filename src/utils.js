import * as SiteSchema from './siteSchema'
import Cheerio from 'cheerio'
import Request from 'request-promise'
import AWS from 'aws-sdk'
import config from './config'
import Promise from 'bluebird'
const sqs = new AWS.SQS()
Promise.promisifyAll(Object.getPrototypeOf(sqs))

export const getSite = (domain) => {
  return SiteSchema.findByDomain(domain).then(site => {
    if (!site || !site.enabled) throw new Error(`Not found in database, url: ${domain}`)
    return site
  })
}

export const getBody = async (url) => {
  let options = {
    uri: url,
    resolveWithFullResponse: true,
    time: true
  }
  return Request(options).then(response => {
    if (/^3/.test(response.statusCode) || response.request.uri.href !== url) {
      //addToSqs(response.request.uri.href)
      throw new Error(`Redirected, url: ${url}`)
    } else if (/^[45]/.test(response.statusCode)) {
      throw new Error(`Server error, url: ${url}, code: ${response.statusCode}`)
    }
    return Cheerio.load(response.body)
  })
}

export const isProduct = ($, site) => {
  let selectors = site.productPageSelector
  return selectors.some((selector) => {
    return $(selector).length > 0
  })
}
export const getDiff = (a, b) => {
  return 100 - (a / b * 100)
}
const addToSqs = (url) => {
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

