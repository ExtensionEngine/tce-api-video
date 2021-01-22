'use strict';

const Request = require('./request');
const Videos = require('./video');

const SANDBOX_URL = 'https://sandbox.api.video';
const PRODUCTION_URL = 'https://ws.api.video';

function createClient({ isSandBox, apiKey }) {
  const baseUrl = isSandBox ? SANDBOX_URL : PRODUCTION_URL;
  return clientFactory({ baseUrl, apiKey });
}

function clientFactory({ baseUrl, apiKey }) {
  if (!apiKey) throw new Error('Video Api Key is required');
  const request = new Request({ apiKey, baseUrl });
  return { videos: new Videos(request) };
}

module.exports = { createClient };
