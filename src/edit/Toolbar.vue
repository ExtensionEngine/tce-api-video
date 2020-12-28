<template>
  <v-toolbar
    height="72"
    color="transparent"
    class="elevation-0">
    <v-toolbar-title class="pl-1">Api Video</v-toolbar-title>
    <v-toolbar-items class="mx-auto">
      <upload-btn
        v-if="!fileName"
        @change="upload"
        :loading="loading"
        label="Upload Api video"
        accept="video/mp4"
        class="upload-btn" />
      <template v-else>
        <v-text-field
          :value="fileName"
          readonly hide-details filled />
      </template>
    </v-toolbar-items>
  </v-toolbar>
</template>

<script>
import get from 'lodash/get';
import UploadBtn from './UploadBtn.vue';

const FILE_SIZE_LIMIT = 52428800; // 50mb
const MP4_MIME_TYPE = 'video/mp4';

export default {
  name: 'tce-api-video-toolbar',
  inject: ['$elementBus'],
  props: {
    element: { type: Object, required: true }
  },
  data: () => ({ loading: false }),
  computed: {
    fileName: ({ element }) => get(element, 'data.fileName', '')
  },
  methods: {
    upload(e) {
      const file = e.target.files[0];
      if (file.size > FILE_SIZE_LIMIT) {
        this.$elementBus.emit('error', { error: { message: 'File is too large.' } });
        return;
      }
      if (file.type !== MP4_MIME_TYPE) {
        this.$elementBus.emit('error', { error: { message: 'MP4 format is required.' } });
        return;
      }
      this.loading = true;
      const reader = new window.FileReader();
      reader.readAsDataURL(file);
      reader.addEventListener('load', e => {
        this.loading = false;
        this.$elementBus.emit('save', { dataUrl: e.target.result, fileName: file.name });
      });
    }
  },
  components: { UploadBtn }
};
</script>

<style lang="scss" scoped>
.v-toolbar__title {
  min-width: 23.875rem;
  text-align: left;
}

.upload-btn ::v-deep .v-btn {
  height: 100%;

  .v-btn__content {
    padding: 1.5rem 0;
  }
}

.v-text-field {
  min-width: 21.875rem;
  margin: 0.5rem 0.75rem 0 1.75rem;
}
</style>
