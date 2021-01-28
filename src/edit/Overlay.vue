<template>
  <div class="overlay d-flex align-center justify-center">
    <slot></slot>
  </div>
</template>

<script>
export default {
  name: 'tce-overlay'
};
</script>

<style lang="scss" scoped>
.overlay {
  position: absolute;
  z-index: 3;
  width: 100%;
  height: 100%;
  background: rgba(16, 16, 16, 0.85);
}
</style>
