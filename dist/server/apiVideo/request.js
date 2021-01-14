'use strict';

const axios = require('axios');
const httpError = require('http-errors');

class Request {
  constructor({ apiKey, baseUrl }) {
    this._apiKey = apiKey;
    this._client = axios.create({
      baseURL: baseUrl
    });
  }

  get(url, options) {
    return this._client.get(url, options)
      .then(resFormatter)
      .catch(handleError);
  }

  post(url, data, options) {
    return this._client.post(url, data, options)
      .then(resFormatter)
      .catch(handleError);
  }

  authenticate() {
    const headers = {
      Accept: 'application/json',
      'Content-Type': 'application/json'
    };
    return this.post('auth/api-key', { apiKey: this._apiKey }, { headers })
      .then(({ token_type: tokenType, access_token: accessToken }) => ({
        tokenType,
        accessToken
      }));
  }

  get prefixUrl() {
    return this._client.defaults.baseURL;
  }
}

const resFormatter = res => res.data;

function handleError(error) {
  const { status, title } = error.response.data;
  return Promise.reject(httpError(status, title));
}

module.exports = Request;
