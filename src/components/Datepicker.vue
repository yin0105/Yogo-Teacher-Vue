<template>
  <VuejsDatepicker
    v-bind:value="value"
    v-on:input="input"
    :monday-first="true"
    :language="language"
    class="border-b p-2 bg-transparent"
    input-class="bg-transparent px-2 outline-none cursor-pointer"
  ></VuejsDatepicker>
</template>

<script>

import VuejsDatepicker from 'vuejs-datepicker';
import { da, en } from 'vuejs-datepicker/dist/locale';
import { mapGetters } from 'vuex';

export default {
  name: 'Datepicker',
  components: { VuejsDatepicker },
  props: ['value'],
  computed: {
    ...mapGetters('appSettings', [
      'locale',
    ]),
    language() {
      const languages = { en, da };
      return languages[this.locale];
    },
  },
  methods: {
    input(date) {
      this.$emit('input', date);
      console.log(date);
    },
  },
};

</script>
