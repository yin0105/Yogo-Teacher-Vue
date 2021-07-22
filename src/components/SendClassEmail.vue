<template>
  <div class="pb-10">

    <LoadingAnimation v-if="loading"></LoadingAnimation>

    <div v-else>
      <header class="bg-white shadow">
        <div class="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
          <h1 class="text-3xl font-bold leading-tight text-gray-900">
            {{ $t('global.ClassEmails') }}
          </h1>
        </div>
      </header>


      <div class="relative text-center p-10">
        <div
          @click="openEmailModal(null)"
          class="absolute cursor-pointer top-4 right-4 bg-blue p-5 rounded-full shadow-lg text-white"
        >
          <SendEmailIcon></SendEmailIcon>
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


      <div class="wrapper py-4">
        <ClassEmails
          @openEmailModal="openEmailModal"
          :classEmails="classObj.class_emails"
        />
      </div>


      <div class="wrapper" v-if="classObj && classObj.studio_attendance_enabled">
        <h3 class="my-10 text-center font-bold">
          {{ $t('global.AttendeesStudio') }}
        </h3>

        <SignupList
          :classObj="classObj"
          @updateClass="fetchClass"
          @openInfoModal="openInfoModalClassSignup"
          hideActionButtons="true"
        >
        </SignupList>
      </div>

      <div v-if="showWaitlist">
        <h3 class="my-10 text-center font-bold">
          {{ $t('global.WaitList') }}
        </h3>

        <div class="wrapper">
          <WaitList
            hideActionButtons="true"
            :classObj="classObj"
            @openInfoModal="openInfoModalWaitingList"
          >
          </WaitList>
        </div>
      </div>

      <div v-if="classObj && classObj.livestream_enabled">
        <h3 class="my-10 text-center font-bold">
          {{ $t('global.Livestream') }}
        </h3>

        <div class="wrapper">
          <LivestreamSignupList
            :classObj="classObj"
            @openInfoModal="openInfoModalLivestreamSignup"
          >
          </LivestreamSignupList>
        </div>
      </div>

      <Modal
        v-if="showSendEmailModal"
        v-show="showSendEmailModal"
        @close="closeSendEmailModal"
      >
        <template v-slot:header>
          <div class="text-center">
            <h3>
              {{ emailFormEmailId ? $t('global.Edit') : $t('global.Send') }} {{
                $t('global.email')
              }}
              {{ $t('global.toTheAttendeesOn') }}
            </h3>
            <h4>
              {{ classObj.class_type.name }},
              {{
                formatDate(classObj.date + ' ' + classObj.start_time,
                  { weekday: true, time: true })
              }}-{{ classObj.end_time.substr(0, 5) }}
            </h4>
          </div>
        </template>
        <template v-slot:body>
          <div class="mt-1 mb-2 relative">
            <InputField
              :label="$t('global.Subject')"
              :class="getValidationClass('subject')"
              v-model="emailForm.subject"
              type="text"
              :required="true"
            >
              <template v-slot:errors>
              <span class="error" v-if="!$v.emailForm.subject.required">
                {{ $t('global.SubjectIsRequired') }}
              </span>
              </template>
            </InputField>


            <yogo-textarea
              :label="$t('global.Message')"
              :class="getValidationClass('body')"
              v-model="emailForm.body"
              :required="true"
            >
              <template v-slot:errors>
              <span class="error" v-if="!$v.emailForm.body.required">
               {{ $t('global.MessageIsRequired') }}
              </span>
              </template>
            </yogo-textarea>

            <span class="block text-sm">
            {{ $t('global.FollowingCodesCanBeUsed') }} [first_name], [last_name], [email].
          </span>

            <div v-if="!emailForm.email_sent">
              <label class="mt-8 block mb-2">{{ $t('global.Send') }}</label>
              <div class="flex items-center mb-4">
                <select
                  class="block appearance-none w-full bg-grey-lighter border border-grey-lighter text-grey-darker py-2 px-8 pr-8 rounded-sm"
                  v-model="emailForm.sendWhen"
                >
                  <option value="now">{{ $t('global.Now') }}</option>
                  <option value="datetime">{{ $t('global.AtASpecificTime') }}</option>
                </select>
                <div class="pointer-events-none absolute pin-y pin-r flex items-center px-2 text-grey-darker">
                  <svg class="h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"/></svg>
                </div>
              </div>
            </div>

            <p v-else class="my-2">
              {{ $t('global.TheEmailWasSent') }} {{
                formatDate(emailForm.send_at_datetime,
                  { time: true })
              }}
            </p>

            <div class="md:flex md:-mx-4"
                 v-if="emailForm.sendWhen === 'datetime' && !emailForm.email_sent">
              <div class="md:w-6/12 md:px-4">
                <div class="md:flex-1 w-full self-center">
                  <div class="flex md:flex-1">
                    <div class="col w-full">
                      <InputField
                        v-model="emailForm.sendDate"
                        type="date"
                        :label="$t('global.Date')"
                        :required="true"
                      >
                      </InputField>
                    </div>
                  </div>
                </div>
              </div>

              <div class="md:w-6/12 md:px-4">
                <InputField
                  type="text"
                  v-model="emailForm.sendTime"
                  autoFormat="time"
                  :label="$t('global.TimeAsPointInTime')"
                  :required="true"
                >
                </InputField>
              </div>
            </div>

            <div class="block md:flex items-center mb-4 md:mb-0">
              <label class="checkbox">
                <input
                  type="checkbox"
                  v-model="emailForm.send_to_subsequent_signups"
                >
                <span>{{ $t('global.SendAutomaticallyToCustomersWhoSignUpLater') }}</span>
              </label>
            </div>

            <h4 class="mb-2 mt-4">
              {{ $t('global.SendEmailTo') }}
            </h4>
            <div class="block md:flex flex-wrap items-center mb-4 md:mb-0">
              <label class="checkbox mb-2 md:mr-4">
                <input
                  type="checkbox"
                  v-model="emailForm.send_to_signups"
                >
                <span>{{
                    client.settings.livestream_enabled ? $t('global.AttendeesStudio') : $t(
                      'global.Attendees')
                  }}</span>
              </label>
              <label class="checkbox mb-2 md:mr-4">
                <input
                  type="checkbox"
                  v-model="emailForm.send_to_livestream_signups"
                  v-if="client.settings.livestream_enabled"
                >
                <span>{{ $t('global.AttendeesLivestream') }}</span>
              </label>
              <label class="checkbox mb-2">
                <input
                  type="checkbox"
                  v-model="emailForm.send_to_waiting_list" v-if="waitingListEnabled"
                >
                <span>{{ $t('global.WaitList') }}</span>
              </label>
              <span class="error" v-if="!$v.emailForm.sendToSomeone">
              {{ $t('global.EmailMustBeSentToSomeone') }}
            </span>
            </div>

          </div>
          <div class="text-center pb-2" v-if="nowSearching">
            <LoadingDots></LoadingDots>
          </div>
        </template>
        <template v-slot:footer>
          <div class="flex flex-wrap">
            <button
              v-if="showSendButton"
              type="button"
              class="btn btn-primary mb-2 mr-2"
              @click="submit"
            >
              {{ sendButtonText }}
            </button>
            <button
              v-else
              class="btn btn-secondary mb-2 mr-2"
              type="button"
              disabled
            >
              {{ $t('global.ClassHasStartedAndTheEmailHasBeenSent') }}
            </button>

            <button
              v-if="emailFormEmailId && !emailForm.email_sent"
              type="button"
              class="btn btn-custom mb-2 mr-2 bg-red-500 text-white"
              @click="deleteEmail"
            >
              {{ $t('global.DeleteEmail') }}
            </button>

            <button
              type="button"
              class="btn btn-secondary mb-2"
              @click="closeSendEmailModal()"
            >
              {{ $t('global.Close') }}
            </button>
          </div>
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
                        {{ formatDate(signup.class.date) }} {{
                          signup.class.start_time.substr(0, 5)
                        }}
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
                      <span class="text-gray-700">{{
                          infoModalCustomerLastSignup.class.class_type.name
                        }}
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
  </div>
