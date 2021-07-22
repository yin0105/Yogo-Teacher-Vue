<template>
  <div></div>
</template>

<script>

export default {

  methods: {
    AutoFormatTime(inputValue) {
      let value = inputValue;
      if (value === '') return '';
      value = value.replace('.', ':').replace(' ', ':');
      value = value.replace(/[^\d:]/g, '');

      const colonPos = value.indexOf(':');

      let hours;
      let minutes;

      if (colonPos > -1) {
        if (value.indexOf(':', colonPos + 1) > -1) {
          return '';
        }

        hours = /^(\d+):/.exec(value);
        if (hours) {
          hours = Math.min(parseInt(hours[1], 10), 23);
          hours = _.padStart(hours, 2, '0');
        } else {
          hours = '00';
        }
        minutes = /:(\d+)$/.exec(value);
        if (minutes) {
          minutes = Math.min(parseInt(minutes[1], 10), 59);
          minutes = _.padStart(minutes, 2, '0');
        } else {
          minutes = '00';
        }
        return `${hours}:${minutes}`;
      }

      switch (value.length) {
        case 1:
        case 2:
          hours = value;
          minutes = 0;
          break;
        case 3:
          hours = value.substr(0, 1);
          minutes = value.substr(1, 2);
          break;
        case 4:
        default:
          hours = value.substr(0, 2);
          minutes = value.substr(2, 2);
          break;
      }
      hours = _.padStart(Math.min(hours, 23), 2, '0');
      minutes = _.padStart(Math.min(minutes, 59), 2, '0');
      return `${hours}:${minutes}`;
    },

    AutoFormatNumeric(value) {
      return value.replace(/[^\d]/, '');
    },

  },

};

</script>
