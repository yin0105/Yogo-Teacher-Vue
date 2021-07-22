<template>
  <div>
    <header class="bg-white shadow">
      <div class="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        <h1 class="text-3xl font-bold leading-tight text-gray-900">
          {{ $t('global.mySchedule') }}
          <button class="btn btn-secondary"
                  @click="openIcalFeedModal"
                  v-tooltip="{
              content: $t('global.exportCalendar'),
              offset: 5,
            }"
          >
            <ExportCalendarIcon></ExportCalendarIcon>
          </button>
        </h1>
      </div>
    </header>

    <main>
      <div class="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div class="px-4 py-6 sm:px-0">

          <div class="md:flex">
            <div>
              <span class="flex-shrink-0 ml-3 flex items-center rounded-full py-1 bg-gray-100">
                <CalendarIcon></CalendarIcon>
                <span
                  class="ml-2 text-xs leading-5 font-medium uppercase tracking-wider text-gray-500">
                  {{ $t('global.chooseDate') }}
                </span>
              </span>

              <div class="flex mb-4 md:mb-10">
                <div class="col">
                  <datepicker
                    v-model="selectedDate"
                  >
                  </datepicker>
                </div>
              </div>
            </div>

            <div class="flex mb-4">
              <button @click="goToPreviousWeek" class="outline-none">
                <ArrowLeftIcon></ArrowLeftIcon>
              </button>

              <button class="btn-secondary mx-4 h-10 self-center" @click="goToToday">
                {{ $t('global.today') }}
              </button>

              <button @click="goToNextWeek" class="outline-none">
                <ArrowRightIcon></ArrowRightIcon>
              </button>
            </div>
          </div>

          <loading-animation v-if="loading"></loading-animation>

          <div class="flex flex-col" v-else>

            <div class="-my-2 py-2 overflow-x-auto sm:-mx-6 sm:px-6 lg:-mx-8 lg:px-8">
              <div
                v-for="(day, dayIdx) in daysWithCalendarItems"
                :key="'day_' + dayIdx"
                class="mb-16"
                :ref="'date_' + day.calendarItems[0].date"
              >
                <h3 class="text-lg leading-6 font-medium text-gray-900 mb-4 font-bold">
                  {{ day.date | moment('dddd [d.] D. MMMM YYYY') }}{{
                    dateIsToday(day.date) ? ' (' +
                      $t('global.today') + ')' : ''
                  }}
                </h3>
                <div
                  class="align-middle inline-block min-w-full shadow-sm overflow-hidden sm:rounded-md border-b border-gray-200">

                  <table
                    class="min-w-full"
                  >
                    <thead>
                    <tr>
                      <th
                        class="th"
                        :class="{ 'th-today' : dateIsToday(day.date) }"
                      >
                        {{ $t('global.classSlashEvent') }}
                      </th>
                      <th
                        :class="{ 'th-today' : dateIsToday(day.date) }"
                        class="th"
                      >
                        {{ $t('global.classTime') }}
                      </th>
                      <th
                        :class="{ 'th-today' : dateIsToday(day.date) }"
                        class="th"
                      >
                        {{ $t('global.Place') }}
                      </th>

                      <th
                        :class="{ 'th-today' : dateIsToday(day.date) }"
                        class="th"
                      >
                        {{ $t('global.CheckinSignup') }}
                      </th>

                      <th
                        :class="{ 'th-today' : dateIsToday(day.date) }"
                        class="th"
                        v-if="client.settings.livestream_enabled"
                      >
                        {{ $t('global.Livestream') }}
                      </th>
                      <th
                        :class="{ 'th-today' : dateIsToday(day.date) }"
                        class="th"
                      >
                        {{ $t('global.SendEmail') }}
                      </th>
                      <th
                        :class="{ 'th-today' : dateIsToday(day.date) }"
                        class="th"
                        v-if="client.settings.livestream_enabled"
                      >
                        {{ $t('global.LivestreamSignups') }}
                      </th>
                      <th
                        :class="{ 'th-today' : dateIsToday(day.date) }"
                        class="th"
                      >
                        {{ $t('global.Signups') }}
                      </th>
                      <th
                        :class="{ 'th-today' : dateIsToday(day.date) }"
                        class="th"
                        v-if="(client.settings.class_waiting_list_enabled
                        || client.settings.private_class_waiting_list_enabled)"
                      >
                        {{ $t('global.WaitList') }}
                      </th>
                      <th
                        :class="{ 'th-today' : dateIsToday(day.date) }"
                        class="th"
                      >
                        {{ $t('global.classTeacher') }}
                      </th>
                    </tr>
                    </thead>
                    <tbody class="bg-white">
                    <tr v-for="calendarItem in day.calendarItems"
                        :class="{'class-cancelled' : calendarItem.cancelled}"
                        :key="'class_' + calendarItem.id">
                      <td class="td">
                        <div class="text-sm leading-5 text-gray-900" v-if="calendarItem.class_type">
                          {{
                            calendarItem.class_type.name + (calendarItem.cancelled ? ' (AFLYST)' :
                              '')
                          }}
                        </div>
                        <div class="text-sm leading-5 text-gray-500" v-if="calendarItem.class_type">
                          {{ calendarItem.subtitle || '--' }}
                        </div>
                        <div v-else>
                          {{ calendarItem.event.name }}
                        </div>
                      </td>
                      <td class="td">
                        {{
                          calendarItem.start_time.substr(0, 5) + '-' +
                          calendarItem.end_time.substr(0, 5)
                        }}
                      </td>
                      <td class="td">
                        <div class="text-sm leading-5 text-gray-900">
                          <span v-if="calendarItem.class_type">
                          {{ calendarItem.room ? calendarItem.room.name : '--' }}
                          </span>
                          <span v-if="calendarItem.event">
                          {{ calendarItem.event.room ? calendarItem.event.room.name : '--' }}
                          </span>
                        </div>
                        <div class="text-sm leading-5 text-gray-500">
                          <span v-if="calendarItem.class_type">
                          {{
                              calendarItem.room && calendarItem.room.branch
                                ? calendarItem.room.branch.name
                                : '--'
                            }}
                          </span>
                          <span v-if="calendarItem.event">
                            {{
                              calendarItem.event.room && calendarItem.event.room.branch
                                ? calendarItem.event.room.branch.name
                                : '--'
                            }}
                          </span>
                        </div>
                      </td>

                      <td
                        class="td"
                      >
                        <router-link
                          class="btn btn-primary"
                          v-if="calendarItem.class_type"
                          :to="{name: 'ClassCheckinSignup', params: {id: calendarItem.id}}"
                        >
                          {{ $t('global.CheckinSignup') }}
                        </router-link>
                      </td>


                      <td
                        class="td"
                        v-if="client.settings.livestream_enabled"
                      >
                        <router-link
                          class="btn btn-primary"
                          :to="{name: 'LivestreamClassPreloader', params: {classId: calendarItem.id}}"
                          v-if="calendarItem.livestream_enabled && calendarItem.class_starts_today"
                        >
                          {{ $t('global.OpenLivestream') }}
                        </router-link>
                        <span v-else>--</span>
                      </td>
                      <td
                        class="td"
                      >
                        <router-link
                          class="btn btn-primary"
                          v-if="calendarItem.class_type"
                          :to="{name: 'SendClassEmail', params: {id: calendarItem.id}}"
                        >
                          {{ $t('global.Emails') }}
                        </router-link>
                      </td>
                      <td
                        class="td"
                        v-if="client.settings.livestream_enabled"
                      >
                        {{
                          calendarItem.livestream_enabled ? calendarItem.livestream_signup_count :
                            '--'
                        }}
                      </td>
                      <td class="td">
                            <span v-if="calendarItem.studio_attendance_enabled">
                              {{ calendarItem.signup_count }}/{{ calendarItem.seats }}
                            </span>
                        <span v-else-if="calendarItem.event">
                          {{ calendarItem.event.signup_count }}/{{ calendarItem.event.seats }}
                        </span>
                        <span v-else>--</span>
                      </td>
                      <td
                        class="td"
                        v-if="(client.settings.class_waiting_list_enabled
                        || client.settings.private_class_waiting_list_enabled)"
                      >
                        <span v-if="calendarItem.studio_attendance_enabled">
                          {{ calendarItem.waiting_list_count }}/{{ calendarItem.waiting_list_max }}
                        </span>
                        <span v-else>--</span>
                      </td>
                      <td class="td">
                        {{ getTeacherNames(calendarItem) }}
                      </td>
                    </tr>
                    </tbody>

                  </table>
                </div>
              </div>
              <div v-if="!daysWithCalendarItems.length">
                -- Ingen klasser --
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>

    <Modal
      v-show="showIcalFeedUrlModal"
      @close="closeIcalFeedModal"
    >
      <template v-slot:header>
        <h3>
          {{ $t('global.exportCalendar') }}
        </h3>
      </template>
      <template v-slot:body>
        <p>
          {{ $t('global.copyPasteCalendarFeedExplanation') }}
        </p>
        <div
          ref="calendarFeedTextarea"
          class="bg-gray-200 rounded-sm w-full p-4 my-2 overflow-scroll scrolling-touch relative"
        >
          {{ user.teacher_ical_feed_url }}
          <div v-if="showIcalFeedUrlCopySuccess"
               class="absolute inset-0 bg-white flex justify-center items-center center">
            {{ $t('global.copiedToClipboard') }}
          </div>
        </div>
        <button class="btn btn-primary mb-4" @click="copyIcalFeedUrl">
          {{ $t('global.copyToClipboard') }}
        </button>
        <p>
          {{ $t('global.copyPasteCalendarFeedDisclaimer') }}
        </p>
      </template>
      <template v-slot:footer>
        <button
          type="button"
          class="btn btn-primary"
          @click="closeIcalFeedModal()"
        >
          {{ $t('global.Close') }}
        </button>
      </template>
    </Modal>
  </div>

