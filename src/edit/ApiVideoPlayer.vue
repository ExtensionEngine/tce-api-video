<template>
  <div :id="videoId" class="api-video-player d-flex align-center justify-center"></div>
</template>

<script>
import pick from 'lodash/pick';
import { PlayerSdk } from '@api.video/player-sdk';

const invokeMethod = method => function (...params) {
  return this.player[method](...params);
};
const playerMethods = Object.keys(PlayerSdk.prototype)
  .reduce((all, method) => ({ ...all, [method]: invokeMethod(method) }), {});

const playerOptions = {
  live: { type: Boolean, default: false },
  autoplay: { type: Boolean, default: false },
  muted: { type: Boolean, default: false },
  metadata: { type: Object, default: null },
  hideControls: { type: Boolean, default: false },
  hideTitle: { type: Boolean, default: false },
  loop: { type: Boolean, default: false }
};

export default {
  name: 'api-video-player',
  inheritAttrs: false,
  props: {
    ...playerOptions,
    videoId: { type: String, required: true },
    token: { type: String, required: true }
  },
  data: () => ({ player: null }),
  computed: {
    playerOptions: vm => pick(vm, Object.keys(playerOptions))
  },
  methods: {
    ...playerMethods,
    setEmbeddedPlayer() {
      this.player = new PlayerSdk(`#${this.videoId}`, {
        ...this.playerOptions,
        id: this.videoId,
        token: this.token
      });
      this.addEventListeners();
    },
    addEventListeners() {
      const events = Object.keys(this.$listeners);
      events.forEach(this.addEventListener);
    },
    addEventListener(event) {
      this.player.addEventListener(event, (...params) => {
        this.$emit(event, ...params);
      });
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
