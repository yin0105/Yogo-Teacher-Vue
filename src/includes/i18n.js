import Vue from 'vue';
import VueI18n from 'vue-i18n';
import store from '../store';
import moment from 'moment-timezone';
import da from '@/locales/da';
import en from '@/locales/en';

const initialLocale = store.state.appSettings.locale || 'da';

/**
 * Configure VueI18n
 */
Vue.use(VueI18n);

const i18n = new VueI18n({
  locale: initialLocale,
  fallbackLocale: 'da',
  messages: { da, en },
});

/**
 * Configure moment.js and vue bindings
 */
moment.locale(initialLocale);

window.Vue = Vue;

/**
 * Subscribe to locale changes in the Vuex store
 */
function handleLocaleChange(locale) {
  i18n.locale = locale;
  moment.locale(locale);
}

store.watch(
  state => state.appSettings.locale,
  handleLocaleChange,
);

if (process.env.NODE_ENV === 'development') {
  window.changeLocale = locale => store.dispatch('appSettings/update', { locale });
}

export default i18n;
