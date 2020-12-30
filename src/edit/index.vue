<template>
  <div class="tce-api-video">
    <element-placeholder
      v-if="showPlaceholder"
      :is-focused="isFocused"
      :is-disabled="isDisabled"
      name="Api Video component"
      icon="mdi-video-image"
      active-placeholder="Use toolbar to upload the video"
      active-icon="mdi-arrow-up" />
    <div v-else>
      <preview-overlay :show="!isDisabled && !isFocused && playable">
        Double click to preview
      </preview-overlay>
      <div v-if="error" class="overlay">
        <div class="message error--text">
          <v-icon class="error--text">mdi-alert</v-icon>
          {{ error.message || 'Error loading media!' }}
        </div>
      </div>
      <div v-if="infoMessage" class="overlay">
        <div class="message info--text">
          <v-icon class="info--text">mdi-alert-circle</v-icon>
          {{ infoMessage }}
        </div>
      </div>
      <div class="player">
        <plyrue v-if="showVideo" ref="video">
          <video>
            <source :src="url" type="video/mp4">
          </video>
        </plyrue>
      </div>
    </div>
  </div>
</template>

<script>
import axios from 'axios';
import { ElementPlaceholder } from 'tce-core';
import get from 'lodash/get';
import { PlyrueComponent as Plyrue } from 'plyrue';
import PreviewOverlay from 'tce-core/PreviewOverlay';

const DEFAULT_ERROR_MSG = 'Something went wrong.';
const UPLOADING_MSG = 'Video is uploading, please be patient. Do not leave the page or video won\'t be uploaded';
const PROCESSING_MSG = 'Video is processing. Please refresh the page and try again.';
const CHUNK_SIZE = 64 * 1024 * 1024;

export default {
  name: 'tce-api-video',
  inject: ['$elementBus'],
  props: {
    element: { type: Object, required: true },
    isFocused: { type: Boolean, default: false },
    isDragged: { type: Boolean, default: false },
    isDisabled: { type: Boolean, default: false }
  },
  data: () => ({
    error: null,
    switchingVideo: false,
    file: null,
    loading: false
  }),
  computed: {
    player: ({ $refs }) => get($refs, 'video.player'),
    videoId: ({ element }) => get(element, 'data.videoId', ''),
    uploadUrl: ({ element }) => get(element, 'data.uploadUrl', null),
    url: ({ element }) => get(element, 'data.url', ''),
    fileName: ({ element }) => get(element, 'data.fileName', ''),
    playable: ({ element }) => get(element, 'data.playable', false),
    showPlaceholder: ({ error, fileName }) => !error && !fileName,
    showVideo: ({ switchingVideo, isDragged }) => !(switchingVideo || isDragged),
    infoMessage: ({ error, loading, playable }) => {
      if (error) return;
      if (loading) return UPLOADING_MSG;
      if (!playable) return PROCESSING_MSG;
    }
  },
  methods: {
    upload({ url, file, videoId }) {
      if (CHUNK_SIZE > file.size) return this.post({ url, videoId, chunk: file });
      const chunks = [];
      const { size } = file;
      for (let offset = 0; offset < size; offset += CHUNK_SIZE) {
        const end = Math.min(offset + CHUNK_SIZE, size);
        const chunk = file.slice(offset, end);
        chunks.push({ chunk, offset, end });
      }
      return Promise.all(chunks.map(it => this.post({ url, videoId, size, ...it })));
    },
    post({ url, videoId, chunk, size, offset, end }) {
      const headers = {
        'Content-Type': 'multipart/form-data'
      };
      if (offset !== undefined && end !== undefined) {
        headers['Content-Range'] = `bytes ${offset}-${end - 1}/${size}`;
      }
      const formData = new FormData();
      formData.append('file', chunk);
      formData.append('videoId', videoId);
      return axios.post(url, formData, { headers });
    }
  },
  watch: {
    isFocused(val, oldVal) {
      if (oldVal && !val && this.player) this.player.pause();
    },
    url() {
      this.switchingVideo = true;
      this.$nextTick(() => (this.switchingVideo = false));
    },
    videoId() {
      const { videoId, file, uploadUrl: url } = this;
      if (!videoId || !file || !url) return;
      return this.upload({ url, file, videoId })
        .then(() => { this.file = null; })
        .catch(err => {
          const message = get(err, 'response.data.title', DEFAULT_ERROR_MSG);
          this.$elementBus.emit('error', { error: { message } });
        })
        .finally(() => { this.loading = false; });
    }
  },
  mounted() {
    this.$elementBus.on('save', ({ file }) => {
      this.error = null;
      this.file = file;
      this.loading = true;
      this.$emit('save', { fileName: file.name });
    });

    this.$elementBus.on('error', ({ error }) => { this.error = error; });
  },
  components: { ElementPlaceholder, Plyrue, PreviewOverlay }
};
</script>

<style lang="scss" scoped>
.tce-api-video {
  position: relative;
}

.overlay {
  position: absolute;
  z-index: 3;
  width: 100%;
  height: 100%;
  background: rgba(16, 16, 16, 0.85);

  .message {
    position: relative;
    top: 45%;
    font-size: 1.125rem !important;
  }
}

.player {
  height: 25.625rem;
  background: #000;

  ::v-deep {
    > div, .plyr--video, .plyr__video-wrapper, video {
      height: 100%;
    }

    .plyr.plyr--vimeo:fullscreen {
      padding-bottom: 56.25%;
    }

    .plyr__video-wrapper {
      padding-bottom: 0 !important;
    }

    .plyr__control--overlaid {
      display: none;
    }
  }
}
</style>
