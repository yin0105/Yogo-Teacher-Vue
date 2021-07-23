import Vue from 'vue';
import Router from 'vue-router';

import store from '@/store';

import Init from '@/components/Init.vue';

import Login from '@/components/Login.vue';
import ProfileEdit from '@/components/ProfileEdit.vue';
import PasswordReset from '@/components/PasswordReset.vue';
import PasswordNew from '@/components/PasswordNew.vue';
import VTooltip from 'v-tooltip';
import ClassCheckinSignup from '@/components/ClassCheckinSignup.vue';
import SendClassEmail from '@/components/SendClassEmail.vue';
import LivestreamClassPreloader from '../components/LivestreamClassPreloader.vue';
import MySchedule from '@/components/MySchedule.vue';
import ReportSalary from '@/components/ReportSalary'

const LivestreamClass = () => import('../components/LivestreamClass.vue');

Vue.use(VTooltip);

Vue.use(Router);

const router = new Router({
  routes: [
    {
      path: '/',
      name: 'Init',
      component: Init,
      meta: {
        requireAuth: false,
        fullBleedPage: true,
      },
    },
    {
      path: '/login',
      name: 'Login',
      component: Login,
      meta: {
        requireAuth: false,
        fullBleedPage: true,
      },
    },
    {
      path: '/my-schedule',
      name: 'MySchedule',
      component: MySchedule,
    },
    {
      path: '/livestream/class/:classId/preloader',
      name: 'LivestreamClassPreloader',
      component: LivestreamClassPreloader,
    },
    {
      path: '/livestream/class/:classId',
      name: 'LivestreamClass',
      component: LivestreamClass,
    },
    {
      path: '/class/:id/checkin-signup',
      name: 'ClassCheckinSignup',
      component: ClassCheckinSignup,
    },
    {
      path: '/class/:id/send-email',
      name: 'SendClassEmail',
      component: SendClassEmail,
    },
    {
      path: '/edit-profile',
      name: 'ProfileEdit',
      component: ProfileEdit,
    },
    {
      path: '/password-reset',
      name: 'PasswordReset',
      component: PasswordReset,
      meta: {
        requireAuth: false,
        fullBleedPage: true,
      },
    },
    {
      path: '/new-password/:email/:token',
      name: 'PasswordNew',
      component: PasswordNew,
      meta: {
        requireAuth: false,
        fullBleedPage: true,
      },
    },
    {
      path: '/report/salary',
      name: 'ReportSalary',
      component: ReportSalary,
    },
  ],
});

router.beforeEach((to, from, next) => {
  // If state not ready and page is closed, redirect to Init
  if (!store.state.ready && to.meta.requireAuth !== false) {
    store.commit('setRequestedRoute', to);
    return next({ name: 'Init' });
  }

  // Logged in?
  if (store.getters.userIsLoggedIn) {
    return next();
  }

  // Not logged in

  // Some routes are open
  if (to.meta.requireAuth === false) return next();

  // Closed route and not logged in
  // Redirect to Login
  store.commit('setRequestedRoute', to);
  return next({ name: 'Login' });
});

export default router;
