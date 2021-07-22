<template>
  <div
    class="min-h-screen flex items-center justify-center md:bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
    <div class="max-w-md w-full">

      <div class="md:bg-white md:border rounded border-gray-200 py-8 md:py-10 sm:px-6 md:px-8">
        <ModalLogo/>
        <loading-animation v-if="loading"></loading-animation>

        <div v-if="!loading">
          <h2 class="mt-6 text-center">
            {{ $t('login.newPass') }}
          </h2>

          <p class="text-sm text-center leading-5 text-gray-900 w-3/4 m-auto mb-8">
            {{ $t('login.enterNewPass') }}
          </p>

          <form @submit.prevent="submit" novalidate>

            <InputField
              :label="$t('global.Password')"
              :class="getValidationClass('password')"
              type="password"
              v-model="form.password"
              autocomplete="off"
            >
              <template v-slot:errors>
                <span class="error" v-if="!$v.form.password.required">
                  {{ $t('login.passwordMustBeEntered') }}
                </span>
                <span class="error" v-else-if="!$v.form.password.passwordStrength">
                  {{ $t('login.passDesc') }}
                </span>
              </template>
            </InputField>

            <InputField
              :label="$t('global.Password')"
              :class="getValidationClass('password_repeat')"
              type="password"
              v-model="form.password_repeat"
              autocomplete="off"
            >
              <template v-slot:errors>
                <span class="error" v-if="!$v.form.password_repeat.required">
                  {{ $t('login.passwordMustBeRepeated') }}
                </span>
                <span class="error" v-else-if="!$v.form.password_repeat.sameAsPassword">
                  {{ $t('login.passwordIsDifferent') }}
                </span>
              </template>
            </InputField>

            <button class="btn-primary mb-4 md:mb-0" type="submit">
              {{ $t('login.setNewPassword') }}
            </button>
          </form>
        </div>


        <modal
          v-show="showAlert"
          @close="closeModal"
        >
          <template v-slot:header>
            <h3 class="text-center">
              {{ alertTitle }}
            </h3>
          </template>
          <template v-slot:body>
            <p class="text-center">
              {{ alertText }}
            </p>
          </template>
          <template v-slot:footer>
            <button
              type="button"
              class="btn btn-primary"
              @click="closeModal()"
            >
              {{ $t('global.Close') }}
            </button>
          </template>
        </modal>

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

import Modal from './Modal.vue';
import ModalLogo from './ModalLogo';

const { required } = require('vuelidate/lib/validators');

export default {
  components: {
    ModalLogo,
    LoadingAnimation,
    InputField,
    Modal,
  },
  mixins: [Imgix],
  data() {
    return {
      passTitle: 'Ny adgangskode',
      passNew: 'Indtast din nye adgangskode',
      email: 'E-mail',
      password: 'Adgangskode',
      create: 'Indstil ny adgangskode',

      form: {
        password: '',
        password_repeat: '',
      },

      showAlert: false,
      alertTitle: '',
      alertText: '',

      loading: false,
    };
  },
  computed: {
    ...mapGetters([
      'imageServer',
      'client',
    ]),
  },
  async created() {
    const { email, token } = this.$route.params;

    const response = await YogoApi.post('/password-reset-check-token', {
      email,
      token,
    });

    if (response.error) {
      this.alertTitle = response.error.localizedTitle;
      this.alertText = response.error.localizedMessage;
      this.showAlert = true;
    }
  },

  methods: {
    showModal() {
      this.showAlert = true;
    },
    closeModal() {
      this.showAlert = false;
      if (this.loading) {
        this.$router.push({ name: 'Login' });
      }
    },
    async submit() {
      this.$v.$touch();

      if (this.$v.$invalid) {
        return;
      }

      const { email, token } = this.$route.params;

      this.loading = true;

      const response = await YogoApi.post('/password-reset-set-password-with-token', {
        email,
        token,
        password: this.form.password,
      });

      if (response.error) {
        this.alertTitle = response.error.localizedTitle;
        this.alertText = response.error.localizedMessage;
        this.showAlert = true;
        return;
      }

      this.alertTitle = this.$t('login.passwordUpdated');
      this.alertText = this.$t('login.youCanNowSignup');
      this.showAlert = true;
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
  },
  validations: {
    form: {
      password: {
        required,
        passwordStrength(value) {
          const upperCase = !!value.match(/[A-Z]+/);
          const lowerCase = !!value.match(/[a-z]+/);
          const numbers = !!value.match(/[0-9]+/);
          const length = value.length >= 6;
          return upperCase && lowerCase && numbers && length;
        },
      },
      password_repeat: {
        required,
        sameAsPassword(value) {
          return value === this.form.password;
        },
      },
    },
  },
};
</script>
