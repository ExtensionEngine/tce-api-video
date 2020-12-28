'use strict';

const FormData = require('form-data');
const got = require('got');
const httpError = require('http-errors');

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

  async upload({ title, file }) {
    const { tokenType, accessToken } = await this._request.authenticate();
    const Authorization = [tokenType, accessToken].join(' ');
    const { videoId } = await this._request.post('videos', {
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
    const form = new FormData();
    form.append('file', file, title);
    return this._request.post(`videos/${videoId}/source`, {
      headers: {
        Authorization,
        Accept: 'application/vnd.api.video+json'
      },
      body: form
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
}

function handleError(error) {
  const { status, title } = error.response.body;
  return Promise.reject(httpError(status, title));
}

module.exports = { Client, ClientSandbox };
