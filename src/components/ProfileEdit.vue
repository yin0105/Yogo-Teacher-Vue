<template>
  <div>
    <loading-animation v-if="loading"></loading-animation>

    <div v-else>

      <header class="bg-white shadow">
        <div class="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
          <h1 class="text-3xl font-bold leading-tight text-gray-900">
            {{ $t('global.EditProfile') }}
          </h1>
        </div>
      </header>

      <main>
        <div class="max-w-screen-xl mx-auto py-6 sm:px-6 lg:px-8">
          <div class="px-4 py-6 sm:px-0">

            <div class="flex flex-col md:flex-row">
              <InputField
                :label="$t('global.FirstName')"
                :class="getValidationClass('first_name')"
                class="md:flex-1 md:mr-4 order-last md:order-none"
                type="text"
                v-model="form.first_name"
                :required="true"
              >
                <template v-slot:errors>
                  <span class="error" v-if="!$v.form.first_name.required">
                    {{ $t('global.FirstNameRequired') }}
                  </span>
                </template>
              </InputField>

              <imagefield
                imageFormat="profile"
                :imageId.sync="form.image_id || form.image"
                class="md:flex-1 order-first md:order-none"
              >
              </imagefield>
            </div>

            <div class="md:flex items-end">
              <InputField
                :label="$t('global.LastName')"
                :class="getValidationClass('last_name')"
                class="md:flex-1 md:mr-4"
                type="text"
                v-model="form.last_name"
              >
              </InputField>

              <div class="md:flex-1 w-full self-center">
                <div class="flex md:flex-1">
                  <div class="col w-full">
                    <InputField
                      :class="getValidationClass('date_of_birth')"
                      v-model="form.date_of_birth"
                      type="date"
                      :label="$t('global.DateOfBirth')"
                    >
                    </InputField>
                  </div>
                </div>
              </div>
            </div>

            <div class="md:flex">
              <InputField
                :label="$t('global.Address1')"
                type="text"
                class="md:flex-1 md:mr-4"
                v-model="form.address_1"
              >
              </InputField>

              <InputField
                :label="$t('global.Address2')"
                type="text"
                class="md:flex-1"
                v-model="form.address_2"
              >
              </InputField>
            </div>

            <div class="md:flex">
              <InputField
                :label="$t('global.Zip')"
                type="text"
                class="md:flex-1 md:mr-4"
                v-model="form.zip_code"
              >
              </InputField>

              <InputField
                :label="$t('global.City')"
                type="text"
                class="md:flex-1"
                v-model="form.city"
              >
              </InputField>
            </div>

            <div class="md:flex">
              <div class="flex flex-col md:flex-1 md:mr-4">
                <label class="mb-3">{{ $t('global.Country') }}</label>
                <div class="flex items-center mb-4">
                  <CountrySelect :country.sync="form.country"></CountrySelect>
                  <div class="pointer-events-none absolute pin-y pin-r flex items-center px-2 text-grey-darker">
                    <svg class="h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"/></svg>
                  </div>
                </div>
              </div>

              <InputField
                :label="$t('global.Email')"
                :class="getValidationClass('email')"
                class="md:flex-1"
                type="email"
                v-model="form.email"
                autocomplete="email"
                :required="true"
              >
                <template v-slot:errors>
                  <span class="error" v-if="!$v.form.email.required">{{ $t('login.emailMustBeEntered') }}</span>
                  <span class="error" v-else-if="!$v.form.email.email">{{ $t('login.notValidEmail') }}</span>
                </template>
              </InputField>
            </div>

            <div class="md:flex">
              <InputField
                :label="$t('global.PhoneNumber')"
                type="text"
                class="md:flex-1 md:mr-4"
                v-model="form.phone"
              >
              </InputField>
              <div class="md:flex-1"></div>
            </div>

            <div class="md:flex">
              <InputField
                :label="$t('global.Password')"
                :class="getValidationClass('password')"
                class="md:flex-1 md:mr-4"
                type="password"
                v-model="form.password"
                autocomplete="off"
              >
                <template v-slot:errors>
                  <span class="error" v-if="!$v.form.password.required">{{ $t('login.passwordMustBeEntered') }}</span>
                  <span class="error" v-else-if="!$v.form.password.passwordStrength">{{ $t('login.passDesc') }}</span>
                </template>
              </InputField>

              <InputField
                :label="$t('global.RepeatPassword')"
                :class="getValidationClass('password_repeat')"
                class="md:flex-1"
                type="password"
                v-model="form.password_repeat"
                autocomplete="off"
              >
                <template v-slot:errors>
                  <span class="error" v-if="!$v.form.password_repeat.required">{{ $t('login.passwordMustBeRepeated') }}</span>
                  <span class="error" v-else-if="!$v.form.password_repeat.sameAsPassword">{{ $t('login.passwordIsDifferent') }}</span>
                </template>
              </InputField>
            </div>

            <button
              class="btn-primary mt-4 mb-8"
              @click.prevent="submit"
            >
              {{ $t('global.Save') }}
            </button>

          </div>
        </div>
      </main>
    </div>
  </div>

