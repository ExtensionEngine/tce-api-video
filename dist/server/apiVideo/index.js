'use strict';

const Request = require('./request');
const Videos = require('./video');

function createClient({ apiKey }) {
  const baseUrl = 'https://ws.api.video';
  return clientFactory({ baseUrl, apiKey });
}

function createSandBoxClient({ apiKey }) {
  const baseUrl = 'https://sandbox.api.video';
  return clientFactory({ baseUrl, apiKey });
}

function clientFactory({ baseUrl, apiKey }) {
  if (!apiKey) throw new Error('Video Api Key is required');
  const request = new Request({ apiKey, baseUrl });
  return { videos: new Videos(request) };
}

module.exports = { createClient, createSandBoxClient };
