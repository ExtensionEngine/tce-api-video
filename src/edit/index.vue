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
      <div v-if="error" class="overlay">
        <div class="message error--text">
          <v-icon class="error--text">mdi-alert</v-icon>
          {{ error.message || 'Error loading media!' }}
        </div>
      </div>
      <div v-if="infoMessage" class="overlay">
        <div class="message info--text">
          <v-progress-circular indeterminate color="info" class="mr-4" />
          {{ infoMessage }}
        </div>
      </div>
      <div ref="player" class="player"></div>
    </div>
  </div>
</template>

<script>
import axios from 'axios';
import ElementPlaceholder from '../tce-core/ElementPlaceholder.vue';
import get from 'lodash/get';

const DEFAULT_ERROR_MSG = 'Something went wrong.';
const UPLOADING_MSG = 'Video is uploading... Do not leave the page.';
const PROCESSING_MSG = 'Video is processing...';
const CHUNK_SIZE = 64 * 1024 * 1024;

export default {
  name: 'tce-api-video',
  inject: ['$elementBus'],
  props: {
    element: { type: Object, required: true },
    isFocused: { type: Boolean, default: false },
    isDisabled: { type: Boolean, default: false }
  },
  data: () => ({ error: null, file: null, loading: false }),
  computed: {
    videoId: ({ element }) => get(element, 'data.videoId', ''),
    uploadUrl: ({ element }) => get(element, 'data.uploadUrl', null),
    embedCode: ({ element }) => get(element, 'data.embedCode', ''),
    fileName: ({ element }) => get(element, 'data.fileName', ''),
    playable: ({ element }) => get(element, 'data.playable', false),
    showPlaceholder: ({ error, fileName }) => !error && !fileName,
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
    },
    appendVideo() {
      const { player } = this.$refs;
      if (!player) return;
      player.innerHTML = this.embedCode;
    }
  },
  watch: {
    embedCode() {
      this.appendVideo();
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
    this.appendVideo();

    this.$elementBus.on('save', ({ file }) => {
      this.error = null;
      this.file = file;
      this.loading = true;
      this.$emit('save', { fileName: file.name });
    });

    this.$elementBus.on('error', ({ error }) => { this.error = error; });
  },
  components: { ElementPlaceholder }
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
