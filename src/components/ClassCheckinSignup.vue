<template>
  <div>

    <LoadingAnimation v-if="loading"></LoadingAnimation>

    <div v-else>
      <header class="bg-white shadow">
        <div class="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
          <h1 class="text-3xl font-bold leading-tight text-gray-900">
            {{ $t('global.CheckinSignup') }}
          </h1>
        </div>
      </header>


      <div class="relative text-center p-10">
        <div @click="openSearchModal"
             class="absolute cursor-pointer top-4 right-4 bg-blue p-5 rounded-full shadow-lg">
          <AddCustomerIcon></AddCustomerIcon>
        </div>
        <h1 class="text-3xl font-bold">
          {{ classObj.class_type.name }}
        </h1>
        <p>
          {{ unknownFormatDateToHumanDate(classObj.date) }}
        </p>
        <p>
          {{ classObj.start_time.substr(0, 5) }}-{{ classObj.end_time.substr(0, 5) }}
        </p>
      </div>

      <div class="wrapper" v-if="classObj && classObj.studio_attendance_enabled">
        <SignupList
          :classObj="classObj"
          @updateClass="fetchClass"
          @checkin="checkin"
          @openInfoModal="openInfoModalClassSignup"
        >
        </SignupList>
      </div>

      <div v-if="showWaitlist">
        <h3 class="my-10 text-center font-bold">
          {{ $t('global.WaitList') }}
        </h3>

        <div class="wrapper">
          <WaitList
            :classObj="classObj"
            @openInfoModal="openInfoModalWaitingList"
            @moveToClass="moveToClass"></WaitList>
        </div>
      </div>

      <div v-if="classObj && classObj.livestream_enabled">
        <h3 class="my-10 text-center font-bold">
          {{ $t('global.Livestream') }}
        </h3>

        <div class="wrapper">
          <LivestreamSignupList
            :classObj="classObj"
            @openInfoModal="openInfoModalLivestreamSignup"></LivestreamSignupList>
        </div>
      </div>
    </div>


    <Modal
      v-show="showSearchModal"
      @close="closeSearchModal"
      :classObj="classObj"
    >
      <template v-slot:header>
        <h3 class="text-center mb-5">
          {{ $t('global.SearchForCustomer') }}
        </h3>
      </template>
      <template v-slot:body>
        <div class="mt-1 mb-2 relative rounded-sm border border-black shadow-sm p-2">
          <input
            autocomplete="off"
            ref="searchInput"
            v-model="searchQuery"
            class="form-input outline-none block w-full pl-7 pr-12 sm:text-sm sm:leading-5"
            :placeholder="$t('global.Search')"
          >
        </div>
        <div class="text-center pb-2" v-if="nowSearching">
          <LoadingDots></LoadingDots>
        </div>
        <SearchResultList
          v-else
          :searchResults="searchResults"
          :classObj="classObj ? classObj : null"
          @closeSearchModal="closeSearchModal"
          @updateClass="fetchClass"></SearchResultList>
      </template>
      <template v-slot:footer>
        <button
          type="button"
          class="btn btn-secondary"
          @click="closeSearchModal()"
        >
          {{ $t('global.Close') }}
        </button>
      </template>
    </Modal>

    <Modal
      v-if="infoModalSignup && infoModalCustomer"
      v-show="showInfoModal"
      @close="closeInfoModal"
    >
      <template v-slot:header>
        <div class="flex justify-center">
          <img class="h-20 w-20 rounded-full mb-5"
               :src="profileImageSrc(infoModalCustomer.image)"
               alt="">
        </div>
        <h3 class="text-center mb-5">
          {{ infoModalSignup.user.first_name }}
        </h3>
        <div v-if="infoModalSignupType === 'class_signup'">
          <div
            v-if="infoModalSignup.checked_in"
            class="flex justify-center mb-4 h-10"
          >
            <CheckmarkUserIcon></CheckmarkUserIcon>
          </div>
          <div class="flex justify-center">
            <button
              type="button"
              class="btn-secondary mr-2"
              @click="cancelCheckin(infoModalSignup)"
              v-if="infoModalSignup.checked_in"
            >
              {{ $t('global.CancelCheckin') }}
            </button>
            <button
              type="button"
              class="btn-primary mr-2"
              @click="checkin(infoModalSignup)"
              v-if="!infoModalSignup.checked_in"
            >
              {{ $t('global.CheckIn') }}
            </button>
            <button type="button" class="btn-alert" @click="cancelBooking(infoModalSignup)">
              {{ $t('global.CancelBooking') }}
            </button>
          </div>
        </div>

        <div
          v-else-if="infoModalSignupType === 'waiting_list'"
          class="flex justify-center"
        >
          <button type="button" class="btn-secondary mr-2" @click="moveToClass(infoModalSignup)">
            {{ $t('global.MoveToClass') }}
          </button>
          <button type="button" class="btn-alert" @click="removeFromWaitlist(infoModalSignup)">
            {{ $t('global.RemoveFromWaitlist') }}
          </button>
        </div>

        <div
          v-else-if="infoModalSignupType === 'livestream_signup'"
          class="flex justify-center"
        >
          <button type="button" class="btn-alert" @click="cancelLivestreamBooking(infoModalSignup)">
            {{ $t('global.CancelBooking') }}
          </button>
        </div>
      </template>

      <template v-slot:body>

        <div class="bg-white shadow overflow-hidden sm:rounded-lg">
          <div class="px-4 py-5 border-b border-gray-200 sm:px-6">
            <h3 class="text-lg leading-6 font-medium text-gray-900">
              {{ $t('global.CustomerInformation') }}
            </h3>
            <div>
              <Tag
                v-if="infoModalSignup.class_is_users_first_class"
                color="green">
                {{ $t('global.New') }}
              </Tag>
              <Tag
                v-if="infoModalSignup.class_is_on_users_birthday"
                color="pink">
                {{ $t('global.Birthday') }}
              </Tag>
            </div>
          </div>
          <div>
            <dl>
              <div class="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                <dt class="text-sm leading-5 font-medium text-gray-500">
                  {{ $t('global.Name') }}
                </dt>
                <dd class="mt-1 text-sm leading-5 text-gray-900 sm:mt-0 sm:col-span-2">
                  {{ infoModalSignup.user.first_name }} {{ infoModalSignup.user.last_name }}
                </dd>
              </div>
              <div class="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                <dt class="text-sm leading-5 font-medium text-gray-500">
                  {{ $t('global.Email') }}
                </dt>
                <dd class="mt-1 text-sm leading-5 text-blue sm:mt-0 sm:col-span-2">
                  <a :href="'mailto:' + infoModalSignup.user.email" target="_blank">
                    {{ infoModalSignup.user.email }}
                  </a>
                </dd>
              </div>
              <div class="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                <dt class="text-sm leading-5 font-medium text-gray-500">
                  {{ $t('global.PhoneNumber') }}
                </dt>
                <dd class="mt-1 text-sm leading-5 sm:mt-0 sm:col-span-2">
                  <a
                    v-if="infoModalSignup.user.phone"
                    :href="'tel:' + infoModalSignup.user.phone"
                    class="text-blue"
                  >
                    {{ infoModalSignup.user.phone }}
                  </a>
                  <span v-else>--</span>
                </dd>
              </div>
              <div class="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                <dt class="text-sm leading-5 font-medium text-gray-500">
                  {{ $t('global.MemberSince') }}
                </dt>
                <dd class="mt-1 text-sm leading-5 text-gray-900 sm:mt-0 sm:col-span-2">
                  {{ formatDate(infoModalSignup.user.createdAt) }}
                </dd>
              </div>
              <div class="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                <dt class="text-sm leading-5 font-medium text-gray-500">
                  {{ $t('global.DateOfBirth') }}
                </dt>
                <dd class="mt-1 text-sm leading-5 text-gray-900 sm:mt-0 sm:col-span-2">
                  {{ formatDate(infoModalSignup.user.date_of_birth) || '--' }}
                </dd>
              </div>
              <div class="bg-white px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                <dt class="text-sm leading-5 font-medium text-gray-500">
                  {{ $t('global.ActiveMemberships') }}
                </dt>
                <dd class="mt-1 text-sm leading-5 text-gray-900 sm:mt-0 sm:col-span-2">
                  <div v-for="membership in infoModalCustomerActiveMemberships"
                       :key="'membership_' + membership.id">
                    {{ membership.membership_type.name }}
                  </div>
                  <span v-if="!infoModalCustomerActiveMemberships.length">--</span>
                </dd>
              </div>
              <div class="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                <dt class="text-sm leading-5 font-medium text-gray-500">
                  {{ $t('global.ActiveAccessCards') }}
                </dt>
                <dd class="mt-1 text-sm leading-5 text-gray-900 sm:mt-0 sm:col-span-2">
                  <div
                    v-for="classPass in infoModalCustomerActiveClassPasses"
                    class="mb-2"
                    :key="'class_pass_' + classPass.id">
                    <div class="font-extrabold">
                      {{ classPass.class_pass_type.name }}:
                    </div>
                    <div
                      v-if="classPass.class_pass_type.pass_type === 'fixed_count'"
                      class="text-gray-700"
                    >
                      {{ $t('global.ClassesLeft') }}: {{ classPass.classes_left }}
                    </div>
                    <div class="text-gray-700">
                      {{ $t('global.ValidUntil') }}:
                      {{ formatDate(classPass.valid_until) }}
                    </div>
                  </div>
                  <span v-if="!infoModalCustomerActiveClassPasses.length">--</span>
                </dd>
              </div>
              <div class="bg-white px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                <dt class="text-sm leading-5 font-medium text-gray-500">
                  {{ $t('global.UpcomingClasses') }}
                </dt>
                <dd class="mt-1 text-sm leading-5 text-gray-900 sm:mt-0 sm:col-span-2">
                  <div
                    v-for="signup in infoModalCustomerFutureSignups"
                    class="mb-2"
                    :key="'futuresignup_' + signup.id + '_' + signup.signupType"
                  >
                    <div>
                      {{ formatDate(signup.class.date) }} {{ signup.class.start_time.substr(0, 5) }}
                    </div>
                    <span class="text-gray-700">
                      {{ signup.class.class_type.name }}
                      <span v-if="signup.signupType === 'livestream'">(LIVESTREAM)</span>
                    </span>
                  </div>
                  <span v-if="!infoModalCustomerFutureSignups.length">--</span>
                </dd>
              </div>
              <div class="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                <dt class="text-sm leading-5 font-medium text-gray-500">
                  {{ $t('global.LatestVisit') }}
                </dt>
                <dd class="mt-1 text-sm leading-5 text-gray-900 sm:mt-0 sm:col-span-2">
                  <div v-if="infoModalCustomerLastSignup">
                    <div>{{ formatDate(infoModalCustomerLastSignup.class.date) }}
                    {{ infoModalCustomerLastSignup.class.start_time.substr(0, 5) }}
                    </div>
                    <span class="text-gray-700">{{ infoModalCustomerLastSignup.class.class_type.name }}
                      <span v-if="infoModalCustomerLastSignup.signupType === 'livestream'">
                        (LIVESTREAM)
                      </span>
                    </span>
                  </div>
                  <span v-else>--</span>
                </dd>
              </div>
              <div class="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                <dt class="text-sm leading-5 font-medium text-gray-500">
                  {{ $t('global.AdditionalInfo') }}
                </dt>
                <dd class="mt-1 text-sm leading-5 text-gray-900 sm:mt-0 sm:col-span-2">
                  {{ infoModalCustomer.customer_additional_info }}
                </dd>
              </div>
            </dl>
          </div>
        </div>

      </template>
      <template v-slot:footer>
        <button
          type="button"
          class="btn btn-secondary"
          @click="closeInfoModal()"
        >
          {{ $t('global.Close') }}
        </button>
      </template>
    </Modal>

  </div>


