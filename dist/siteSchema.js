'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.list = exports.findByDomain = exports.get = undefined;

var _regenerator = require('babel-runtime/regenerator');

var _regenerator2 = _interopRequireDefault(_regenerator);

var _asyncToGenerator2 = require('babel-runtime/helpers/asyncToGenerator');

var _asyncToGenerator3 = _interopRequireDefault(_asyncToGenerator2);

var _bluebird = require('bluebird');

var _bluebird2 = _interopRequireDefault(_bluebird);

var _dynamoose = require('dynamoose');

var _dynamoose2 = _interopRequireDefault(_dynamoose);

var _nodeCache = require('node-cache');

var _nodeCache2 = _interopRequireDefault(_nodeCache);

function _interopRequireDefault(obj) {
  return obj && obj.__esModule ? obj : { default: obj };
}

var cache = new _nodeCache2.default({ stdTTL: 100, checkperiod: 120 });
/**
 * Site Schema
 */
var SiteSchema = new _dynamoose2.default.Schema({
  domainName: {
    type: String,
    required: true,
    unique: true,
    hashKey: true
  },
  sitemap: {
    type: String,
    unique: true
  },
  productPageSelector: {
    type: [String]
    // required: true
  },
  priceSelector: {
    type: [String]
    // required: true
  },
  productNameSelector: {
    type: [String]
  },
  productIdSelector: {
    type: [String]
  },
  enabled: {
    type: Boolean,
    default: true
  },
  addedAt: {
    type: Date,
    default: Date.now
  }
});
var Site = _dynamoose2.default.model('Site', SiteSchema);
/**
 * Add your
 * - pre-save hooks
 * - validations
 * - virtuals
 */

/**
 * Methods
 */
/**
 * Get Site
 * @param {ObjectId} id - The objectId of Site.
 * @returns {Promise<Site, APIError>}
 */
var get = exports.get = function get(id) {
  return undefined.findById(id).exec().then(function (site) {
    if (site) {
      return site;
    }
    return _bluebird2.default.reject();
  });
};
/**
 * Get sites by their domain.
 * @param {string} domain - Domain of the sites.
 * @returns {Promise<Site[]>}
 */
var findByDomain = exports.findByDomain = function findByDomain(domain) {
  return new _bluebird2.default(function () {
    var _ref = (0, _asyncToGenerator3.default)(_regenerator2.default.mark(function _callee(resolve, reject) {
      var cached, site;
      return _regenerator2.default.wrap(function _callee$(_context) {
        while (1) {
          switch (_context.prev = _context.next) {
            case 0:
              _context.prev = 0;
              _context.next = 3;
              return cache.get(domain);

            case 3:
              cached = _context.sent;

              if (!(cached === undefined)) {
                _context.next = 10;
                break;
              }

              _context.next = 7;
              return Site.get({ domainName: domain });

            case 7:
              site = _context.sent;

              cache.set(domain, site);
              return _context.abrupt('return', resolve(site));

            case 10:
              return _context.abrupt('return', resolve(cached));

            case 13:
              _context.prev = 13;
              _context.t0 = _context['catch'](0);
              return _context.abrupt('return', reject(_context.t0));

            case 16:
            case 'end':
              return _context.stop();
          }
        }
      }, _callee, this, [[0, 13]]);
    }));

    return function (_x, _x2) {
      return _ref.apply(this, arguments);
    };
  }());
};
/**
 * List Sites in descending order of 'createdAt' timestamp.
 * @param {number} skip - Number of Sites to be skipped.
 * @param {number} limit - Limit number of Sites to be returned.
 * @returns {Promise<Site[]>}
 */
var list = exports.list = function list() {
  var _ref2 = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {},
      _ref2$skip = _ref2.skip,
      skip = _ref2$skip === undefined ? 0 : _ref2$skip,
      _ref2$limit = _ref2.limit,
      limit = _ref2$limit === undefined ? 50 : _ref2$limit;

  return new _bluebird2.default(function (resolve, reject) {
    Site.scan().limit(limit).startAt(skip).exec().then(resolve).catch(reject);
  });
};

/**
 * @typedef Site
 */
exports.default = Site;