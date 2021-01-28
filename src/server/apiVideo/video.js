'use strict';

const TOKEN_TTL = 300; // time to live in seconds --> 5 minutes

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
    const headers = {
      Authorization,
      Accept: 'application/json',
      'Content-Type': 'application/json'
    };
    return this._request.post('videos', {
      title,
      public: false,
      mp4Support: true
    }, { headers });
  }

  async getStatus(id) {
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
    const headers = {
      Authorization: [tokenType, accessToken].join(' '),
      Accept: 'application/vnd.api.video+json',
      'Content-Type': 'application/json'
    };
    return this._request.post('upload-tokens', { ttl: TOKEN_TTL }, { headers });
  }

  async getUploadUrl() {
    const baseUrl = this._request.prefixUrl;
    const { token } = await this.getDelegatedToken();
    const url = new URL('upload', baseUrl);
    url.searchParams.set('token', token);
    return url.href;
  }
}

module.exports = Videos;
