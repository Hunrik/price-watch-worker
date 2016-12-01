import priceCheck from './priceCheck'
// import { sendMail } from './sendMail' Enable it later
import SiteProcessor from './siteProcessor'
import AWS from 'aws-sdk'
import config from './config.js'
import each from 'async/each'
import Promise from 'bluebird'
import Request from 'request-promise'
console.log(`MONITORING|${Date.now()}|1|count|price-watch.worker.started|`)
if (!config.lambdaKey) console.error('Lambda key is not set')
const sqs = new AWS.SQS()
Promise.promisifyAll(Object.getPrototypeOf(sqs))
var shouldProcess = true
let benchmark = 0
const process = (resp) => {
  return new Promise((resolve, reject) => {
    each(resp, function (message, callback) {
      const {data, type} = JSON.parse(message.Body)
      if (type === 'page') {
        SiteProcessor(data)
        .then(() => {
          benchmark++
          return sqs.deleteMessageAsync({
            QueueUrl: config.sqsUrl,
            ReceiptHandle: message.ReceiptHandle
          })
        })
        .then(callback).catch(console.error)
      }
      if (type === 'product') {
        priceCheck(data)
        .then(() => {
          benchmark++
          return sqs.deleteMessageAsync({
            QueueUrl: config.sqsUrl,
            ReceiptHandle: message.ReceiptHandle
          })
        })
        .then(callback).catch(console.error)
      }
    }, resolve)
  })
}
const getQueue = Promise.coroutine(function *() {
  if (!shouldProcess) return
  const req = {
    QueueUrl: config.sqsUrl,
    MaxNumberOfMessages: config.concurrency
  }
  try {
    const resp = yield sqs.receiveMessageAsync(req)
    if (!resp.Messages) {
      shouldProcess = false
      return console.log('Queue emptied')
    }
    yield process(resp.Messages)
    return getQueue()
  } catch (e) {
    console.error(e)
    return getQueue()
  }
})

const queueCheck = () => {
  const params = {
    AttributeNames: [
      'ApproximateNumberOfMessages'
    ],
    QueueUrl: config.sqsUrl
  }
  return sqs.getQueueAttributesAsync(params).then(remaining => {
    return remaining.Attributes.ApproximateNumberOfMessages
  })
}
exports.start = async (event, context, callback) => {
  try {
    for (let i = 0; i < config.paralell; i++) {
      getQueue()
    }
    setTimeout(restart, 250 * 1000)
    while (await queueCheck() > 0) {
      await Promise.delay(10 * 1000)
      console.log(`MONITORING|${Date.now()}|${benchmark / 10}|count|price-watch.worker.processed|`)
      benchmark = 0
    }
    shouldProcess = false
    return callback()
  } catch (e) {
    console.error(e)
    callback(e)
  }
}

const restart = async () => {
  if (!shouldProcess || await queueCheck() === 0) return
  let options = {
    uri: 'https://mjl05xiv1a.execute-api.eu-central-1.amazonaws.com/prod/',
    headers: {'x-api-key': config.lambdaKey}
  }
  Request(options)
}
