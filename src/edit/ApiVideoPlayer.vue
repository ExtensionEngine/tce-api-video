<template>
  <div ref="player" class="player d-flex align-center justify-center"></div>
</template>

<script>
export default {
  name: 'api-video-player',
  props: {
    embedCode: { type: String, default: null }
  },
  methods: {
    appendVideo() {
      const { player } = this.$refs;
      if (!player) return;
      player.innerHTML = this.embedCode;
    }
  },
  watch: {
    embedCode: 'appendVideo'
  },
  mounted() {
    this.appendVideo();
  }
};
</script>

<style lang="scss" scoped>
.player {
  height: 25.625rem;
  background: #000;
}
</style>
