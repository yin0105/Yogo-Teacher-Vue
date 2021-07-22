import './polyfills/object.values.polyfill';

import Vue from 'vue';
import lodash from 'lodash';
import Vuelidate from 'vuelidate';
import VueClipboard from 'vue-clipboard2';
import App from './App.vue';
import store from './store';
import router from './router';

import i18n from './includes/i18n';
import VueSmoothScroll from 'vue2-smooth-scroll';

Object.defineProperty(Vue.prototype, '$lodash', { value: lodash });

Vue.use(Vuelidate);

// Load all filters
require('./filters/index');
// Moment
const moment = require('moment-timezone');
require('moment/locale/da');


Vue.use(require('vue-moment'), {
  moment,
});

Vue.use(VueSmoothScroll);

// Global styles
require('./assets/scss/style.scss');

require('vuedraggable');

VueClipboard.config.autoSetContainer = true; // add this line
Vue.use(VueClipboard);

Vue.config.productionTip = false;

/* eslint-disable no-new */
new Vue({
  el: '#app',
  i18n,
  store,
  router,
  render: h => h(App),
}).$mount('#app');
