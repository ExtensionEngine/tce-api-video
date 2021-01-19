<template>
  <v-toolbar
    height="72"
    color="transparent"
    class="elevation-0">
    <v-toolbar-title class="pl-1 text-left">Api Video</v-toolbar-title>
    <v-toolbar-items class="mx-auto">
      <upload-btn
        v-if="!fileName"
        @change="upload"
        label="Upload Api video"
        accept="video/mp4"
        class="upload-btn" />
      <v-text-field
        v-else
        :value="fileName"
        readonly hide-details filled />
    </v-toolbar-items>
  </v-toolbar>
</template>

<script>
import UploadBtn from './UploadBtn.vue';

const MP4_MIME_TYPE = 'video/mp4';
const FORMAT_ERROR = 'MP4 format is required.';

export default {
  name: 'tce-api-video-toolbar',
  inject: ['$elementBus'],
  props: {
    element: { type: Object, required: true }
  },
  computed: {
    fileName: ({ element }) => element.data?.fileName
  },
  methods: {
    upload(e) {
      const [file] = e.target.files;
      if (file.type !== MP4_MIME_TYPE) {
        this.$elementBus.emit('error', { error: { message: FORMAT_ERROR } });
        return;
      }
      this.$elementBus.emit('save', { file });
    }
  },
  components: { UploadBtn }
};
</script>

<style lang="scss" scoped>
.v-toolbar__title {
  min-width: 23.875rem;
}

.upload-btn ::v-deep .v-btn {
  height: 100%;

  &__content {
    padding: 1.5rem 0;
  }
}

.v-text-field {
  min-width: 21.875rem;
  margin: 0.5rem 0.75rem 0 1.75rem;
}
</style>
