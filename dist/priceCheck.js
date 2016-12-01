'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _regenerator = require('babel-runtime/regenerator');

var _regenerator2 = _interopRequireDefault(_regenerator);

var _promise = require('babel-runtime/core-js/promise');

var _promise2 = _interopRequireDefault(_promise);

var _slicedToArray2 = require('babel-runtime/helpers/slicedToArray');

var _slicedToArray3 = _interopRequireDefault(_slicedToArray2);

var _asyncToGenerator2 = require('babel-runtime/helpers/asyncToGenerator');

var _asyncToGenerator3 = _interopRequireDefault(_asyncToGenerator2);

var _utils = require('./utils');

var _diffSchema = require('./diffSchema');

var _diffSchema2 = _interopRequireDefault(_diffSchema);

function _interopRequireDefault(obj) {
  return obj && obj.__esModule ? obj : { default: obj };
}

exports.default = function () {
  var _ref = (0, _asyncToGenerator3.default)(_regenerator2.default.mark(function _callee(data) {
    var site, _ref2, _ref3, $, product, price, name;

    return _regenerator2.default.wrap(function _callee$(_context) {
      while (1) {
        switch (_context.prev = _context.next) {
          case 0:
            _context.prev = 0;
            _context.next = 3;
            return (0, _utils.getSite)(data.domainName);

          case 3:
            site = _context.sent;
            _context.next = 6;
            return _promise2.default.all([(0, _utils.getBody)(data.url), _diffSchema2.default.get({ url: data.url, domainName: data.domainName })]);

          case 6:
            _ref2 = _context.sent;
            _ref3 = (0, _slicedToArray3.default)(_ref2, 2);
            $ = _ref3[0];
            product = _ref3[1];

            // const price = $('.offerPrice .newPrice').contents().first().text().replace(/\D/, '')
            price = $(site.priceSelector[0]).contents().first().text().replace(/\D/, '').replace(/[^0-9.]+/g, '');
            // const name = $('.marketplaceOfferPage .offerTitle').contents().first().text().split(/\s/g).filter((n) => n).join(' ')

            name = $(site.productNameSelector[0]).contents().first().text().split(/\s/g).filter(function (n) {
              return n;
            }).join(' ');

            if (price) {
              _context.next = 14;
              break;
            }

            throw new Error({ err: 'Price not found', url: data.url });

          case 14:
            if (product) {
              _context.next = 16;
              break;
            }

            throw new Error({ err: 'Product not found', url: data.url });

          case 16:

            product.productName = name;
            product.oldPrice = price === product.newPrice ? product.oldPrice : product.newPrice;
            product.newPrice = price;
            product.difference = price === product.newPrice ? product.difference : (0, _utils.getDiff)(product.oldPrice, price);
            product.updatedAt = Date.now();
            _context.next = 23;
            return product.save();

          case 23:
            return _context.abrupt('return', true);

          case 26:
            _context.prev = 26;
            _context.t0 = _context['catch'](0);
            throw new Error(_context.t0);

          case 29:
          case 'end':
            return _context.stop();
        }
      }
    }, _callee, undefined, [[0, 26]]);
  }));

  return function (_x) {
    return _ref.apply(this, arguments);
  };
}();