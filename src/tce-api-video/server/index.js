'use strict';

const { ClientSandbox } = require('./apiVideo');
const info = require('../info');

// process.env approach should be replaced with a more efficient way of accessing env variables!
const client = new ClientSandbox({ apiKey: process.env.API_VIDEO_API_KEY });

function beforeSave(asset, { config, storage, storageProxy }) {
  const { dataUrl: video, fileName: title } = asset.data;
  const base64Pattern = /^data:video\/(\w+);base64,/;
  if (!video || !video.match(base64Pattern)) return asset;
  const file = Buffer.from(video.replace(base64Pattern, ''), 'base64');
  return client.videos.upload({ title, file })
  .then(({ videoId }) => {
    delete asset.data.dataUrl;
    asset.data.videoId = videoId;
    return asset;
  });
}

function afterSave(asset) {
  return resolver(asset);
}

function afterRetrieve(asset) {
  return resolver(asset);
}

async function resolver(asset) {
  const { videoId } = asset.data;
  if (!videoId) return asset;
  const { encoding: { playable } } = await client.videos.status(videoId);
  if (!playable) {
    asset.data.playable = false;
    return asset;
  }
  return client.videos.get(videoId)
    .then(res => {
      asset.data.playable = true;
      asset.data.url = res.assets.mp4;
      return asset;
    });
}

module.exports = {
  ...info,
  beforeSave,
  afterSave,
  afterRetrieve
};
