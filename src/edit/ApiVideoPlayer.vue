<template>
  <div :id="videoId" class="api-video-player d-flex align-center justify-center"></div>
</template>

<script>
import { PlayerSdk } from '@api.video/player-sdk';

export default {
  name: 'api-video-player',
  props: {
    videoId: { type: String, required: true },
    token: { type: String, required: true }
  },
  data: () => ({ player: null }),
  methods: {
    setEmbeddedPlayer() {
      this.player = new PlayerSdk(`#${this.videoId}`, {
        id: this.videoId,
        token: this.token
      });
    },
    pause() {
      this.player.pause();
    }
  },
  mounted() {
    this.setEmbeddedPlayer();
  }
};
</script>

<style lang="scss">
.api-video-player {
  background: #000;
}
</style>
