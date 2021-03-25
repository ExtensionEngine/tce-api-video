'use strict';

const { createClient, getUploadUrl } = require('./apiVideo');
const { DEFAULT_ERROR_MSG, ELEMENT_STATE } = require('../shared');
const get = require('lodash/get');
const unset = require('lodash/unset');
const yn = require('yn');

function beforeSave(asset, { config: { tce } }) {
  const { videoId, fileName, error } = asset.data;
  const isUploadedOrError = error || videoId || !fileName;
  if (isUploadedOrError) {
    deleteTemporaryAssetProps(asset);
    return asset;
  }
  const { apiVideoApiKey: apiKey, apiVideoIsSandbox } = tce;
  const isSandBox = yn(apiVideoIsSandbox);
  const client = createClient({ apiKey, isSandBox });
  return client.videos.create(fileName, { public: false })
    .then(({ videoId }) => {
      asset.data.videoId = videoId;
      deleteTemporaryAssetProps(asset);
      return asset;
    })
    .catch(error => setAssetError(asset, error));
}

function deleteTemporaryAssetProps(asset) {
  const temporaryProps = ['embedCode', 'uploadUrl', 'url'];
  temporaryProps.forEach(prop => unset(asset.data, prop));
  return asset;
}

async function afterSave(asset, { config: { tce } }, options = {}) {
  const { videoId, playable, error, status } = asset.data;
  const isAvailableOrError = error || !videoId || playable;
  if (isAvailableOrError) return asset;
  const { apiVideoApiKey: apiKey, apiVideoIsSandbox } = tce;
  const isSandBox = yn(apiVideoIsSandbox);
  const client = createClient({ apiKey, isSandBox });
  if (status === ELEMENT_STATE.UPLOADED) {
    startPollingPlayableStatus(asset, client, options.context);
  }
  asset.data.uploadUrl = await getUploadUrl(client);
  return asset;
}

async function startPollingPlayableStatus(asset, client, context) {
  const { videoId } = asset.data;
  const {
    ingest: { status },
    encoding: { playable }
  } = await client.videos.getStatus(videoId);
  const isPlayable = status === 'uploaded' && playable;
  if (!isPlayable) {
    return setTimeout(() => startPollingPlayableStatus(asset, client, context), 5000);
  }
  asset.update({ data: { ...asset.data, playable: true } }, { context });
}

function afterLoaded(asset, { config: { tce } }) {
  const { videoId, playable, error } = asset.data;
  const isUnavailableOrError = error || !videoId || !playable;
  if (isUnavailableOrError) return asset;
  const { apiVideoApiKey: apiKey, apiVideoIsSandbox } = tce;
  const isSandBox = yn(apiVideoIsSandbox);
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
  asset.data.error = get(error, 'response.body.title', DEFAULT_ERROR_MSG);
  return asset;
}

module.exports = { beforeSave, afterSave, afterLoaded };
