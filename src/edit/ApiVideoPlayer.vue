<template>
  <div ref="player" class="player d-flex align-center justify-center"></div>
</template>

<script>
import { PlayerSdk } from '@api.video/player-sdk';

export default {
  name: 'api-video-player',
  props: {
    videoId: { type: String, default: null },
    embedCode: { type: String, default: null }
  },
  methods: {
    setEmbeddedPlayer() {
      if (!this.embedCode) return;
      const { player } = this.$refs;
      player.innerHTML = this.embedCode;
      player.firstChild.id = this.videoId;
      this.player = new PlayerSdk(`#${this.videoId}`);
    },
    pause() {
      this.player.pause();
    }
  },
  watch: {
    embedCode: 'setEmbeddedPlayer'
  },
  mounted() {
    this.setEmbeddedPlayer();
  }
};
</script>

<style lang="scss" scoped>
.player {
  height: 22.5rem;
  background: #000;
}
</style>
