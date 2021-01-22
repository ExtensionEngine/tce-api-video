<template>
  <div class="overlay d-flex align-center justify-center">
    <div :class="[`${type}--text`, 'message']">
      <slot></slot>
    </div>
  </div>
</template>

<script>
export default {
  name: 'tce-overlay',
  props: {
    type: { type: String, default: 'info' }
  }
};
</script>

<style lang="scss" scoped>
.overlay {
  position: absolute;
  z-index: 3;
  width: 100%;
  height: 100%;
  background: rgba(16, 16, 16, 0.85);

  .message {
    font-size: 1.125rem;
  }
}
</style>
