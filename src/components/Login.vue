<template>
  <div
    class="min-h-screen flex items-center justify-center md:bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
    <div class="max-w-md w-full">

      <div class="md:bg-white md:border rounded border-gray-200 py-8 md:py-10 sm:px-6 md:px-8">
        <ModalLogo/>
        <h2 class="mt-6 text-center">
          {{ $t('login.teacherLogin') }}
        </h2>

        <div class="message" v-show="loginErrorMessage">
          {{ loginErrorMessage }}
        </div>

        <form class="mt-8" novalidate @submit.prevent="submitForm">

          <InputField
            :label="$t('global.Email')"
            :class="getValidationClass('email')"
            type="email"
            v-model="form.email"
            autocomplete="email"
          >
            <template v-slot:errors>
              <span class="error" v-if="!$v.form.email.required">
                {{ $t('login.emailMustBeEntered') }}
              </span>
              <span class="error"
                    v-else-if="!$v.form.email.email">{{ $t('login.notValidEmail') }}</span>
            </template>
          </InputField>

          <InputField
            :label="$t('global.Password')"
            :class="getValidationClass('password')"
            type="password"
            v-model="form.password"
          >
            <template v-slot:errors>
              <span class="error" v-if="!$v.form.password.required">
                {{ $t('login.passwordMustBeEntered') }}
              </span>
              <span class="error" v-if="loginFailed">{{ $t('login.wrongEmailOrPassword') }}</span>
            </template>
          </InputField>


          <div class="mt-6 md:flex items-center justify-between">
            <div class="block md:flex items-center mb-4 md:mb-0">
              <label class="checkbox">
                <input
                  type="checkbox"
                  v-model="rememberMe"
                >
                <span>{{ $t('login.rememberMeLabel') }}</span>
              </label>

            </div>
            <div class="text-sm leading-5">
              <router-link class="link-text" :to="{name: 'PasswordReset'}">{{
                  $t('login.forgotPass')
                }}
              </router-link>
            </div>
          </div>


          <button class="btn-primary mt-8 w-full" type="submit">
            {{ $t('login.login') }}
          </button>

        </form>

      </div>
    </div>

  </div>
</template>

<script>

import { validationMixin } from 'vuelidate';
import { email, required } from 'vuelidate/lib/validators';
import { mapGetters } from 'vuex';
import YogoApi from '@/gateways/YogoApi';
import Imgix from '@/services/Imgix';
import InputField from './InputField.vue';
import Modal from './Modal.vue';
import ModalLogo from './ModalLogo';

export default {
  mixins: [validationMixin, Imgix],
  components: {
    ModalLogo,
    InputField,
    Modal,
  },
  data() {
    return {
      email: '',
      password: '',
      rememberMe: false,
      loginErrorMessage: '',
      loginFailed: false,
      form: {
        email: '',
        password: '',
      },

    };
  },
  computed: {
    ...mapGetters([
      'requestedRoute',
      'imageServer',
      'client',
    ]),
  },
  methods: {

    getValidationClass(fieldName) {
      const field = this.$v.form[fieldName];

      if (field) {
        return {
          invalid: field.$invalid && field.$dirty,
        };
      }
      return {};
    },

    async submitForm() {
      this.$v.$touch();

      if (this.$v.$invalid) return;

      const response = await YogoApi.post('/login', this.form);

      if (response.error) {
        this.$store.commit('showAlert', {
          title: response.error.localized_title,
          message: response.error.localized_message,
        });
        return;
      }

      if (!response.user || !response.token) {
        alert(this.$t('login.couldNotLogIn'));
        return;
      }

      if (this.rememberMe) {
        window.localStorage.setItem('accessToken', response.token);
        window.sessionStorage.removeItem('accessToken');
      } else {
        window.localStorage.removeItem('accessToken');
        window.sessionStorage.setItem('accessToken', response.token);
      }
      await this.$store.dispatch('updateUser', response.user.id);
      if (this.requestedRoute) {
        const requestedRoute = _.pick(this.requestedRoute, ['name', 'params']);
        this.$store.commit('setRequestedRoute', null);
        this.$router.push(requestedRoute);
      } else {
        this.$router.push({ name: 'MySchedule' });
      }
    },
  },
  validations: {
    form: {
      email: {
        required,
        email,
      },
      password: {
        required,
      },
    },
  },
};

</script>

<style lang="stylus" scoped="true">

label
  display block
  height 100%

.router-link-active
  background none

input.error
  border-color: red;

</style>
