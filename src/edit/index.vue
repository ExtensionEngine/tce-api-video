<template>
  <div class="tce-api-video">
    <v-alert
      v-model="showAlert"
      type="error"
      dismissible
      class="text-left">
      {{ error }}
    </v-alert>
    <element-placeholder
      v-if="isEmpty"
      :is-focused="isFocused"
      :is-disabled="isDisabled"
      name="Api Video component"
      icon="mdi-video-image"
      active-placeholder="Use toolbar to upload the video"
      active-icon="mdi-arrow-up" />
    <div v-else class="player-container">
      <error-message v-if="errorMessage" :message="errorMessage" />
      <progress-message v-else-if="infoMessage" :message="infoMessage" />
      <template v-else>
        <preview-overlay :show="!isFocusedOrDisabled">
          Double click to preview
        </preview-overlay>
        <api-video-player ref="player" v-bind="element.data" />
      </template>
    </div>
  </div>
</template>

<script>
import { DEFAULT_ERROR_MSG, ELEMENT_STATE } from '../shared';
import ApiVideoPlayer from './ApiVideoPlayer.vue';
import createUpload from '../upload';
import ElementPlaceholder from '../tce-core/ElementPlaceholder.vue';
import ErrorMessage from './ErrorMessage.vue';
import get from 'lodash/get';
import PreviewOverlay from '../tce-core/PreviewOverlay.vue';
import ProgressMessage from './ProgressMessage.vue';

const UPLOAD_FAILED_ERROR_MSG = 'Video upload failed. Please try again.';
const UPLOADING_MSG = 'Video is uploading. Please do not leave the page.';
const PROCESSING_MSG = 'Video is processing...';

export default {
  name: 'tce-api-video',
  inject: ['$elementBus'],
  props: {
    element: { type: Object, required: true },
    isFocused: { type: Boolean, default: false },
    isDisabled: { type: Boolean, default: false }
  },
  data: () => ({ file: null, error: null, showAlert: false }),
  computed: {
    isEmpty() {
      const { error, fileName } = this.element.data;
      return !error && !fileName;
    },
    didUploadFail() {
      const { status } = this.element.data;
      return status === ELEMENT_STATE.UPLOADING && !this.file;
    },
    errorMessage() {
      const { error } = this.element.data;
      return this.didUploadFail ? UPLOAD_FAILED_ERROR_MSG : error;
    },
    infoMessage() {
      const { status, playable } = this.element.data;
      if (status === ELEMENT_STATE.UPLOADING) return UPLOADING_MSG;
      return !playable && PROCESSING_MSG;
    },
    isReadyToUpload() {
      const { videoId, uploadUrl } = this.element.data;
      return videoId && this.file && uploadUrl;
    },
    isFocusedOrDisabled: ({ isDisabled, isFocused }) => isFocused || isDisabled
  },
  methods: {
    upload() {
      const { videoId, uploadUrl: url } = this.element.data;
      return createUpload({ videoId, file: this.file, url })
        .then(() => {
          this.file = null;
          this.$emit('save', { ...this.element.data, status: ELEMENT_STATE.UPLOADED });
        })
        .catch(err => {
          this.$emit('save', {
            ...this.element.data,
            error: get(err, 'response.data.title', DEFAULT_ERROR_MSG),
            status: null,
            fileName: null
          });
        });
    }
  },
  watch: {
    'element.data.videoId'() {
      if (this.isReadyToUpload) this.upload();
    },
    isFocusedOrDisabled(value) {
      if (!value && this.$refs.player) this.$refs.player.pause();
    }
  },
  mounted() {
    this.$elementBus.on('save', ({ file }) => {
      this.file = file;
      this.$emit('save', {
        ...this.element.data,
        fileName: file.name,
        status: ELEMENT_STATE.UPLOADING
      });
    });

    this.$elementBus.on('error', error => {
      this.showAlert = true;
      this.error = typeof error === 'string'
        ? error
        : get(error, 'response.data.error.message', DEFAULT_ERROR_MSG);
    });
  },
  components: {
    ApiVideoPlayer,
    ElementPlaceholder,
    ErrorMessage,
    ProgressMessage,
    PreviewOverlay
  }
};
</script>

<style lang="scss" scoped>
.player-container {
  position: relative;
  height: 22.5rem;

  .api-video-player {
    height: 100%;
  }
}
</style>
