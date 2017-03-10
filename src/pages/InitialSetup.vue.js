import * as shared from '../scripts/shared'
import routeList from './routes.js'

export default {
  data() {
    return {
      title: 'Initial Setup',
      icon: 'arrow_forward',
      pages: [],
      routes: [],
      notificationDone: false
    }
  },
  mounted() {
    this.pages = routeList.menuPages;
    this.routes = routeList.raw;
  },
  computed: {
    locationSet: function () {
      return shared.coords.source !== 'not set';
    },
  },
  methods: {}
}
