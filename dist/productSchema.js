'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.findByUrl = exports.findByPID = exports.findByDomain = exports.get = undefined;

var _bluebird = require('bluebird');

var _bluebird2 = _interopRequireDefault(_bluebird);

var _dynamoose = require('dynamoose');

var _dynamoose2 = _interopRequireDefault(_dynamoose);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/**
 * Site Schema
 */
var ProductSchema = new _dynamoose2.default.Schema({
  url: {
    type: String,
    required: true,
    rangeKey: true
  },
  domainName: {
    type: String,
    required: true,
    hashKey: true
  },
  productId: {
    type: Number
  },
  productName: {
    type: String
  },
  price: {
    type: Array
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
}, { timestamps: false });
var Product = _dynamoose2.default.model('Product', ProductSchema);
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
 * Statics
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
  return new _bluebird2.default(function (resolve, reject) {
    Product.get({ domainName: domain }).then(resolve).catch(reject);
  });
};
/**
 * Get sites by their type.
 * @param {string} type - Type of the sites.
 * @returns {Promise<Site[]>}
 */
var findByPID = exports.findByPID = function findByPID(domain, pid) {
  return new _bluebird2.default(function (resolve, reject) {
    Product.get({ domainName: domain, productId: pid }).then(resolve).catch(reject);
  });
};
/**
 * Get all product pages, optionaly by their domain.
 * @param {string} domain - Domain of the sites.
 * @returns {Promise<Site[]>}
 */
var findByUrl = exports.findByUrl = function findByUrl(url) {
  return new _bluebird2.default(function (resolve, reject) {
    Product.get({ url: url }).then(resolve).catch(reject);
  });
};

/**
 * @typedef Site
 */
exports.default = Product;