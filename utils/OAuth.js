const { Dropbox } = require("dropbox");
const fetch = require("isomorphic-fetch");
const NodeCache = require( "node-cache" );

const config = {
  fetch: fetch,
  clientId: process.env.APP_KEY,
  clientSecret: process.env.APP_SECRET,
};

const dropboxOAuth2 = new Dropbox(config);
const OAuthcache = new NodeCache();

module.exports = {
  dropboxOAuth2,
  OAuthcache
};
