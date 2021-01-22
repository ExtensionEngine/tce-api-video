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
      <div v-if="showError" class="overlay">
        <div class="message error--text">
          <v-icon class="error--text">mdi-alert</v-icon>
          {{ error || 'Error loading media!' }}
        </div>
      </div>
      <div v-if="!showError && infoMessage" class="overlay">
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
import { ELEMENT_STATE } from '../shared';
import ElementPlaceholder from '../tce-core/ElementPlaceholder.vue';
import get from 'lodash/get';
import createUpload from '../createUpload';

const DEFAULT_ERROR_MSG = 'Something went wrong.';
const CANCEL_UPLOAD_ERROR_MSG = 'Upload canceled by leaving the page.';
const UPLOADING_MSG = 'Video is uploading... Do not leave the page.';
const PROCESSING_MSG = 'Video is processing...';

export default {
  name: 'tce-api-video',
  inject: ['$elementBus'],
  props: {
    element: { type: Object, required: true },
    isFocused: { type: Boolean, default: false },
    isDisabled: { type: Boolean, default: false }
  },
  data: () => ({ file: null }),
  computed: {
    videoId: ({ element }) => element.data?.videoId,
    uploadUrl: ({ element }) => element.data?.uploadUrl,
    embedCode: ({ element }) => element.data?.embedCode,
    fileName: ({ element }) => element.data?.fileName,
    playable: ({ element }) => element.data?.playable,
    status: ({ element }) => element.data?.status,
    error: ({ element }) => element.data?.error,
    showError: ({ status }) => status === ELEMENT_STATE.ERROR,
    showPlaceholder: ({ error, fileName }) => !error && !fileName,
    infoMessage: ({ error, status, playable }) => {
      if (error) return;
      if (status === ELEMENT_STATE.UPLOADING) return UPLOADING_MSG;
      if (!playable) return PROCESSING_MSG;
    },
    isPreparedToUpload: ({ videoId, file, uploadUrl }) => videoId && file && uploadUrl
  },
  methods: {
    appendVideo() {
      const { player } = this.$refs;
      if (!player) return;
      player.innerHTML = this.embedCode;
    },
    checkIfError() {
      const { status, file, element } = this;
      if (status !== ELEMENT_STATE.UPLOADING || file) return;
      this.$emit('save', {
        ...element.data,
        status: ELEMENT_STATE.ERROR,
        error: CANCEL_UPLOAD_ERROR_MSG
      });
    },
    upload() {
      const { videoId, file, uploadUrl: url} = this;
      createUpload({ videoId, file, url })
        .then(() => {
          this.file = null;
          this.$emit('save', { ...this.element.data, status: ELEMENT_STATE.UPLOADED });
        })
        .catch(err => this.$elementBus.emit('error', err.response));
    }
  },
  watch: {
    embedCode: 'appendVideo',
    videoId() {
      if (this.isPreparedToUpload) this.upload();
    }
  },
  mounted() {
    this.checkIfError();
    this.appendVideo();

    this.$elementBus.on('save', ({ file }) => {
      this.file = file;
      this.$emit('save', { fileName: file.name, status: ELEMENT_STATE.UPLOADING });
    });

    this.$elementBus.on('error', ({ data }) => {
      this.$emit('save', {
        ...this.element.data,
        status: ELEMENT_STATE.ERROR,
        error: get(data, 'error.message', DEFAULT_ERROR_MSG)
      });
    });
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
    font-size: 1.125rem;
  }
}

.player {
  height: 25.625rem;
  background: #000;
}
</style>
