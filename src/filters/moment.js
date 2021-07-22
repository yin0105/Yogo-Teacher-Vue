import Vue from 'vue';
import moment from 'moment'

Vue.filter('moment', function (value, format) {
    if (!value) return ''
    const value = moment(value)
    return value.format(format)
})