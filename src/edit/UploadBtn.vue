<template>
  <v-btn
    @click="$refs.uploadInput.click()"
    v-bind="$attrs"
    color="primary darken-3"
    text
    class="text-uppercase">
    <slot name="icon">
      <v-icon color="secondary darken-1" class="mr-2">mdi-cloud-upload-outline</v-icon>
    </slot>
    {{ label }}
    <input
      ref="uploadInput"
      @change="$emit('change', $event)"
      :accept="accept"
      type="file"
      class="d-none">
  </v-btn>
</template>

<script>
export default {
  name: 'video-upload-btn',
  inheritAttrs: false,
  props: {
    label: { type: String, required: true },
    accept: { type: String, default: 'video/*' }
  }
};
</script>
