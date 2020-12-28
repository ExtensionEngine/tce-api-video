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
      <div v-if="!error && !playable" class="overlay">
        <div class="message info--text">
          <v-icon class="info--text">mdi-alert-circle</v-icon>
          Video is still processing. Please refresh the page and try again.
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
import { ElementPlaceholder } from 'tce-core';
import get from 'lodash/get';
import { PlyrueComponent as Plyrue } from 'plyrue';
import PreviewOverlay from 'tce-core/PreviewOverlay';

export default {
  inject: ['$elementBus'],
  props: {
    element: { type: Object, required: true },
    isFocused: { type: Boolean, default: false },
    isDragged: { type: Boolean, default: false },
    isDisabled: { type: Boolean, default: false }
  },
  data: () => ({ error: null, switchingVideo: false }),
  computed: {
    player: ({ $refs }) => get($refs, 'video.player'),
    url: ({ element }) => get(element, 'data.url', ''),
    fileName: ({ element }) => get(element, 'data.fileName', ''),
    playable: ({ element }) => get(element, 'data.playable', false),
    showPlaceholder: ({ error, fileName }) => !error && !fileName,
    showVideo: ({ switchingVideo, isDragged }) => !(switchingVideo || isDragged)
  },
  watch: {
    isFocused(val, oldVal) {
      if (oldVal && !val && this.player) this.player.pause();
    },
    url() {
      this.switchingVideo = true;
      this.$nextTick(() => (this.switchingVideo = false));
    }
  },
  mounted() {
    this.$elementBus.on('save', data => {
      this.error = null;
      this.$emit('save', data);
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