</template>

<script>

import moment from 'moment-timezone';
import { mapGetters } from 'vuex';
import qs from 'qs';
import Datepicker from '@/components/Datepicker.vue';
import YogoApi from '../gateways/YogoApi';
import LoadingAnimation from './LoadingAnimation.vue';
import CalendarIcon from '../graphics/icons/CalendarIcon.vue';
import ArrowLeftIcon from '../graphics/icons/ArrowLeftIcon.vue';
import ArrowRightIcon from '../graphics/icons/ArrowRightIcon.vue';
import Modal from './Modal.vue';
import ExportCalendarIcon from '../graphics/icons/ExportCalendarIcon.vue';

export default {
  name: 'MySchedule',
  components: {
    ExportCalendarIcon,
    Modal,
    ArrowRightIcon,
    ArrowLeftIcon,
    LoadingAnimation,
    Datepicker,
    CalendarIcon,
  },
  data() {
    return {
      loading: true,
      selectedDate: this.$route.params.date ? moment(this.$route.params.date, 'YYYY-MM-DD')
        .toDate() : new Date(),
      lastSelectedDate: this.$route.params.date ? moment(this.$route.params.date, 'YYYY-MM-DD')
        .toDate() : new Date(),

      days: [],
      moment,

      showIcalFeedUrlModal: false,
      showIcalFeedUrlCopySuccess: false,

      scrollToCurrentDateDone: false,
    };
  },
  computed: {
    ...mapGetters([
      'stateReady',
      'client',
      'user',
    ]),
    daysWithCalendarItems() {
      return _.filter(this.days, d => d.calendarItems.length);
    },
  },
  methods: {
    getDateByIndex(idx) {
      return moment(this.selectedDate)
        .startOf('isoWeek')
        .add(idx, 'days');
    },

    scrollToCurrentDate() {
      if (this.scrollToCurrentDateDone) return;
      const startDate = moment(this.selectedDate)
        .startOf('isoWeek');

      const endDate = moment(startDate)
        .add(6, 'days');

      const today = moment.tz('Europe/Copenhagen');
      if (today.isSameOrAfter(startDate, 'day') && today.isSameOrBefore(endDate, 'day')) {
        const todayDate = today.format('YYYY-MM-DD');
        const refName = `date_${todayDate}`;
        this.$nextTick(() => {
          if (this.$refs[refName]) {
            this.scrollToCurrentDateDone = true;
            this.$smoothScroll({
              scrollTo: this.$refs[refName][0],
            });
          }
        });
      }
    },

    async fetchClassesForWeek() {
      this.loading = true;

      const startDate = moment(this.selectedDate)
        .startOf('isoWeek');

      const endDate = moment(startDate)
        .add(6, 'days');

      const classesQuery = {
        startDate: startDate.format('YYYY-MM-DD'),
        endDate: endDate.format('YYYY-MM-DD'),
        populate: [
          'class_type',
          'teachers',
          'room',
          'room.branch',
          'signup_count',
          'waiting_list_count',
          'waiting_list_max',
          'livestream_signup_count',
          'class_starts_today',
        ],
        sort: ['date ASC', 'start_time ASC'],
      };
      if (!this.user.teacher_can_manage_all_classes && !this.user.admin) {
        classesQuery.teacher = this.user.id;
      }
      const classesQueryString = qs.stringify(classesQuery);
      const eventTimeSlotsQueryString = qs.stringify({
        startDate: startDate.format('YYYY-MM-DD'),
        endDate: endDate.format('YYYY-MM-DD'),
        teacher: this.user.id,
        populate: [
          'event.teachers',
          'event.room.branch',
          'event.signup_count',
        ],
        sort: ['date ASC', 'start_time ASC'],
      });

      const [{ classes: allClasses }, eventTimeSlots] = await Promise.all([
        YogoApi.get(`/classes?${classesQueryString}`),
        YogoApi.get(`/event-time-slots?${eventTimeSlotsQueryString}`),
      ]);

      let allCalendarItems = _.concat(allClasses, eventTimeSlots);

      allCalendarItems = _.sortBy(allCalendarItems, ['date', 'start_time']);
      for (let i = 0; i <= 6; i += 1) {
        this.$set(this.days, i, {});
        this.$set(this.days[i], 'date', this.getDateByIndex(i));
        const formattedDate = this.days[i].date.format('YYYY-MM-DD');
        const calendarItemsForDay = _.takeWhile(
          allCalendarItems,
          cls => moment(cls.date).format('YYYY-MM-DD') === formattedDate,
        );
        this.$set(
          this.days[i],
          'calendarItems',
          calendarItemsForDay,
        );
        allCalendarItems.splice(0, this.days[i].calendarItems.length);
      }

      this.loading = false;

      this.scrollToCurrentDate();

    },
    getTeacherNames(calendarItem) {
      const teachers = calendarItem.event ? calendarItem.event.teachers : calendarItem.teachers;
      if (!teachers) return '--';
      return _.map(
        teachers,
        teacher => `${teacher.first_name} ${teacher.last_name}`.trim(),
      ).join(', ');
    },
    onSelectClass(classItem) {
      this.$router.push({
        name: 'ClassEdit',
        params: { id: classItem.id },
      });
    },
    goToPreviousWeek() {
      this.selectedDate = moment(this.selectedDate)
        .subtract(1, 'week')
        .toDate();
    },
    goToToday() {
      this.selectedDate = moment()
        .toDate();
    },
    goToNextWeek() {
      this.selectedDate = moment(this.selectedDate)
        .add(1, 'week')
        .toDate();
    },
    dateIsToday(date) {
      return moment(date)
        .isSame(moment(), 'day');
    },
    waitingListText(classItem) {
      if (!classItem.seats) {
        return '-';
      }
      if (parseInt(classItem.seats, 10) === 1) {
        return `${classItem.waiting_list_count}/${this.client.settings.private_class_waiting_list_max_customers_on_waiting_list}`;
      }
      return `${classItem.waiting_list_count}/${this.client.settings.class_waiting_list_max_customers_on_waiting_list}`;
    },
    openIcalFeedModal() {
      this.showIcalFeedUrlModal = true;
    },
    closeIcalFeedModal() {
      this.showIcalFeedUrlModal = false;
    },
    copyIcalFeedUrl() {
      this.$copyText(this.user.teacher_ical_feed_url)
        .then(() => {
          this.showIcalFeedUrlCopySuccess = true;
          setTimeout(
            () => {
              this.showIcalFeedUrlCopySuccess = false;
            },
            2000,
          );
        });
    },
  },

  created() {
    this.fetchClassesForWeek();
  },

  mounted() {
    this.scrollToCurrentDate();
  },

  watch: {
    selectedDate(newDate) {
      this.scrollToCurrentDateDone = false;
      if (moment(newDate)
        .format('YYYY-MM-DD') === moment(this.lastSelectedDate)
        .format('YYYY-MM-DD')) {
        return;
      }
      this.lastSelectedDate = moment(newDate);
      this.fetchClassesForWeek();
    },
  },
};
</script>

<style lang="scss" scoped>

.td {
  @apply px-6 py-4 whitespace-no-wrap border-b border-gray-200;
}

.th {
  @apply px-6 py-3 border-b border-gray-200 bg-gray-300 text-left;
  @apply text-xs leading-4 font-medium uppercase tracking-wider;
}

.th-today {
  @apply bg-gray-700 text-white;
}

.button--last-week {
  position: absolute;
  right: 125px;
  top: 0;
  color: #697b8c;
}

.button--today {
  position: absolute;
  right: 35px;
  top: 0;
  color: #697b8c;
}

.button--next-week {
  position: absolute;
  right: 0;
  top: 0;
  color: #697b8c;
}

.copy-button-cell {
  width: 0;

  .md-table-cell-container {
    padding-right: 0;
    padding-left: 0;
  }
}

</style>
