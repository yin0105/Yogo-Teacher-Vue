<template>
  <span
    class="px-2 mr-2 inline-flex text-xs leading-5 font-semibold rounded-full"
    :class="tagStyles"
  >
    <slot></slot>
  </span>
</template>

<script>

export default {
  name: 'Tag',
  props: ['color'],
  computed: {
    tagStyles() {
      switch (this.color) {
        case 'pink':
          return 'bg-pink-100 text-pink-800 whitespace-normal';
        case 'green':
          return 'bg-green-100 text-green-800 whitespace-normal';
        case 'indigo':
          return 'bg-indigo-100 text-indigo-800 whitespace-normal';
        default: {
          return '';
        }
      }
    },
  },
};
</script>
