import Edit from './edit/index.vue';
import info from './info';
import Toolbar from './edit/Toolbar.vue';

const initState = () => ({ fileName: null, videoId: null });

export default {
  ...info,
  initState,
  Edit,
  Toolbar,
  ui: {
    icon: 'mdi-video',
    forceFullWidth: true
  }
};