</template>


<script>

import qs from 'qs';
import moment from 'moment-timezone';

import { mapGetters } from 'vuex';
import LoadingAnimation from '@/components/LoadingAnimation.vue';
import LoadingDots from '@/components/LoadingDots.vue';
import dateTimeFunctions from '@/mixins/dateTimeFunctions.vue';
import InputField from './InputField.vue';
import YogoTextarea from './YogoTextarea.vue';
import Imgix from '@/services/Imgix';
import YogoApi from '../gateways/YogoApi';
import Tag from '@/components/Tag.vue';
import CheckmarkUserIcon from '@/graphics/icons/CheckmarkUserIcon.vue';
import LivestreamSignupList from '@/components/LivestreamSignupList.vue';
import WaitList from './WaitList.vue';
import SignupList from './SignupList.vue';
import Modal from './Modal.vue';
import SendEmailIcon from '@/graphics/icons/SendEmailIcon.vue';

import ClassEmails from './ClassForm/ClassEmails.vue';

const { required } = require('vuelidate/lib/validators');

export default {
  name: 'ClassSendEmail',
  components: {
    LoadingDots,
    LoadingAnimation,
    SignupList,
    WaitList,
    InputField,
    YogoTextarea,
    LivestreamSignupList,
    Modal,
    CheckmarkUserIcon,
    Tag,
    SendEmailIcon,
    ClassEmails,
  },
  mixins: [dateTimeFunctions, Imgix],
  data() {
    return {
      loading: true,

      classObj: null,

      currentQueryLoading: '',
      searchResults: [],
      nowSearching: false,

      infoModalSignup: null,
      infoModalCustomer: null,
      showInfoModal: false,
      infoModalSignupType: '',

      showSendEmailModal: false,
      emailForm: {},
      emailFormEmailId: null,
    };
  },
  async created() {
    this.fetchClass();
  },
  computed: {
    ...mapGetters([
      'client',
    ]),

    upToYesterday() {
      return {
        to: moment.tz('Europe/Copenhagen')
          .subtract(1, 'day')
          .toDate(),
      };
    },

    waitingListEnabled() {
      return this.classObj
        && (
          (parseInt(this.classObj.seats) === 1 && this.client.settings.private_class_waiting_list_enabled)
          || (this.classObj.seats > 1 && this.client.settings.class_waiting_list_enabled)
        );
    },

    showSendButton() {
      const classDateString = moment(this.classObj.date)
        .format('YYYY-MM-DD', 'Europe/Copenhagen');
      const classStart = moment.tz(`${classDateString} ${this.classObj.start_time}`,
        'Europe/Copenhagen');
      const now = moment.tz('Europe/Copenhagen');
      return now.isBefore(classStart) || !this.emailForm.email_sent;
    },
    sendButtonText() {
      return !this.emailForm.email_sent && this.emailForm.sendWhen === 'now' ? this.$t('global.Send') : this.$t(
        'global.Save',
      );
    },

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

    async openEmailModal(emailId) {
      this.emailFormEmailId = emailId;
      this.$v.emailForm.$reset();

      let email;
      if (emailId) {
        email = await YogoApi.get(`/class-emails/${emailId}`);

        this.emailForm = {
          subject: email.subject,

          body: email.body,
          send_at_datetime: email.send_at_datetime,
          email_sent: email.email_sent,

          send_to_signups: !!email.send_to_signups,
          send_to_waiting_list: !!email.send_to_waiting_list,
          send_to_livestream_signups: !!email.send_to_livestream_signups,
          send_to_subsequent_signups: !!email.send_to_subsequent_signups,

          // console.log(email.send_at_datetime)
          sendDate: moment.tz(email.send_at_datetime.substr(0, 10),
            'Europe/Copenhagen')
            .toDate(),
          sendTime: email.send_at_datetime.substr(11, 5),
          sendWhen: 'datetime',
        };
      } else {
        this.emailForm = {
          subject: '',
          body: '',
          sendWhen: 'now',
          sendDate: moment.tz('Europe/Copenhagen').toDate(),
          sendTime: moment.tz('Europe/Copenhagen').format('HH:mm'),
          send_to_signups: true,
          send_to_waiting_list: false,
          send_to_livestream_signups: true,
          send_to_subsequent_signups: true,
        };
      }
      this.showSendEmailModal = true;
    },

    async submit() {
      this.$v.$touch();

      if (this.$v.$invalid) {
        return;
      }

      let sendDate;
      let sendDateTime;

      if (this.emailForm.sendWhen === 'datetime') {
        sendDate = moment(this.emailForm.sendDate)
          .format('YYYY-MM-DD');
        sendDateTime = moment.tz(`${sendDate} ${this.emailForm.sendTime}`, 'Europe/Copenhagen');
        if (!this.emailForm.email_sent && sendDateTime.isBefore(moment())) {
          if (!confirm(this.$t('global.SendTimeHasPassedEmailWillBeSentImmediately'))) return;
          this.emailForm.sendWhen = 'now';
        }
      }

      if (this.emailForm.sendWhen === 'now') {
        sendDateTime = moment.tz('Europe/Copenhagen');
      }

      const classStart = moment.tz(`${this.classObj.date} ${this.classObj.start_time}`,
        'YYYY-MM-DD HH:mm',
        'Europe/Copenhagen',
      );

      if (sendDateTime.isAfter(classStart)) {
        if (!confirm(this.$t('global.AreYouSureYouWantToSendEmailToClassAfterClassStart'))) return;
      }

      const submitData = _.pick(
        this.emailForm,
        [
          'subject',
          'body',
          'send_to_signups',
          'send_to_waiting_list',
          'send_to_livestream_signups',
          'send_to_subsequent_signups',
        ],
      );

      let successMessage;
      switch (this.emailForm.sendWhen) {
        case 'now':
          submitData.send_at_datetime = moment.tz('Europe/Copenhagen')
            .format('YYYY-MM-DD HH:mm:ss');
          successMessage = 'Emailen er sendt';
          break;
        case 'datetime':
          submitData.send_at_datetime = sendDateTime.format('YYYY-MM-DD HH:mm:ss');
          if (this.emailForm.email_sent) {
            successMessage = 'Emailen er gemt';
          } else {
            successMessage = 'Emailen er lagt til afsendelse';
          }
          break;
      }

      this.loading = true;

      if (this.emailFormEmailId) {
        await YogoApi.put(`/class-emails/${this.emailFormEmailId}`, submitData);
      } else {
        submitData.class_id = this.classObj.id;
        await YogoApi.post('/class-emails', submitData);
      }

      this.loading = false;

      this.$store.commit('postFlashMessage', {
        type: 'MESSAGE_TYPE_INFO',
        text: successMessage,
      });

      this.closeSendEmailModal();
      this.fetchClass();
    },

    async deleteEmail() {
      if (confirm(this.$t('global.DoYouWantToDeleteThisEmail'))) {
        const response = await YogoApi.delete(`/class-emails/${this.emailFormEmailId}`);

        if (response === 'E_COULD_NOT_DELETE_CLASS_EMAIL') {
          alert('Emailen kunne ikke slettes.');
        } else {
          this.$store.commit('postFlashMessage', {
            type: 'MESSAGE_TYPE_INFO',
            text: 'Emailen blev slettet',
          });
        }

        this.closeSendEmailModal();
        this.fetchClass();
      }
    },

    getValidationClass(fieldName) {
      const field = this.$v.emailForm[fieldName];

      if (field) {
        return {
          invalid: field.$invalid && field.$dirty,
        };
      }
      return {};
    },

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
          'class_emails.instances.recipient',
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
    closeSendEmailModal() {
      this.showSendEmailModal = false;
    },
  },
  watch: {},

  validations: {
    emailForm: {
      subject: {
        required,
      },
      body: {
        required,
      },
      sendToSomeone() {
        return this.emailForm && (
          this.emailForm.send_to_signups
          || this.emailForm.send_to_livestream_signups
          || this.emailForm.send_to_waiting_list
        );
      },

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

.error {
  @apply text-red-500;
}

</style>
