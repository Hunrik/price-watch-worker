import Promise from 'bluebird'
import dynamoose from 'dynamoose'

/**
 * Site Schema
 */
const ProductSchema = new dynamoose.Schema({
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
}, {timestamps: false})
const Product = dynamoose.model('Product', ProductSchema)
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
export const get = (id) => {
  return this.findById(id)
    .exec()
    .then((site) => {
      if (site) {
        return site
      }
      return Promise.reject()
    })
}
/**
 * Get sites by their domain.
 * @param {string} domain - Domain of the sites.
 * @returns {Promise<Site[]>}
 */
export const findByDomain = (domain) => {
  return new Promise((resolve, reject) => {
    Product.get({domainName: domain})
      .then(resolve)
      .catch(reject)
  })
}
/**
 * Get sites by their type.
 * @param {string} type - Type of the sites.
 * @returns {Promise<Site[]>}
 */
export const findByPID = (domain, pid) => {
  return new Promise((resolve, reject) => {
    Product.get({domainName: domain, productId: pid})
      .then(resolve)
      .catch(reject)
  })
}
/**
 * Get all product pages, optionaly by their domain.
 * @param {string} domain - Domain of the sites.
 * @returns {Promise<Site[]>}
 */
export const findByUrl = (url) => {
  return new Promise((resolve, reject) => {
    Product.get({url: url})
      .then(resolve)
      .catch(reject)
  })
}

/**
 * @typedef Site
 */
export default Product
