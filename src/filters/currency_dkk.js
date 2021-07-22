const currencyFormatter = require('currency-formatter')
import Vue from 'vue';

Vue.filter('currency_dkk', function (value) {

  return currencyFormatter.format(value, {
    locale:'da-DK',
    format: '%v',
    thousand: '.'
  })

})
