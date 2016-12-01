module.exports = {
  concurrency: 3,
  paralell: 3,
  sqsUrl: 'https://sqs.eu-central-1.amazonaws.com/284590800778/Parser',
  lambdaKey: process.env.LAMBDA_KEY
}
