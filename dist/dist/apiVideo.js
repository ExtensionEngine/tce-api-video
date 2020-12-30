'use strict';

const got = require('got');
const httpError = require('http-errors');

const TOKEN_TTL = 300; // time to live in seconds --> 5 minutes

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

class Videos {
  constructor(request) {
    this._request = request;
  }

  async get(id) {
    const { tokenType, accessToken } = await this._request.authenticate();
    return this._request.get(`videos/${id}`, {
      headers: {
        Authorization: [tokenType, accessToken].join(' '),
        Accept: 'application/vnd.api.video+json'
      }
    });
  }

  async create(title) {
    const { tokenType, accessToken } = await this._request.authenticate();
    const Authorization = [tokenType, accessToken].join(' ');
    return this._request.post('videos', {
      headers: {
        Authorization,
        Accept: 'application/json',
        'Content-Type': 'application/json'
      },
      json: {
        title,
        public: false,
        mp4Support: true
      }
    });
  }

  async status(id) {
    const { tokenType, accessToken } = await this._request.authenticate();
    return this._request.get(`videos/${id}/status`, {
      headers: {
        Authorization: [tokenType, accessToken].join(' '),
        Accept: 'application/vnd.api.video+json'
      }
    });
  }

  async getDelegatedToken() {
    const { tokenType, accessToken } = await this._request.authenticate();
    return this._request.post('upload-tokens', {
      headers: {
        Authorization: [tokenType, accessToken].join(' '),
        Accept: 'application/vnd.api.video+json',
        'Content-Type': 'application/json'
      },
      json: {
        ttl: TOKEN_TTL
      }
    });
  }

  async getUploadUrl() {
    const baseUrl = this._request.prefixUrl;
    const { token } = await this.getDelegatedToken();
    const url = new URL('upload', baseUrl);
    url.searchParams.set('token', token);
    return url.href;
  }
}

class Request {
  constructor({ apiKey, baseUrl }) {
    this._apiKey = apiKey;
    this._client = got.extend({
      prefixUrl: baseUrl,
      responseType: 'json'
    });
  }

  get(url, options) {
    return this._client.get(url, options)
      .then(res => res.body)
      .catch(handleError);
  }

  post(url, options) {
    return this._client.post(url, options)
      .then(res => res.body)
      .catch(handleError);
  }

  authenticate() {
    return this.post('auth/api-key', {
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json'
      },
      json: {
        apiKey: this._apiKey
      }
    })
    .then(({ token_type: tokenType, access_token: accessToken }) => ({
      tokenType,
      accessToken
    }));
  }

  get prefixUrl() {
    return this._client.defaults.options.prefixUrl;
  }
}

function handleError(error) {
  const { status, title } = error.response.body;
  return Promise.reject(httpError(status, title));
}

module.exports = { Client, ClientSandbox };
