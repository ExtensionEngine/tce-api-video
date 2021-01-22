'use strict';

const { createSandBoxClient } = require('./apiVideo');
const { ELEMENT_STATE } = require('../shared');

function beforeSave(asset, { config: { tce } }) {
  const { videoId, fileName, error } = asset.data;
  if (error || videoId || !fileName) return asset;
  const client = createSandBoxClient({ apiKey: tce.apiVideoApiKey });
  return client.videos.create(fileName)
    .then(({ videoId }) => {
      asset.data.playable = false;
      asset.data.videoId = videoId;
      return asset;
    })
    .catch(error => handleError(error, asset));
}

async function afterSave(asset, { config: { tce } }) {
  const { videoId, playable, error } = asset.data;
  if (error || !videoId || playable) return asset;
  const client = createSandBoxClient({ apiKey: tce.apiVideoApiKey });
  if (status === ELEMENT_STATE.UPLOADED) trackPlayableStatus(asset, client);
  asset.data.uploadUrl = await client.videos.getUploadUrl();
  return asset;
}

async function trackPlayableStatus(asset, client) {
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
}

function afterLoaded(asset, { config: { tce } }) {
  const { videoId, playable, error } = asset.data;
  if (error || !videoId || !playable) return asset;
  const client = createSandBoxClient({ apiKey: tce.apiVideoApiKey });
  return client.videos.get(videoId)
    .then(res => {
      asset.data.embedCode = res.assets.iframe;
      asset.data.url = res.assets.mp4;
      return asset;
    })
    .catch(error => handleError(error, asset));
}

function handleError(error, asset) {
  asset.data.error = error.message;
  return asset;
}

module.exports = { beforeSave, afterSave, afterLoaded };
