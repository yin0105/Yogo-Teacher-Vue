<template>
  <div></div>
</template>

<script>

import moment from 'moment-timezone';
import { mapGetters } from 'vuex';

const FORMAT = {
  da: {
    HUMAN_DATE: 'D. MMM. YYYY',
    HUMAN_DATE_TIME: 'D. MMM. YYYY [kl.] HH:mm',
    HUMAN_SHORT_WEEKDAY_DATE: 'ddd D. MMM. YYYY',
    HUMAN_SHORT_WEEKDAY_DATE_TIME: 'ddd D. MMM. YYYY [kl.] HH:mm',
  },
  en: {
    HUMAN_DATE: 'MMM. D, YYYY',
    HUMAN_DATE_TIME: 'MMM. D, YYYY, HH:mm',
    HUMAN_SHORT_WEEKDAY_DATE: 'ddd, MMM. D, YYYY',
    HUMAN_SHORT_WEEKDAY_DATE_TIME: 'ddd, MMM. D, YYYY, HH:mm',
  },
};

export default {
  computed: {
    ...mapGetters('appSettings', [
      'locale',
    ]),
  },
  methods: {
    timeStampToHumanDate(timestamp) {
      return moment.tz(timestamp, 'x', 'Europe/Copenhagen')
        .format(FORMAT[this.locale].HUMAN_DATE);
    },
    timeStampToHumanDateTime(timestamp) {
      return moment.tz(timestamp, 'x', 'Europe/Copenhagen')
        .format(FORMAT[this.locale].HUMAN_DATE_TIME);
    },
    timeStampToHumanShortWeekdayDateTime(timestamp) {
      return moment.tz(timestamp, 'x', 'Europe/Copenhagen')
        .format(FORMAT[this.locale].HUMAN_SHORT_WEEKDAY_DATE_TIME);
    },
    dbDateToHumanDate(dbDate) {
      return moment.tz(dbDate, 'YYYY-MM-DD', 'Europe/Copenhagen')
        .format(FORMAT[this.locale].HUMAN_DATE);
    },
    unknownFormatDateToHumanDate(date) {
      return moment.tz(date, 'Europe/Copenhagen')
        .format(FORMAT[this.locale].HUMAN_DATE);
    },
    dbDateToHumanShortWeekdayDate(dbDate) {
      return moment.tz(dbDate, 'YYYY-MM-DD', 'Europe/Copenhagen')
        .format(FORMAT[this.locale].HUMAN_SHORT_WEEKDAY_DATE);
    },
    iso8601ToHumanDateTime(iso8601Date) {
      return moment(iso8601Date).tz('Europe/Copenhagen').format(FORMAT[this.locale].HUMAN_DATE_TIME);
    },
    formatDate(d, opt) {
      if (!d || d === '0000-00-00' || d === 'Invalid date') {
        return '';
      }
      let date;
      if (moment.isDate(d) || moment.isMoment(d)) {
        date = moment(d).tz('Europe/Copenhagen');
      } else if (moment(d, moment.ISO_8601).isValid()) {
        date = moment(d, moment.ISO_8601).tz('Europe/Copenhagen');
      } else if (_.isInteger(d)) {
        date = moment.tz(d, 'x', 'Europe/Copenhagen');
      } else if (date.match(/^\d\d\d\d-\d\d-\d\d$/)) {
        date = moment.tz(d, 'Europe/Copenhagen');
      } else if (date.match(/^\d\d\d\d-\d\d-\d\d \d\d:\d\d$/)) {
        date = moment.tz(d, 'YYYY-MM-DD HH:mm', 'Europe/Copenhagen');
      } else if (date.match(/^\d\d\d\d-\d\d-\d\d \d\d:\d\d:\d\d$/)) {
        date = moment.tz(d, 'YYYY-MM-DD HH:mm:ss', 'Europe/Copenhagen');
      }

      const options = _.assign({
        weekday: false,
        year: true,
        month: 'long',
        time: false,
        capitalize: false,
      }, opt);

      let formatString = '';
      switch (this.locale) {
        case 'da':
          if (options.weekday === 'long' || options.weekday === true) {
            formatString += 'dddd [d.] ';
          } else if (options.weekday === 'short') {
            formatString += 'ddd. [d.] ';
          }
          formatString += 'D. ';
          if (options.month === 'long' || options.month === true) {
            formatString += 'MMMM';
          } else if (options.month === 'short') {
            formatString += 'MMM.';
          }
          if (options.year) {
            formatString += ' YYYY';
          }
          if (options.time) {
            formatString += ' [kl.] HH:mm';
          }
          break;
        case 'en':
        default:
          if (options.weekday === 'long' || options.weekday === true) {
            formatString += 'dddd, ';
          } else if (options.weekday === 'short') {
            formatString += 'ddd, ';
          }
          if (options.month === 'long' || options.month === true) {
            formatString += 'MMMM';
          } else if (options.month === 'short') {
            formatString += 'MMM.';
          }
          formatString += ' D';
          if (options.year) {
            formatString += ', YYYY';
          }
          if (options.time) {
            formatString += ', HH:mm';
          }
          break;
      }

      let formattedDate = date.format(formatString);

      if (options.weekday && options.capitalize) {
        formattedDate = formattedDate.charAt(0).toUpperCase() + formattedDate.slice(1);
      }
      return formattedDate;
    },
    timeIntervalInHumanFormat(amount, unit) {
      let minutes
      if (unit === 'day' || unit === 'days') {
        minutes = amount * 1440
      } else if (unit === 'hour' || unit === 'hours') {
        minutes = amount * 60
      } else {
        minutes = amount
      }

      if (minutes === 0) {
        return '0 ' + this.$t('time.minutes')
      }

      const days = Math.floor(minutes / 1440)
      const hours = Math.floor((minutes % 1440) / 60)
      minutes = minutes % 60

      const dayUnitName = days > 1 ? this.$t('time.days') : this.$t('time.day')
      const hourUnitName = hours > 1 ? this.$t('time.hours') : this.$t('time.hour')
      const minuteUnitName = minutes > 1 ? this.$t('time.minutes') : this.$t('time.minute')

      let formattedString = ''

      if (days > 0) {
        formattedString = days + ' ' + dayUnitName
        if (hours > 0 && minutes > 0) {
          formattedString += ', '
        } else if (hours > 0 || minutes > 0) {
          formattedString += ' ' + this.$t('global.and') + ' '
        }
      }

      if (hours > 0) {
        formattedString += hours + ' ' + hourUnitName
        if (minutes > 0) {
          formattedString += ' ' + this.$t('global.and') + ' '
        }
      }

      if (minutes > 0) {
        formattedString += minutes + ' ' + minuteUnitName
      }

      return formattedString
    }
  },
};

</script>
