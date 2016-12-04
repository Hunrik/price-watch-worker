/* global describe, it, before */
import chai from 'chai'
import chaiAsPromised from 'chai-as-promised'

import Site, * as SiteSchema from '../siteSchema'
chai.use(chaiAsPromised)
const expect = chai.expect
let site
describe('Get site', () => {
  before(async () => {
    const resp = await Site.scan().limit(1).exec()
    site = resp.pop()
  })
  it('Should return a valid site', () => {
    expect(site).to.be.an('object')
    expect(site).to.have.property('domainName')
    expect(site).to.have.property('sitemap')
  })
  it('Selectors should be in an array', () => {
    expect(site.productPageSelector).to.be.an('array')
    expect(site.priceSelector).to.be.an('array')
    expect(site.productNameSelector).to.be.an('array')
    expect(site.productIdSelector).to.be.an('array')
  })
  it('Enabled property should be a boolean', () => {
    expect(site.enabled).to.exist
    expect(site.enabled).to.be.a('boolean')
  })
})
describe('Site schema functions', () => {
  let sites
  before(async () => {
    sites = await Site.scan().limit(2).exec()
    expect(sites.length).to.be.equal(2)
  })
  it('Should find both site', async () => {
    const siteA = await Site.get({domainName: sites[0].domainName})
    expect(siteA).to.be.an('object')
    expect(sites[0].domainName).to.be.equal(siteA.domainName)
    expect(sites[0].siteMap).to.be.equal(siteA.siteMap)

    const siteB = await Site.get({domainName: sites[1].domainName})
    expect(siteB).to.be.an('object')
    expect(sites[1].domainName).to.be.equal(siteB.domainName)
    expect(sites[1].siteMap).to.be.equal(siteB.siteMap)
  })
  it('Caching should return different sites', async () => {
    const siteA = await SiteSchema.findByDomain(sites[0].domainName)
    const siteB = await SiteSchema.findByDomain(sites[1].domainName)
    expect(siteA.domainName).to.not.be.equal(siteB.domainName)
    expect(siteA.sitemap).to.not.be.equal(siteB.sitemap)
  })
})
