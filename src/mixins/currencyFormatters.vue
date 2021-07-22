<template>
  <div></div>
</template>

<script>

  export default {
    methods: {
      formatCurrencyDkk(amount) {
        return this.$options.filters.currency_dkk(amount)
      },
    }
  }

</script>
