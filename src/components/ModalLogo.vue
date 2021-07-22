<template>
  <img :src="imgSrc" class="mx-auto max-h-20 w-auto mb-8" v-if="imageType" alt="Studio logo">
</template>

<script>

import Imgix from '@/services/Imgix';
import { mapGetters } from 'vuex';

export default {
  props: {},
  computed: {
    ...mapGetters([
      'client',
    ]),
    imageType() {
      if (!this.client || !this.client.logo) return null;
      return this.client.logo.filename.slice(-4) === '.svg' ? 'svg' : 'bitmap';
    },
    imgSrc() {
      if (!this.client || !this.client.logo) return '';
      return this.imageType === 'svg'
        ? Imgix.methods.Imgix(this.client.logo.filename)
        : Imgix.methods.Imgix(this.client.logo.filename, { w: 400, h: 200 });
    },
    imgClass() {
      return this.imageType === 'svg'
        ? 'logo-svg'
        : 'logo-bitmap';
    },
  },
};

</script>