</template>

<script>
import CountrySelect from './CountrySelect.vue';
import YogoApi from '@/gateways/YogoApi';
import { mapGetters } from 'vuex';
import Imagefield from './ImageField.vue';
import LoadingAnimation from './LoadingAnimation.vue';
import moment from 'moment';
import InputField from './InputField.vue';
import Imgix from '../services/Imgix';
import CalendarIcon from '../graphics/icons/CalendarIcon.vue';

const { required, email, minLength } = require('vuelidate/lib/validators');

export default {
  name: 'ProfileEdit',
  components: {
    LoadingAnimation,
    Imagefield,
    CountrySelect,
    InputField,
  },
  mixins: [Imgix],
  data() {
    return {
      form: {},
      loading: true,
    };
  },
  computed: {
    ...mapGetters([
      'user',
      'stateReady',
    ]),
  },

  created() {
    if (this.stateReady) this.fetchProfile();
  },
  watch: {
    stateReady(newReadyState) {
      if (newReadyState) this.fetchProfile();
    },
  },
  methods: {
    async fetchProfile() {
      [this.form] = await YogoApi.get(`/users?id=${this.user.id}`);
      this.form.date_of_birth = this.form.date_of_birth ? moment(this.form.date_of_birth)
        .toDate() : null;
      this.originalUser = _.clone(this.form);
      this.loading = false;
    },
    async submit() {
      this.$v.$touch();

      if (this.$v.$invalid) {
        return;
      }

      const userData = _.pick(
        this.form,
        [
          'first_name',
          'last_name',
          'image',
          'address_1',
          'address_2',
          'zip_code',
          'city',
          'country',
          'email',
          'phone',
        ],
      );
      userData.date_of_birth = this.form.date_of_birth ? moment(this.form.date_of_birth).format('YYYY-MM-DD') : null;

      if (this.form.password) {
        userData.password = this.form.password;
      }

      if (userData.email !== this.originalUser.email) {
        const existingUserWithNewEmail = await YogoApi.get('/users' +
          '?email=' + encodeURIComponent(userData.email));
        if (existingUserWithNewEmail && existingUserWithNewEmail.length) {
          alert('Der findes allerede en anden bruger med emailen "' + userData.email + '" i systemet.');
          return;
        }
      }

      const updatedUserData = await YogoApi.put('/users/' + this.user.id, userData);
      updatedUserData.date_of_birth = updatedUserData.date_of_birth ? moment(updatedUserData.date_of_birth)
        .toDate() : null;
      this.form = updatedUserData;

      this.$store.dispatch('updateUser', this.user.id);

      this.$store.commit('postFlashMessage', {
        type: 'MESSAGE_TYPE_INFO',
        text: this.$t('global.YourProfileIsUpdated'),
      });
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
      first_name: {
        required,
      },
      email: {
        required,
        email,
      },
      password: {
        minLength: minLength(4),
      },
      password_repeat: {
        matchPassword(value) {
          return value === this.form.password;
        },
      },

    },

  },


};
</script>
