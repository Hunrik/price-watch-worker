import Request from 'request-promise'
import Cheerio from 'cheerio'

var URLs = ['https://ipon.hu']
var visited = []
const regex = new RegExp('^(http|https)://')

const isInArray = (url) => {
  return URLs.indexOf(url) !== -1
}
const parseURL = (html) => {
  let $ = Cheerio.load(html)
  $('a').map((index, param) => {
    let url = param.attribs.href

    if(url.match(regex)) return 

    url = 'https://ipon.hu' + url
    if (isInArray(url)) return
    return URLs.push(url)
  })
}

async function visitURL() {
  let url = URLs.shift()
  try {
    let html = await Request(url)
    parseURL(html)
    visited.push(url)
  } catch (err) {
    console.log(err)
  }
}

while( URLs.length > 0 ) {
  visitURL()
  console.log('Remaining: ' + URLs.length + ' Visited: ' + visited.length)
}