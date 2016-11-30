import { priceCheck } from './priceCheck'
// import { sendMail } from './sendMail' Enable it later
import { SiteProcessor } from './siteProcessor'
import AWS from 'aws-sdk'
import config from './config.js'
import each from 'async/each'
import Promise from 'bluebird'
import Request from 'request-promise'

const QueueUrl = 'https://sqs.eu-central-1.amazonaws.com/284590800778/Parser'
const sqs = new AWS.SQS()
Promise.promisifyAll(Object.getPrototypeOf(sqs))
var shouldProcess = true
var benchmark = 0
const process = (resp) => {
  return new Promise((resolve, reject) => {
    each(resp, function (message, callback) {
      const {data, type} = JSON.parse(message.Body)
      if (type === 'page') {
        SiteProcessor(data)
        .then(() => {
          benchmark++
          return sqs.deleteMessageAsync({
            QueueUrl,
            ReceiptHandle: message.ReceiptHandle
          })
        })
        .then(callback)
      }
      if (type === 'product') {
        priceCheck(data)
        .then(() => {
          benchmark++
          return sqs.deleteMessageAsync({
            QueueUrl,
            ReceiptHandle: message.ReceiptHandle
          })
        })
        .then(callback)
      }
    }, resolve)
  })
}
const getQueue = Promise.coroutine(function * () {
  if (!shouldProcess) return
  const req = {
    QueueUrl: QueueUrl,
    MaxNumberOfMessages: config.concurrency
  }
  try {
    const resp = yield sqs.receiveMessageAsync(req)
    if (!resp.Messages) {
      shouldProcess = false
      return console.log('Empty queue')
    }
    yield process(resp.Messages)
    return getQueue()
  } catch (e) {
    return console.log(e)
  }
})
const timeout = (ms) => {
  return new Promise(resolve => setTimeout(resolve, ms))
}

exports.handler = async function (event, context, callback) {
// const handler = Promise.coroutine(function * (event, context) {
  try {
    getQueue()
    await timeout(250000)
    // await timeout(25000)
    const params = {
      AttributeNames: [
        'ApproximateNumberOfMessages'
      ],
      QueueUrl: QueueUrl
    }
    shouldProcess = false
    let remaining = await sqs.getQueueAttributesAsync(params)
    remaining = remaining.Attributes.ApproximateNumberOfMessages
    console.log('Messages:')
    console.log(remaining)
    if (remaining === '0') {
      // sendMail()
      return
    } else {
      console.log('Restart')
      shouldProcess = true
      benchmarker()
      return restart()
    }
  } catch (e) {
    callback(new Error(e))
  }
}

const benchmarker = () => {
  console.log('Benchmark: ', Math.round(benchmark / 3))
  benchmark = 0
  if (!shouldProcess) return
  setTimeout(benchmarker, 3000)
}
benchmarker()

const restart = () => {
  let options = {
    uri: 'https://mjl05xiv1a.execute-api.eu-central-1.amazonaws.com/prod/shop-parser-production',
    headers: {'x-api-key': '8XGbYeQwSqa5TwanMAJP6QMH1Ix0Yrj6ax5vQoW8'}
  }
  Request(options)
}
