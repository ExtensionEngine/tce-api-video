<template>
  <tce-overlay>
    <div class="message white--text">
      <v-progress-circular color="white" indeterminate class="mr-4" />
      {{ message }}
    </div>
  </tce-overlay>
</template>

<script>
import TceOverlay from './Overlay.vue';

export default {
  name: 'progress-message',
  props: { message: { type: String, required: true } },
  components: { TceOverlay }
};
</script>

<style lang="scss" scoped>
.message {
  font-size: 1.125rem;
}
</style>
