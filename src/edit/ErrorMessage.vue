<template>
  <tce-overlay>
    <div class="error--text message">
      <v-icon color="error">mdi-alert</v-icon>
      {{ message }}
    </div>
  </tce-overlay>
</template>

<script>
import TceOverlay from './Overlay.vue';

export default {
  name: 'error-message',
  props: { message: { type: String, required: true } },
  components: { TceOverlay }
};
</script>

<style lang="scss" scoped>
.message {
  font-size: 1.125rem;
}
</style>
