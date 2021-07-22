import Vue from 'vue';
import Vuex from 'vuex';
import YogoApi from '@/gateways/YogoApi';
import router from '@/router';
import _sortBy from 'lodash/sortBy';
import { v4 as uuidv4 } from 'uuid';
import qs from 'qs';
// State modules
import appSettings from './modules/appSettings';

Vue.use(Vuex);

const debug = process.env.NODE_ENV !== 'production';

export default new Vuex.Store({
  modules: {
    appSettings,
  },
  state: {
    user: null,
    apiRoot: process.env.VUE_APP_API_ROOT,
    client: null,
    routerBase: '/admin',
    ready: false,
    flashMessages: [],
    alertMessages: [],
    requestedRoute: null,
    liveswitchDeviceId: '',
  },
  mutations: {
    setUser(state, user) {
      state.user = user;
    },
    clearUser(state) {
      state.user = null;
    },
    setClient(state, client) {
      state.client = client;
    },
    setReady(state) {
      state.ready = true;
    },
    postFlashMessage(state, payload) {
      state.flashMessages.push({
        type: payload.type,
        text: payload.text,
      });
      while (state.flashMessages.length > 10) {
        state.flashMessages.shift();
      }
    },
    showAlert(state, payload) {
      state.alertMessages.push(_.pick(payload, [
        'title',
        'message',
      ]));
      state.alertMessages = state.alertMessages.slice(-1);
    },
    setRequestedRoute(state, requestedRoute) {
      state.requestedRoute = requestedRoute;
    },
    setLiveswitchDeviceId(state, liveswitchDeviceId) {
      state.liveswitchDeviceId = liveswitchDeviceId;
    },
  },
  getters: {
    userIsLoggedIn(state) {
      return !!state.user;
    },
    userName(state) {
      if (state.user) {
        return `${state.user.firstname} ${state.user.lastname}`;
      }
      return '';
    },
    user(state) {
      return state.user;
    },
    imageServer(state) {
      return state.imageServer;
    },
    stateReady(state) {
      return state.ready;
    },
    flashMessages(state) {
      return state.flashMessages;
    },
    alertMessages(state) {
      return state.alertMessages;
    },
    requestedRoute(state) {
      return state.requestedRoute;
    },
    apiRoot(state) {
      return state.apiRoot;
    },
    client(state) {
      return state.client;
    },
    liveswitchDeviceId(state) {
      return state.liveswitchDeviceId;
    },
  },
  actions: {
    async logout({ commit }) {
      commit('clearUser');
      window.sessionStorage.removeItem('accessToken');
      window.sessionStorage.removeItem('user');
      window.localStorage.removeItem('accessToken');
      window.localStorage.removeItem('user');
      router.push({ name: 'Login' });
      await YogoApi.post('/logout');
    },
    async init({ dispatch, commit, state }) {
      commit('setLiveswitchDeviceId', uuidv4());

      const clientQueryString = qs.stringify({
        populate: [
          'logo',
          'logo_white',
          'branches',
          'settings',
        ],
      });
      const [client, loginStatus] = await Promise.all(
        [
          YogoApi.get(`/clients/current?${clientQueryString}`),
          YogoApi.get('/get-login-status'),
        ],
      );

      client.branches = _sortBy(client.branches, 'sort');
      commit('setClient', client);
      dispatch('appSettings/update', client.settings);

      if (loginStatus.status === 'LOGGED_IN') {
        await dispatch('updateUser', loginStatus.user.id);
        commit('setReady');
        if (router.currentRoute.name === 'Init') {
          if (state.requestedRoute) {
            const requestedRoute = _.pick(state.requestedRoute, ['name', 'params']);
            commit('setRequestedRoute', null);
            router.push(requestedRoute);
          } else {
            router.push({ name: 'MySchedule' });
          }
        }
      } else {
        commit('setReady');
        if (router.currentRoute.name === 'Init' || router.currentRoute.meta.requireAuth !== false) {
          // requireAuth might be undefined, which should be taken as "true"
          router.push({ name: 'Login' });
        }
      }
    },
    async updateUser({ commit }, userId) {
      const [user] = await YogoApi.get(`/users?id=${userId}&populate[]=image&populate[]=teacher_ical_feed_url`);
      commit('setUser', user);
    },
  },
  strict: debug,
});
