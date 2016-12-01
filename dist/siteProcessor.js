'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _regenerator = require('babel-runtime/regenerator');

var _regenerator2 = _interopRequireDefault(_regenerator);

var _slicedToArray2 = require('babel-runtime/helpers/slicedToArray');

var _slicedToArray3 = _interopRequireDefault(_slicedToArray2);

var _asyncToGenerator2 = require('babel-runtime/helpers/asyncToGenerator');

var _asyncToGenerator3 = _interopRequireDefault(_asyncToGenerator2);

var _url = require('url');

var _url2 = _interopRequireDefault(_url);

var _diffSchema = require('./diffSchema');

var _diffSchema2 = _interopRequireDefault(_diffSchema);

var _utils = require('./utils');

var _bluebird = require('bluebird');

var _bluebird2 = _interopRequireDefault(_bluebird);

function _interopRequireDefault(obj) {
  return obj && obj.__esModule ? obj : { default: obj };
}

exports.default = function () {
  var _ref = (0, _asyncToGenerator3.default)(_regenerator2.default.mark(function _callee(data) {
    var url, _Promise$all, _Promise$all2, site, $, price, name, _data;

    return _regenerator2.default.wrap(function _callee$(_context) {
      while (1) {
        switch (_context.prev = _context.next) {
          case 0:
            _context.prev = 0;
            url = _url2.default.parse(data);
            _Promise$all = _bluebird2.default.all([(0, _utils.getSite)(url.hostname), (0, _utils.getBody)(url.href)]), _Promise$all2 = (0, _slicedToArray3.default)(_Promise$all, 2), site = _Promise$all2[0], $ = _Promise$all2[1];

            if (!(0, _utils.isProduct)($, site)) {
              _context.next = 13;
              break;
            }

            price = $(site.priceSelector[0]).contents().first().text().replace(/\D/, '').replace(/[^0-9.]+/g, '');
            name = $(site.productNameSelector[0]).contents().first().text().split(/\s/g).filter(function (n) {
              return n;
            }).join(' ');

            if (price) {
              _context.next = 8;
              break;
            }

            throw new Error({ err: 'Price not found', url: url.href });

          case 8:
            if (name) {
              _context.next = 10;
              break;
            }

            throw new Error({ err: 'Product name not found', url: url.href });

          case 10:
            _data = {
              oldPrice: price,
              url: url.href,
              productName: name,
              domainName: url.hostname,
              difference: 0,
              updatedAt: Date.now()
            };
            _context.next = 13;
            return _diffSchema2.default.update({ url: url.href, domainName: url.hostname }, _data);

          case 13:
            return _context.abrupt('return');

          case 16:
            _context.prev = 16;
            _context.t0 = _context['catch'](0);
            throw new Error(_context.t0);

          case 19:
          case 'end':
            return _context.stop();
        }
      }
    }, _callee, undefined, [[0, 16]]);
  }));

  return function (_x) {
    return _ref.apply(this, arguments);
  };
}();