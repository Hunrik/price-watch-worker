'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.SiteProcessor = undefined;

var _stringify = require('babel-runtime/core-js/json/stringify');

var _stringify2 = _interopRequireDefault(_stringify);

var _regenerator = require('babel-runtime/regenerator');

var _regenerator2 = _interopRequireDefault(_regenerator);

var _asyncToGenerator2 = require('babel-runtime/helpers/asyncToGenerator');

var _asyncToGenerator3 = _interopRequireDefault(_asyncToGenerator2);

var _getPrototypeOf = require('babel-runtime/core-js/object/get-prototype-of');

var _getPrototypeOf2 = _interopRequireDefault(_getPrototypeOf);

var _awsSdk = require('aws-sdk');

var _awsSdk2 = _interopRequireDefault(_awsSdk);

var _url = require('url');

var _url2 = _interopRequireDefault(_url);

var _cheerio = require('cheerio');

var _cheerio2 = _interopRequireDefault(_cheerio);

var _requestPromise = require('request-promise');

var _requestPromise2 = _interopRequireDefault(_requestPromise);

var _productSchema = require('./productSchema');

var Product = _interopRequireWildcard(_productSchema);

var _siteSchema = require('./siteSchema');

var SiteSchema = _interopRequireWildcard(_siteSchema);

var _bluebird = require('bluebird');

var _bluebird2 = _interopRequireDefault(_bluebird);

var _config = require('./config');

var _config2 = _interopRequireDefault(_config);

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var sqs = new _awsSdk2.default.SQS();
_bluebird2.default.promisifyAll((0, _getPrototypeOf2.default)(sqs));
var SiteProcessor = exports.SiteProcessor = function SiteProcessor(data) {
  return new _bluebird2.default(function () {
    var _ref = (0, _asyncToGenerator3.default)(_regenerator2.default.mark(function _callee(resolve, reject) {
      var url, site, options, response, $, isProductPage, pid, _data;

      return _regenerator2.default.wrap(function _callee$(_context) {
        while (1) {
          switch (_context.prev = _context.next) {
            case 0:
              _context.prev = 0;
              url = _url2.default.parse(data);
              _context.next = 4;
              return SiteSchema.findByDomain(url.hostname);

            case 4:
              site = _context.sent;

              if (!(!site || !site.enabled)) {
                _context.next = 8;
                break;
              }

              console.log('Site not found in mongo');
              return _context.abrupt('return', reject({ err: 'Not found in mongo' }));

            case 8:
              options = {
                uri: url.href,
                resolveWithFullResponse: true,
                time: true
              };
              _context.next = 11;
              return (0, _requestPromise2.default)(options);

            case 11:
              response = _context.sent;

              if (!(/^3/.test(response.statusCode) || response.request.uri.href !== url.href)) {
                _context.next = 18;
                break;
              }

              console.log('Redirected from: ', url.href);
              addToSqs(response.request.uri.href);
              return _context.abrupt('return', reject('Redirected'));

            case 18:
              if (!/^[45]/.test(response.statusCode)) {
                _context.next = 20;
                break;
              }

              return _context.abrupt('return', reject('Server sent error', response.statusCode));

            case 20:
              $ = _cheerio2.default.load(response.body);
              isProductPage = isProduct($, site);

              if (!isProductPage) {
                _context.next = 27;
                break;
              }

              pid = getProductId($, site);
              _data = {
                // url: url.href,
                // domainName: url.hostname,
                productId: pid || -1,
                updatedAt: Date.now()
              };
              _context.next = 27;
              return Product.default.update({ url: url.href, domainName: url.hostname }, _data);

            case 27:
              isProductPage ? process.stdout.write('+') : process.stdout.write('-');
              // process.stdout.write((isProductPage ? '+' : '-'))
              return _context.abrupt('return', resolve());

            case 31:
              _context.prev = 31;
              _context.t0 = _context['catch'](0);

              reject(_context.t0);

            case 34:
            case 'end':
              return _context.stop();
          }
        }
      }, _callee, this, [[0, 31]]);
    }));

    return function (_x, _x2) {
      return _ref.apply(this, arguments);
    };
  }());
};

var isProduct = function isProduct($, site) {
  var selectors = site.productPageSelector;
  return selectors.some(function (selector) {
    return $(selector).length > 0;
  });
};
var getProductId = function getProductId($, site) {
  var selectors = site.productIdSelector;
  if (!selectors) return false;
  if (selectors.length === 0) {
    console.log('no Selector');
    return -1;
  }
  var productId = -1;
  selectors.some(function (selector) {
    var elem = $(selector);
    // Exit if not found
    if (elem.length === 0) return false;
    // <input name='something' value='pid' />
    if (elem.get(0).tagName === 'input') {
      productId = elem.val();
      // <a onClick='...pid...'
    } else if (elem.get(0).tagName === 'a') {
      productId = elem.attr('onclick').replace(/\D/g, '');
    }
    return productId;
  });
  return productId;
};
var addToSqs = function addToSqs(url) {
  console.log('Redirected to: ', url);
  var payload = {
    type: 'page',
    data: url
  };
  var sqsData = {
    QueueUrl: _config2.default.sqsUrl,
    MessageBody: (0, _stringify2.default)(payload)
  };
  sqs.sendMessageAsync(sqsData);
};