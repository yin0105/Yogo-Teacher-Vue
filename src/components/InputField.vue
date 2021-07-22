<template>
  <div class="yogo-input-field">

    <div class="flex flex-col">

      <label :for="inputId">
        {{ label }} <span v-if="required">*</span>
      </label>

      <div class="input-container">

        <Datepicker
          v-if="type === 'date' && !isMobile"
          @input="inputDate"
          :type="inputType"
          :value="value"
          :disabled-dates="{ customPredictor: datepickerDateIsDisabled }"
          :language="language"
          :monday-first="true"
        />

        <div class="calendar-icon-container" v-if="type==='date' && !isMobile">
          <CalendarIcon/>
        </div>


        <button type="button" class="datepicker-clear-button btn hover:bg-gray-400"
                v-if="type==='date' && value && !required"
                @click.prevent="clearDatepicker">
          <CloseIcon></CloseIcon>
        </button>

        <input
          v-if="type !== 'date' || isMobile"
          ref="inputField"
          :autocomplete="inputAutocomplete"
          :value="value"
          class="order-last"
          :type="inputType"
          :pattern="inputPattern"
          @input="updateValue"
          :id="inputId"
          @blur="blur"
        >

      </div>

      <span
        @click="showPassword = !showPassword" v-if="type === 'password'"
        class="order-first float-right text-right -mt-2 h-0 outline-none cursor-pointer z-10"
      >
        {{ showPasswordBtnText }}
      </span>

    </div>

    <slot name="errors"></slot>

  </div>
</template>

<script>

import { mapGetters } from 'vuex';
import moment from 'moment-timezone';
import Datepicker from 'vuejs-datepicker';
import { da, en } from 'vuejs-datepicker/dist/locale';
import CalendarIcon from '../graphics/icons/CalendarIcon.vue';
import CloseIcon from '../graphics/icons/CloseIcon.vue';
import autoFormatters from '@/mixins/autoFormatters';

export default {
  props: {
    label: String,
    type: String,
    value: {},
    required: Boolean,
    pattern: String,
    autocomplete: String,
    disableDatesAfter: String,
    autoFormat: String,
  },
  data() {
    return {
      inputId: `input-field-${Math.round(Math.random() * 999999999)}`,
      inputPattern: this.pattern,
      inputAutocomplete: this.autocomplete,
      isMobile: false,
      showPassword: false,
      datepickerDate: new Date().toISOString().slice(0, 10),
    };
  },
  components: {
    CloseIcon,
    CalendarIcon,
    Datepicker,
  },
  mixins: [autoFormatters],
  computed: {
    ...mapGetters(['client']),
    ...mapGetters('appSettings', [
      'locale',
    ]),
    inputType() {
      return this.type === 'password' && this.showPassword ? 'text' : this.type;
    },
    showPasswordBtnText() {
      return this.showPassword ? this.$t('global.hide') : this.$t('global.show');
    },
    language() {
      const languages = { en, da };
      return languages[this.locale];
    },
  },
  mounted() {
    this.checkIfMobile();
  },
  methods: {
    updateValue() {
      this.$emit('input', this.$refs.inputField.value);
    },

    inputDate(newDate) {
      this.$emit('input', newDate);
    },

    datepickerDateIsDisabled(date) {
      if (this.disableDatesAfter === true) {
        return moment(date).isAfter(moment(), 'day');
      } else {
        return;
      }
    },

    clearDatepicker() {
      this.$emit('input', null);
    },
    checkIfMobile() {
      // check if ios or android
      const userAgent = navigator.userAgent || navigator.vendor || window.opera;
      if (/android/i.test(userAgent)) {
        this.isMobile = true;
      }
      // iOS
      if (/iPad|iPhone|iPod/.test(userAgent) && !window.MSStream) {
        this.isMobile = true;
      }
    },
    blur() {
      if (!this.autoFormat) return;
      switch (this.autoFormat.toLowerCase()) {
        case 'time':
          this.$emit('input',this.AutoFormatTime(this.value));
          break;
        default:
          break;
      }
    },
  },
};
</script>

<style lang="scss">


.yogo-input-field {

  padding-bottom: 10px;

  input {
    display: flex;
    vertical-align: middle;
    border-radius: 2px;
    min-width: 50px;
    max-width: 635px;
    width: 100%;
    min-height: 52px;
    background-color: #edf2f7;
    border: 1px solid rgba(36, 28, 21, 0.3);
    transition: all 0.2s ease-in-out 0s;
    font-size: 1em;
    line-height: 20px;
    padding: 0 15px;
    margin-bottom: 10px;
    -webkit-appearance: none;

    &:focus {
      outline: none;
      border: 1px solid #000;
      box-shadow: inset 0 0 0 1px #000;
    }
  }

  label {
    color: #000;
    font-weight: bold;
    display: block;
    max-width: 635px;
    padding-bottom: 12px;
    -webkit-user-select: none;
    -ms-user-select: none;
    -moz-user-select: none;
    user-select: none;
  }

  .error {
    display: none;
    left: 0;
    opacity: 0;
    -webkit-transform: translate3d(0, -8px, 0);
    transform: translate3d(0, -8px, 0);
  }

  &.invalid .error {
    opacity: 1;
    -webkit-transform: translateZ(0);
    transform: translateZ(0);
    background: #fbeeca;
    font-weight: bold;
    padding: 14px;
    padding-left: 55px;
    margin-bottom: 10px;
    display: flex !important;
    align-items: center;

    &:before {
      content: '';
      background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='currentColor' stroke-width='2' stroke-linecap='round' stroke-linejoin='round' class='feather feather-info'%3E%3Ccircle cx='12' cy='12' r='10'%3E%3C/circle%3E%3Cline x1='12' y1='16' x2='12' y2='12'%3E%3C/line%3E%3Cline x1='12' y1='8' x2='12.01' y2='8'%3E%3C/line%3E%3C/svg%3E");
      padding-bottom: 6px;
      font-size: 16px;
      position: absolute;
      width: 25px;
      height: 25px;
      left: 16px;
      display: flex;
      justify-content: center;
      align-items: center;
      line-height: 1;
    }
  }

  .input-container {
    position: relative;

    .vdp-datepicker {
      input {
        padding-left: 44px;
      }
    }

    .calendar-icon-container {
      position: absolute;
      left: 12px;
      top: 13px;
      pointer-events: none;
    }

    .datepicker-clear-button {
      position: absolute;
      right: 0;
      top: 6px;
      border: 0;
    }
  }

}

</style>
