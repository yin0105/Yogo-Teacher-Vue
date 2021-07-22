import Vue from 'vue';

Vue.filter('truncateString', function (value, maxLength) {
    if (!value) return ''
    value = value.toString()
    maxLength = maxLength || 40;
    return value.length > maxLength
      ? value.substr(0,maxLength - 2) + '...'
      : value;
})
