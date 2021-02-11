'use strict';

const { createClient, getUploadUrl } = require('./apiVideo');
const { ELEMENT_STATE } = require('../shared');
const omit = require('lodash/omit');

function beforeSave(asset, { config: { tce } }) {
  const { videoId, fileName, error } = asset.data;
  const isUploadedOrError = error || videoId || !fileName;
  if (isUploadedOrError) return asset;
  const { apiVideoApiKey: apiKey, apiVideoIsSandbox } = tce;
  const isSandBox = apiVideoIsSandbox === 'true';
  const client = createClient({ apiKey, isSandBox });
  return client.videos.create(fileName, { public: false })
    .then(({ videoId }) => {
      asset.data.videoId = videoId;
      return asset;
    })
    .catch(err => setAssetError(asset, err));
}

async function afterSave(asset, { config: { tce } }) {
  const { videoId, playable, error, status } = asset.data;
  const isAvailableOrError = error || !videoId || playable;
  if (isAvailableOrError) return asset;
  const { apiVideoApiKey: apiKey, apiVideoIsSandbox } = tce;
  const isSandBox = apiVideoIsSandbox === 'true';
  const client = createClient({ apiKey, isSandBox });
  if (status === ELEMENT_STATE.UPLOADED) startPollingPlayableStatus(asset, client);
  asset.data.uploadUrl = await getUploadUrl(client);
  return asset;
}

async function startPollingPlayableStatus(asset, client) {
  const { videoId } = asset.data;
  const {
    ingest: { status },
    encoding: { playable }
  } = await client.videos.getStatus(videoId);
  const isPlayable = status === 'uploaded' && playable;
  if (!isPlayable) {
    return setTimeout(() => startPollingPlayableStatus(asset, client), 5000);
  }
  asset.update({ data: { ...omit(asset.data, ['uploadUrl']), playable: true } });
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
    .catch(error => setAssetError(asset, error));
}

function setAssetError(asset, error) {
  asset.data.error = error.message;
  return asset;
}

module.exports = { beforeSave, afterSave, afterLoaded };
