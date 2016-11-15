import { priceCheck } from './priceCheck'
import { sendMail } from './sendMail'
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
const getQueue = async function () {
  if (!shouldProcess) return
  const req = {
    QueueUrl: QueueUrl,
    MaxNumberOfMessages: config.concurrency
  }
  try {
    const resp = await sqs.receiveMessageAsync(req)
    if (!resp.Messages) {
      shouldProcess = false
      return console.log('Empty queue')
    }
    await process(resp.Messages)
    return getQueue()
  } catch (e) {
    console.log(e)
    return getQueue()
  }
}

const benchmarker = () => {
  console.log('Benchmark: ', Math.round(benchmark / 10))
  benchmark = 0
  if (!shouldProcess) return
  setTimeout(benchmarker, 10000)
}
benchmarker()
