'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.priceCheck = undefined;

var _regenerator = require('babel-runtime/regenerator');

var _regenerator2 = _interopRequireDefault(_regenerator);

var _asyncToGenerator2 = require('babel-runtime/helpers/asyncToGenerator');

var _asyncToGenerator3 = _interopRequireDefault(_asyncToGenerator2);

var _promise = require('babel-runtime/core-js/promise');

var _promise2 = _interopRequireDefault(_promise);

var findProduct = function () {
  var _ref2 = (0, _asyncToGenerator3.default)(_regenerator2.default.mark(function _callee2(url, domain, pid) {
    var product;
    return _regenerator2.default.wrap(function _callee2$(_context2) {
      while (1) {
        switch (_context2.prev = _context2.next) {
          case 0:
            _context2.next = 2;
            return Product.findByPID(domain, pid);

          case 2:
            product = _context2.sent;

            if (!(product.length > 0)) {
              _context2.next = 5;
              break;
            }

            return _context2.abrupt('return', product);

          case 5:
            _context2.next = 7;
            return Product.findByURL(url);

          case 7:
            return _context2.abrupt('return', _context2.sent);

          case 8:
          case 'end':
            return _context2.stop();
        }
      }
    }, _callee2, this);
  }));

  return function findProduct(_x3, _x4, _x5) {
    return _ref2.apply(this, arguments);
  };
}();

var _cheerio = require('cheerio');

var _cheerio2 = _interopRequireDefault(_cheerio);

var _requestPromise = require('request-promise');

var _requestPromise2 = _interopRequireDefault(_requestPromise);

var _productSchema = require('./productSchema');

var Product = _interopRequireWildcard(_productSchema);

var _siteSchema = require('./siteSchema');

var SiteSchema = _interopRequireWildcard(_siteSchema);

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var priceCheck = exports.priceCheck = function priceCheck(data) {
  return new _promise2.default(function () {
    var _ref = (0, _asyncToGenerator3.default)(_regenerator2.default.mark(function _callee(resolve, reject) {
      var site, options, response, $, price, name, product, schema;
      return _regenerator2.default.wrap(function _callee$(_context) {
        while (1) {
          switch (_context.prev = _context.next) {
            case 0:
              _context.prev = 0;
              _context.next = 3;
              return SiteSchema.findByDomain(data.domainName);

            case 3:
              site = _context.sent;

              if (!(!site || !site.enabled)) {
                _context.next = 7;
                break;
              }

              console.log('Site not found in mongo');
              return _context.abrupt('return', reject({ err: 'Not found in mongo' }));

            case 7:
              options = {
                uri: data.url,
                resolveWithFullResponse: true
              };
              _context.next = 10;
              return (0, _requestPromise2.default)(options);

            case 10:
              response = _context.sent;

              if (!(/^3/.test(response.statusCode) || response.request.uri.href !== data.url)) {
                _context.next = 15;
                break;
              }

              return _context.abrupt('return', reject({ err: 'Redirected' }));

            case 15:
              if (!/^[45]/.test(response.statusCode)) {
                _context.next = 17;
                break;
              }

              return _context.abrupt('return', reject('Server sent error', response.statusCode));

            case 17:
              $ = _cheerio2.default.load(response.body);
              // const price = $('.offerPrice .newPrice').contents().first().text().replace(/\D/, '')

              price = $(site.priceSelector[0]).contents().first().text().replace(/\D/, '').replace(/[^0-9\.]+/g, '');
              // const name = $('.marketplaceOfferPage .offerTitle').contents().first().text().split(/\s/g).filter((n) => n).join(' ')

              name = $(site.productNameSelector[0]).contents().first().text().split(/\s/g).filter(function (n) {
                return n;
              }).join(' ');

              if (price) {
                _context.next = 22;
                break;
              }

              return _context.abrupt('return', reject('Price not found: ' + data.url));

            case 22:
              _context.next = 24;
              return Product.default.get({ url: data.url, domainName: data.domainName });

            case 24:
              product = _context.sent;

              if (product) {
                _context.next = 27;
                break;
              }

              return _context.abrupt('return', reject('Product not found'));

            case 27:
              if (!product.price) product.price = [];
              console.log(product.price.concat([price]));
              //product.productName = name
              schema = {
                prices: product.price,
                productName: name
              };
              _context.next = 32;
              return Product.default.update({ url: data.url, domainName: data.domainName }, schema);

            case 32:
              return _context.abrupt('return', resolve());

            case 35:
              _context.prev = 35;
              _context.t0 = _context['catch'](0);

              console.log(_context.t0);
              reject(_context.t0);

            case 39:
            case 'end':
              return _context.stop();
          }
        }
      }, _callee, this, [[0, 35]]);
    }));

    return function (_x, _x2) {
      return _ref.apply(this, arguments);
    };
  }());
};