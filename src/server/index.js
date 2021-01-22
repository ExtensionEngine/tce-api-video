'use strict';

const { createClient } = require('./apiVideo');
const { ELEMENT_STATE } = require('../shared');

function beforeSave(asset, { config: { tce } }) {
  const { videoId, fileName, error } = asset.data;
  const isUploadedOrError = error || videoId || !fileName;
  if (isUploadedOrError) return asset;
  const { apiVideoApiKey: apiKey, apiVideoIsSandbox } = tce;
  const isSandBox = apiVideoIsSandbox === 'true';
  const client = createClient({ apiKey, isSandBox });
  return client.videos.create(fileName)
    .then(({ videoId }) => {
      asset.data.playable = false;
      asset.data.videoId = videoId;
      return asset;
    })
    .catch(error => handleError(error, asset));
}

async function afterSave(asset, { config: { tce } }) {
  const { videoId, playable, error, status } = asset.data;
  const isAvailableOrError = error || !videoId || playable;
  if (isAvailableOrError) return asset;
  const { apiVideoApiKey: apiKey, apiVideoIsSandbox } = tce;
  const isSandBox = apiVideoIsSandbox === 'true';
  const client = createClient({ apiKey, isSandBox });
  if (status === ELEMENT_STATE.UPLOADED) trackPlayableStatus(asset, client);
  asset.data.uploadUrl = await client.videos.getUploadUrl();
  return asset;
}

async function trackPlayableStatus(asset, client) {
  const { videoId } = asset.data;
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
  const isUnavailableOrError = error || !videoId || !playable;
  if (isUnavailableOrError) return asset;
  const { apiVideoApiKey: apiKey, apiVideoIsSandbox } = tce;
  const isSandBox = apiVideoIsSandbox === 'true';
  const client = createClient({ apiKey, isSandBox });
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
