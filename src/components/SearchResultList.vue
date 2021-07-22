<template>
  <div class="flex flex-col">
    <div class="-my-2 sm:-mx-6 lg:-mx-8">
      <div class="py-2 align-middle sm:px-6 lg:px-8">
        <div class="shadow border-b overflow-scroll border-gray-200">
          <table class="min-w-full overflow-scroll divide-y divide-gray-200">

            <tbody class="bg-white divide-y divide-gray-200">
            <tr v-for="customer in searchResults" :key="'customer_' + customer.id">
              <td class="px-auto py-4 whitespace-no-wrap">
                <div class="flex items-center">
                  <div class="mx-2 flex-shrink-0 h-10 w-10">
                    <img class="h-10 w-10 rounded-full"
                         :src="profileImageSrc(customer.image)"
                         alt="">
                  </div>
                  <div class="ml-4">
                    <div class="text-sm leading-5 font-medium text-gray-900">
                      {{ customer.first_name }} {{ customer.last_name }}
                    </div>
                    <div class="text-sm fkex leading-5 text-gray-500">
                      <div class="text-sm leading-5 text-gray-500">
                        {{ customer.email }}
                      </div>
                    </div>
                  </div>
                </div>
              </td>

              <td class="px-auto py-4 whitespace-no-wrap">
                <button type="button" v-if="classObj.studio_attendance_enabled" class="btn-primary inline-flex"
                     @click="openCheckinOnSignupModalWithCustomer(customer)">
                  {{ $t('global.SignUp') }}
                </button>
                <button type="button" v-if="classObj.studio_attendance_enabled && classObj.class_is_fully_booked"
                     class="btn-secondary inline-flex ml-2"
                     @click="signupCustomerForWaitingList(customer)">
                  {{ $t('global.SignUpForWaitlist') }}
                </button>
                <button type="button" v-if="classObj.livestream_enabled" class="btn-secondary inline-flex ml-2"
                     @click="signupCustomerForLivestream(customer)">
                  {{ $t('global.SignUpForLivestream') }}
                </button>
              </td>
            </tr>

            </tbody>
          </table>
        </div>
      </div>
    </div>

    <Modal v-show="showCheckinOnSignupModal" @close="closeCheckinOnSignupModal">
      <template v-slot:header>{{ $t('global.CheckCustomerInQuestionMark') }}</template>
      <template v-slot:footer>
        <button type="button" class="btn btn-secondary"
                @click="closeCheckinOnSignupModal()"
        >
          {{ $t('global.Dismiss') }}
        </button>
        <button type="button" class="btn btn-secondary ml-2"
                @click="signupCustomer(checkinOnSignupModalCustomer, false)"
        >
          {{ $t('global.No') }}
        </button>
        <button type="button" class="btn btn-primary ml-2"
                @click="signupCustomer(checkinOnSignupModalCustomer, true)"
        >
          {{ $t('global.Yes') }}
        </button>
      </template>

    </Modal>
  </div>
</template>

<script>
import Imgix from '@/services/Imgix';
import YogoApi from '../gateways/YogoApi';
import Modal from '@/components/Modal';

export default {
  name: 'SearchResultList',
  components: { Modal },
  mixins: [Imgix],
  props: ['searchResults', 'classObj'],
  data() {
    return {
      showCheckinOnSignupModal: false,
      checkinOnSignupModalCustomer: null,
    };
  },
  methods: {
    async openCheckinOnSignupModalWithCustomer(customer) {
      this.checkinOnSignupModalCustomer = customer;
      this.showCheckinOnSignupModal = true;
    },
    async signupCustomer(customer, checkCustomerInOnSignup) {
      const result = await YogoApi.post('/class-signups', {
        class: this.classObj.id,
        user: customer.id,
        checked_in: checkCustomerInOnSignup,
      });
      console.log(result);
      this.closeCheckinOnSignupModal();
      if (result.error) {
        this.$store.commit('showAlert', {
          title: result.error.localized_title,
          message: result.error.localized_message,
        });
        return;
      }
      this.$store.commit('postFlashMessage', {
        type: 'MESSAGE_TYPE_INFO',
        text: this.$t(
          'global.CustomerNameIsNowSignedUpForTheClass',
          { customerName: `${customer.first_name} ${customer.last_name}` },
        ),
      });
      this.$emit('updateClass');
      this.$emit('closeSearchModal');
    },

    async signupCustomerForLivestream(customer) {
      const result = await YogoApi.post('/class-livestream-signups', {
        class: this.classObj.id,
        user: customer.id,
      });
      console.log(result);
      if (result.error) {
        this.$store.commit('showAlert', {
          title: result.error.localized_title,
          message: result.error.localized_message,
        });
        return;
      }

      this.$store.commit('postFlashMessage', {
        type: 'MESSAGE_TYPE_INFO',
        text: this.$t(
          'global.CustomerNameIsNowSignedUpForLivestream',
          { customerName: `${customer.first_name} ${customer.last_name}` },
        ),
      });
      this.$emit('updateClass');
      this.$emit('closeSearchModal');
    },

    async signupCustomerForWaitingList(customer) {
      const result = await YogoApi.post('/class-waiting-list-signups', {
        class: this.classObj.id,
        user: customer.id,
      });
      console.log(result);
      if (result.error) {
        this.$store.commit('showAlert', {
          title: result.error.localized_title,
          message: result.error.localized_message,
        });
        return;
      }

      this.$store.commit('postFlashMessage', {
        type: 'MESSAGE_TYPE_INFO',
        text: this.$t(
          'global.CustomerNameIsAddedToWaitlist',
          { customerName: `${customer.first_name} ${customer.last_name}` },
        ),
      });
      this.$emit('updateClass');
      this.$emit('closeSearchModal');
    },
    closeCheckinOnSignupModal() {
      this.showCheckinOnSignupModal = false;
    },
  },
};
</script>
