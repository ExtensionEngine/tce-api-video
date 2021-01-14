'use strict';

const Request = require('./request');
const Videos = require('./video');

class BaseClient {
  constructor({ apiKey, baseUrl }) {
    if (!apiKey) throw new Error('Video Api Key is required');
    const request = new Request({ apiKey, baseUrl });
    this.videos = new Videos(request);
  }
}

class Client extends BaseClient {
  constructor({ apiKey }) {
    const baseUrl = 'https://ws.api.video';
    super({ apiKey, baseUrl });
  }
}

class ClientSandbox extends BaseClient {
  constructor({ apiKey }) {
    const baseUrl = 'https://sandbox.api.video';
    super({ apiKey, baseUrl });
  }
}

module.exports = { Client, ClientSandbox };
