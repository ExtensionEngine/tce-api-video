'use strict';

const apiVideo = require('@api.video/nodejs-sdk');

const TTL = 300; // Token time to live: 300s = 5min

function createClient({ apiKey, isSandBox }) {
  return isSandBox
    ? new apiVideo.ClientSandbox({ apiKey })
    : new apiVideo.Client({ apiKey });
}

async function getUploadUrl(client) {
  const baseUrl = client.baseUri;
  const token = await client.tokens.generate(TTL);
  const url = new URL('upload', baseUrl);
  url.searchParams.set('token', token);
  return url.href;
}

module.exports = { createClient, getUploadUrl };
