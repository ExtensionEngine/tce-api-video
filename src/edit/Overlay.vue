<template>
  <div class="overlay d-flex align-center justify-center">
    <div :class="[`${type}--text`, 'message']">
      <v-icon v-if="type === 'error'" color="error">mdi-alert</v-icon>
      <v-progress-circular v-else color="info" class="mr-4" indeterminate />
      {{ message }}
    </div>
  </div>
</template>

<script>
export default {
  name: 'tce-overlay',
  props: {
    type: {
      type: String,
      default: 'info',
      validator: value => ['info', 'error'].includes(value)
    },
    message: { type: String, default: '' }
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