</template>


<script>

import qs from 'qs';
import moment from 'moment-timezone';

import { mapGetters } from 'vuex';
import LoadingAnimation from '@/components/LoadingAnimation.vue';
import LoadingDots from '@/components/LoadingDots.vue';
import AddCustomerIcon from '@/graphics/icons/AddCustomerIcon.vue';
import dateTimeFunctions from '@/mixins/dateTimeFunctions.vue';
import Imgix from '@/services/Imgix';
import YogoApi from '../gateways/YogoApi';
import Tag from '@/components/Tag.vue';
import CheckmarkUserIcon from '@/graphics/icons/CheckmarkUserIcon.vue';
import SearchResultList from '@/components/SearchResultList.vue';
import LivestreamSignupList from '@/components/LivestreamSignupList.vue';
import WaitList from './WaitList.vue';
import SignupList from './SignupList.vue';
import Modal from './Modal.vue';

export default {
  name: 'ClassCheckinSignup',
  components: {
    SearchResultList,
    LoadingDots,
    LoadingAnimation,
    AddCustomerIcon,
    SignupList,
    WaitList,
    LivestreamSignupList,
    Modal,
    CheckmarkUserIcon,
    Tag,
  },
  mixins: [dateTimeFunctions, Imgix],
  data() {
    return {
      loading: true,

      classObj: null,

      searchQuery: '',
      currentQueryLoading: '',
      searchResults: [],
      nowSearching: false,

      infoModalSignup: null,
      infoModalCustomer: null,
      showInfoModal: false,
      infoModalSignupType: '',

      showSearchModal: false,
    };
  },
  async created() {
    this.fetchClass();
  },
  computed: {
    ...mapGetters([
      'client',
    ]),
    infoModalCustomerActiveMemberships() {
      if (!this.infoModalCustomer) return [];
      return _.filter(
        this.infoModalCustomer.memberships,
        membership => membership.status === 'active' || membership.status === 'cancelled_running',
      );
    },
    infoModalCustomerActiveClassPasses() {
      if (!this.infoModalCustomer) return [];
      return _.filter(
        this.infoModalCustomer.class_passes,
        (classPass) => {
          const classPassHasClassesLeft = classPass.class_pass_type.pass_type === 'unlimited'
            || classPass.classes_left > 0;
          const classPassIsUsedForSignup = this.infoModalSignup.used_class_pass
            && parseInt(classPass.id, 10) === parseInt(
              this.infoModalSignup.used_class_pass.id,
              10,
            );
          const classPassIsValidForToday = moment.tz(classPass.valid_until, 'Europe/Copenhagen')
            .isSameOrAfter(moment.tz('Europe/Copenhagen'), 'day');
          return (classPassHasClassesLeft || classPassIsUsedForSignup)
            && classPassIsValidForToday;
        },
      );
    },
    infoModalCustomerFutureSignups() {
      if (!this.infoModalCustomer) return [];
      return _.chain(this.infoModalCustomer.class_livestream_signups)
        .each((livestreamSignup) => {
          livestreamSignup.signupType = 'livestream';
        })
        .concat(this.infoModalCustomer.class_signups)
        .filter(
          signup => moment.tz(
            `${signup.class.date} ${signup.class.start_time}`,
            'Europe/Copenhagen',
          ).isAfter(moment.tz('Europe/Copenhagen'), 'minute'),
        )
        .sortBy(signup => `${signup.class.date}${signup.class.start_time}`)
        .value();
    },
    infoModalCustomerLastSignup() {
      if (!this.infoModalCustomer) return [];
      return _.chain(this.infoModalCustomer.class_livestream_signups)
        .each((livestreamSignup) => {
          livestreamSignup.signupType = 'livestream';
        })
        .concat(this.infoModalCustomer.class_signups)
        .filter(
          signup => moment.tz(
            `${signup.class.date} ${signup.class.start_time}`,
            'Europe/Copenhagen',
          ).isBefore(
            moment.tz('Europe/Copenhagen'),
            'minute',
          ),
        )
        .sortBy(signup => `${signup.class.date}${signup.class.start_time}`)
        .reverse()
        .value()[0];
    },
    showWaitlist() {
      return this.classObj && this.classObj.studio_attendance_enabled && (
        (this.classObj.seats === 1 && this.client.settings.private_class_waiting_list_enabled)
        || (this.classObj.seats > 1 && this.client.settings.class_waiting_list_enabled)
      );
    },
  },
  methods: {
    async fetchClass() {
      const queryString = qs.stringify({
        id: this.$route.params.id,
        populate: [
          'class_type',
          'class_is_fully_booked',
          'signups.user.image',
          'signups.class_is_users_first_class',
          'signups.class_is_on_users_birthday',

          'waiting_list_signups.user.image',
          'waiting_list_signups.class_is_users_first_class',
          'waiting_list_signups.class_is_on_users_birthday',
          'livestream_signups',
          'livestream_signups.user',
          'livestream_signups.user.image',
          'livestream_signups.class_is_users_first_class',
          'livestream_signups.class_is_on_users_birthday',
        ],
      });
      [this.classObj] = (await YogoApi.get(`/classes?${queryString}`)).classes;

      this.loading = false;
    },
    openInfoModalClassSignup(signup) {
      this.openInfoModal(signup, 'class_signup');
    },
    openInfoModalWaitingList(signup) {
      this.openInfoModal(signup, 'waiting_list');
    },
    openInfoModalLivestreamSignup(signup) {
      this.openInfoModal(signup, 'livestream_signup');
    },
    async openInfoModal(signup, signupType) {
      this.infoModalSignup = signup;
      this.infoModalSignupType = signupType;
      const customerQueryString = qs.stringify({
        populate: [
          'image',
          'memberships.membership_type',
          'class_passes.class_pass_type',
          'class_signups.class.class_type',
          'class_livestream_signups.class.class_type',
          'class_waiting_list_signups.class.class_type',
        ],
        id: this.infoModalSignup.user.id,
      });
      [this.infoModalCustomer] = await YogoApi.get(`/users?${customerQueryString}`);
      this.showInfoModal = true;
    },
    closeInfoModal() {
      this.showInfoModal = false;
    },
    openSearchModal() {
      this.searchResults = [];
      this.searchQuery = '';
      this.showSearchModal = true;
      setTimeout(() => {
        this.$refs.searchInput.focus();
      }, 100);
    },
    closeSearchModal() {
      this.showSearchModal = false;
    },
    async doSearch() {
      if (this.searchQuery === this.currentQueryLoading) {
        return;
      }

      if (this.searchQuery === '') {
        this.currentQueryLoading = '';
        this.customers = [];
        return;
      }
      this.nowSearching = true;

      this.currentQueryLoading = this.searchQuery;
      const queryString = qs.stringify({
        searchQuery: this.searchQuery,
      });
      this.searchResults = await YogoApi.get(`/users?${queryString}`);

      this.nowSearching = false;

      if (this.searchQuery !== this.currentQueryLoading) {
        // console.log('new query waiting: ', this.searchQuery)
        this.doSearch();
      }
    },
    async checkin(signup) {
      await YogoApi.put(`/class-signups/${signup.id}`, { checked_in: Date.now() });
      this.$store.commit('postFlashMessage', {
        type: 'MESSAGE_TYPE_INFO',
        text: this.$t('global.customerNameIsNowCheckedIn',
          { customerName: `${signup.user.first_name} ${signup.user.last_name}` }),
      });
      this.closeInfoModal();
      this.fetchClass();
    },
    async cancelCheckin(signup) {
      await YogoApi.put(`/class-signups/${signup.id}`, { checked_in: 0 });
      this.$store.commit('postFlashMessage', {
        type: 'MESSAGE_TYPE_INFO',
        text: this.$t('global.customerNameCheckinIsNowCancelled',
          { customerName: `${signup.user.first_name} ${signup.user.last_name}` }),
      });
      this.closeInfoModal();
      this.fetchClass();
    },
    async cancelBooking(signup) {
      if (!confirm(this.$t('global.AreYouSureYouWantToCancelBooking'))) return;
      await YogoApi.delete(`/class-signups/${signup.id}`);
      this.$store.commit('postFlashMessage', {
        type: 'MESSAGE_TYPE_INFO',
        text: this.$t('global.BookingHasBeenCancelled'),
      });
      this.closeInfoModal();
      this.fetchClass();
    },
    async cancelLivestreamBooking(signup) {
      if (!confirm(this.$t('global.AreYouSureYouWantToCancelBooking'))) return;
      await YogoApi.delete(`/class-livestream-signups/${signup.id}`);
      this.$store.commit('postFlashMessage', {
        type: 'MESSAGE_TYPE_INFO',
        text: this.$t('global.BookingHasBeenCancelled'),
      });
      this.closeInfoModal();
      this.fetchClass();
    },
    async removeFromWaitlist(signup) {
      if (!confirm(this.$t('global.AreYouSureYouWantToRemoveCustomerFromWaitlist'))) return;
      await YogoApi.delete(`/class-waiting-list-signups/${signup.id}`);
      this.$store.commit('postFlashMessage', {
        type: 'MESSAGE_TYPE_INFO',
        text: this.$t('global.CustomerWasRemovedFromWaitlist'),
      });
      this.closeInfoModal();
      this.fetchClass();
    },
    async moveToClass(signup) {
      if (!confirm(this.$t('global.AreYouSureYouWantToMoveCustomerFromWaitlistToClass'))) return;
      await YogoApi.post(`/class-waiting-list-signups/${signup.id}/convert-to-class-signup`);

      this.$store.commit('postFlashMessage', {
        type: 'MESSAGE_TYPE_INFO',
        text: this.$t('global.CustomerNameIsNowSignedUpForTheClass',
          { customerName: `${signup.user.first_name} ${signup.user.last_name}` }),
      });
      this.fetchClass();
    },
  },
  watch: {
    async searchQuery() {
      this.doSearch();
    },
  },

};

</script>

<style lang="scss">
.top-4 {
  top: 1rem;
}

.top-4 {
  right: 1rem;
}
</style>
