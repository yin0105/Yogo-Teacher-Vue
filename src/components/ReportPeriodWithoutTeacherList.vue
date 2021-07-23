<template>

  <div class="flex flex-wrap">

    <div class="flex--25 mr10-md min-h-14">
      <InputField
        v-model="fromDate"
        type="date"
        :label="$t('global.FromDate')"
      >
      </InputField>
    </div>  
    <div class="flex--25 mr10-md min-h-14">
      <InputField
        v-model="endDate"
        type="date"
        :label="$t('global.EndDate')"
      >
      </InputField>
    </div>   

  </div>

</template>

<script>

  import Datepicker from 'vuejs-datepicker'
  import moment from 'moment'
  import InputField from './InputField.vue';
  

  export default {
    components: {
      Datepicker,
      InputField,
    },
    name: 'reportperiodwithoutteacherlist',
    data() {
      return {
      }
    },
    watch: {
    },
    props: {
    },
    computed: {
      years() {
        const currentYear = moment().year()
        const firstYear = Math.max(2018, currentYear - 9)
        return _.range(currentYear, firstYear - 1)
      },
      months() {
        const months = []
        for (var i = 0; i <= 11; i++) {
          months.push(
            _.upperFirst(
              moment().month(i).format('MMMM'),
            ),
          )
        }
        return months
      }, 
      fromDate: {
        get: function() {
          const today = new Date();
          let yy = today.getFullYear();
          let mm = today.getMonth() - 1;

          if (mm < 0) {
            mm += 12;
            yy -= 1;
          }

          return new Date(yy, mm, 1);
          sendDateTime = moment.tz(sendDate + ' ' + this.form.sendTime, 'Europe/Copenhagen')
        }, 
        set: function(date) {
          this.$emit('update:fromDate', date);
          this.$emit('update:dateUpdated', true);
        }
      },
      endDate: {
        get: function() {
          const today = new Date();
          let yy = today.getFullYear();
          let mm = today.getMonth();

          return new Date(yy, mm, 0);
        },
        set: function(date) {
          this.$emit('update:endDate', date);
          this.$emit('update:dateUpdated', true);
        }
      }
    },    
    mounted() {
      this.$emit('update:fromDate', this.fromDate);
      this.$emit('update:endDate', this.endDate);
      this.$emit('update:dateUpdated', true);
    }
  }

</script>
