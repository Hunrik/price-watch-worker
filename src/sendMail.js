var api_key = 'key-5beeb170bb6896eba3a43c43188f6929'
var domain = 'sandboxccd9855edd8945a1b7c7f29cd65d5b27.mailgun.org'
var mailgun = require('mailgun-js')({apiKey: api_key, domain: domain})

var data = {
  from: 'Excited User <me@samples.mailgun.org>',
  to: 'henry.seres@gmail.com',
  subject: 'Hello',
  text: 'Testing some Mailgun awesomness!'
}

export const sendMail = () => {
  mailgun.messages().send(data, function (error, body) {
      console.log(body)
    })
}
