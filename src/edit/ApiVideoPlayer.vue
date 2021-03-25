<template>
  <div :id="videoId" class="api-video-player d-flex align-center justify-center"></div>
</template>

<script>
import { PlayerSdk } from '@api.video/player-sdk';

const playerMethods = Object
  .keys(PlayerSdk.prototype)
  .reduce((all, method) => ({
    ...all,
    [method]: function (...params) {
      this.player[method](...params);
    }
  }), {});

export default {
  name: 'api-video-player',
  props: {
    videoId: { type: String, required: true },
    token: { type: String, required: true }
  },
  data: () => ({ player: null }),
  methods: {
    ...playerMethods,
    setEmbeddedPlayer() {
      this.player = new PlayerSdk(`#${this.videoId}`, {
        id: this.videoId,
        token: this.token
      });
      this.addEventListeners();
    },
    addEventListener(event) {
      this.player.addEventListener(event, (...params) => {
        this.$emit(event, ...params);
      });
    },
    addEventListeners() {
      const events = Object.keys(this.$listeners);
      events.forEach(this.addEventListener);
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
