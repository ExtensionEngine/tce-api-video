'use strict';

const { ClientSandbox } = require('./apiVideo');
const info = require('../info');

// process.env approach should be replaced with a more efficient way of accessing env variables!
const client = new ClientSandbox({ apiKey: process.env.API_VIDEO_API_KEY });

function beforeSave(asset) {
  const { videoId, fileName } = asset.data;
  if (videoId || !fileName) return asset;
  return client.videos.create(fileName)
    .then(({ videoId }) => {
      asset.data.playable = false;
      asset.data.videoId = videoId;
      return asset;
    });
}

async function afterSave(asset) {
  const { videoId, playable } = asset.data;
  if (!videoId || playable) return asset;
  const interval = setInterval(async () => {
    const {
      ingest: { status },
      encoding: { playable }
    } = await client.videos.status(videoId);
    if (status === 'uploaded' && playable) {
      clearInterval(interval);
      delete asset.data.uploadUrl;
      await asset.update({ data: { ...asset.data, playable: true } });
    }
  }, 5000);
  asset.data.uploadUrl = await client.videos.getUploadUrl();
  return asset;
}

function afterLoaded(asset) {
  const { videoId, playable } = asset.data;
  if (!videoId || !playable) return asset;
  return client.videos.get(videoId)
    .then(res => {
      asset.data.embedCode = res.assets.iframe;
      asset.data.url = res.assets.mp4;
      return asset;
    });
}

module.exports = {
  ...info,
  beforeSave,
  afterSave,
  afterLoaded
};
