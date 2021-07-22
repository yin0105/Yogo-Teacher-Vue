<template>
  <loading-animation></loading-animation>
</template>

<script>

import LoadingAnimation from './LoadingAnimation.vue';

export default {
  components: { LoadingAnimation },
  name: 'LivestreamClassPreloader',
  created() {
    this.$router.replace({
      name: 'LivestreamClass',
      params: { classId: this.$route.params.classId },
    });
  },
};

</script>
