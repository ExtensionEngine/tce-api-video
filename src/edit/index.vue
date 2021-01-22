<template>
  <div class="tce-api-video">
    <element-placeholder
      v-if="isEmpty"
      :is-focused="isFocused"
      :is-disabled="isDisabled"
      name="Api Video component"
      icon="mdi-video-image"
      active-placeholder="Use toolbar to upload the video"
      active-icon="mdi-arrow-up" />
    <div v-else>
      <tce-overlay v-if="error || didUploadFail" type="error">
        <v-icon color="error">mdi-alert</v-icon>
        {{ error || 'Video upload failed. Please try again.' }}
      </tce-overlay>
      <tce-overlay v-if="infoMessage">
        <v-progress-circular indeterminate color="info" class="mr-4" />
        {{ infoMessage }}
      </tce-overlay>
      <div ref="player" class="player"></div>
    </div>
  </div>
</template>

<script>
import createUpload from '../createUpload';
import { ELEMENT_STATE } from '../shared';
import ElementPlaceholder from '../tce-core/ElementPlaceholder.vue';
import get from 'lodash/get';
import TceOverlay from './Overlay.vue';

const DEFAULT_ERROR_MSG = 'Something went wrong.';
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
    didUploadFail: ({ status, file }) => status === ELEMENT_STATE.UPLOADING && !file,
    isEmpty: ({ error, fileName }) => !error && !fileName,
    infoMessage: ({ error, status, playable, didUploadFail }) => {
      if (error || didUploadFail) return;
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
    upload() {
      const { videoId, file, uploadUrl: url } = this;
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
    this.appendVideo();

    this.$elementBus.on('save', ({ file }) => {
      this.file = file;
      this.$emit('save', {
        ...this.element.data,
        fileName: file.name,
        status: ELEMENT_STATE.UPLOADING
      });
    });

    this.$elementBus.on('error', ({ data }) => {
      this.$emit('save', {
        ...this.element.data,
        error: get(data, 'error.message', DEFAULT_ERROR_MSG)
      });
    });
  },
  components: { ElementPlaceholder, TceOverlay }
};
</script>

<style lang="scss" scoped>
.tce-api-video {
  position: relative;
}

.player {
  height: 25.625rem;
  background: #000;
}
</style>
