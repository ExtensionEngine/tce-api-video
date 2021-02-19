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
    setVideo() {
      const { player } = this.$refs;
      if (!player) return;
      player.innerHTML = this.embedCode;
    }
  },
  watch: {
    embedCode: 'setVideo'
  },
  mounted() {
    this.setVideo();
  }
};
</script>

<style lang="scss" scoped>
.player {
  height: 22.5rem;
  background: #000;
}
</style>
