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
      asset.data.videoId = videoId;
      return asset;
    });
}

async function afterSave(asset) {
  const { videoId } = asset.data;
  if (!videoId) return asset;
  const {
    ingest: { status },
    encoding: { playable }
  } = await client.videos.status(videoId);
  asset.data.playable = playable;
  if (status === 'uploaded') {
    const res = playable ? await client.videos.get(videoId) : null;
    asset.data.url = res && res.assets.mp4;
  } else {
    asset.data.uploadUrl = await client.videos.getUploadUrl();
  }
  return asset;
}

async function afterRetrieve(asset) {
  const { videoId } = asset.data;
  if (!videoId) return asset;
  const { encoding: { playable } } = await client.videos.status(videoId);
  asset.data.playable = playable;
  if (!playable) return asset;
  return client.videos.get(videoId)
    .then(res => {
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
