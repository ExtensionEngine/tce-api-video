'use strict';

const apiVideo = require('@api.video/nodejs-sdk');

function createClient({ apiKey, isSandBox }) {
  return isSandBox
    ? new apiVideo.ClientSandbox({ apiKey })
    : new apiVideo.Client({ apiKey });
}

async function getUploadUrl(client) {
  const baseUrl = client.baseUri;
  const token = await client.tokens.generate();
  const url = new URL('upload', baseUrl);
  url.searchParams.set('token', token);
  return url.href;
}

module.exports = { createClient, getUploadUrl };
