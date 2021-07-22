<template>
  <div
    class="min-h-screen flex items-center justify-center md:bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
    <div class="max-w-md w-full">

      <div class="md:bg-white md:border rounded border-gray-200 py-8 md:py-10 sm:px-6 md:px-8">
        <ModalLogo/>
        <loading-animation v-if="loading"></loading-animation>

        <div v-show="!loading">

          <h2 class="text-center mb-4">
            {{ $t('login.resetPass') }}
          </h2>

          <p class="text-sm text-center leading-5 text-gray-900 w-3/4 m-auto mb-8">
            {{ $t('login.resetPasswordDesc') }}
          </p>

          <form @submit.prevent="submit">

            <InputField
              :label="$t('global.Email')"
              :class="getValidationClass('email')"
              type="email"
              v-model="form.email"
              autocomplete="email"
            >
              <template v-slot:errors>
                <span class="error" v-if="!$v.form.email.required">{{
                    $t('login.emailMustBeEntered')
                  }}</span>
                <span class="error" v-else-if="!$v.form.email.email">{{
                    $t('login.notValidEmail')
                  }}</span>
              </template>
            </InputField>

            <div class="mt-6 md:flex items-center justify-between">
              <button class="btn-primary mb-4 md:mb-0" type="submit">
                {{ $t('login.resetPass') }}
              </button>
              <div class="text-sm leading-5">
                <router-link class="link-text" :to="{name: 'Login'}">{{
                    $t('login.backToLogin')
                  }}
                </router-link>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  </div>
</template>

<script>

import YogoApi from '@/gateways/YogoApi';
import { mapGetters } from 'vuex';
import Imgix from '@/services/Imgix';
import LoadingAnimation from './LoadingAnimation.vue';

import InputField from './InputField.vue';
import ModalLogo from './ModalLogo.vue';

const { required, email } = require('vuelidate/lib/validators');

export default {
  components: {
    ModalLogo,
    LoadingAnimation,
    InputField,
  },
  mixins: [Imgix],
  data() {
    return {
      form: {
        email: '',
      },

      loading: false,
    };
  },
  computed: {
    ...mapGetters([
      'imageServer',
      'client',
    ]),
  },
  methods: {
    async submit() {
      this.$v.$touch();

      if (this.$v.$invalid) {
        return;
      }

      const { location } = window;
      const route = this.$router.resolve({
        name: 'PasswordNew',
        params: { email: '{email}', token: '{token}' },
      });

      this.loading = true;

      const response = await YogoApi.post('/password-reset-send-token', {
        email: this.form.email,
        setNewPasswordLink: `${location.protocol}//${location.host}${location.pathname}${route.href}`,
      });

      if (response.error) {
        this.$store.commit('showAlert', {
          title: response.error.localized_title,
          message: response.error.localized_message,
        });
      } else {
        this.$store.commit('showAlert', {
          title: this.$t('login.emailSent'),
          message: this.$t('login.weHaveSentEmail'),
        });
      }
      this.loading = false;
    },

    getValidationClass(fieldName) {
      const field = this.$v.form[fieldName];

      if (field) {
        return {
          invalid: field.$invalid && field.$dirty,
        };
      }
      return {};
    },
    onSuccessDialogClosed() {
      this.$router.push({ name: 'Login' });
    },
  },
  validations: {
    form: {
      email: {
        required,
        email,
      },
    },
  },
};
</script>
