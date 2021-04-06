import Edit from './edit/index.vue';
import info from './info';
import Toolbar from './edit/Toolbar.vue';

const initState = () => ({
  fileName: null,
  videoId: null,
  playable: false,
  status: null,
  error: null
});

export { Edit, Toolbar };

/**
 * The fields that need to be customized are:
 * name: a string that is displayed to a user in the editor
 * ui->icon: a string representing the name of the MDI (https://materialdesignicons.com/)
 * icon that is displayed to the user in the editor
 * ui->forceFullWidth: a boolean value which defines if the element can only be
 * added as full width element
 */
export default {
  ...info,
  initState,
  components: { Edit, Toolbar },
  ui: {
    icon: 'mdi-video',
    forceFullWidth: true
  }
};
