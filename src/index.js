import Edit from './edit';
import info from './info';
import Toolbar from './edit/Toolbar';

const initState = () => ({ fileName: null, videoId: null, playable: false });

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
