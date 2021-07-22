<template>

  <div>
    <h3 class="my-10 text-center font-bold">
      {{ $t('global.EmailsToAttendees') }}
    </h3>

      <div class="flex flex-col">
        <div class="-my-2 overflow-x-auto sm:-mx-6 lg:-mx-8">
          <div class="py-2 align-middle inline-block min-w-full sm:px-6 lg:px-8">
            <div class="shadow overflow-hidden border-b border-gray-200 sm:rounded-sm">
              <table class="min-w-full divide-y divide-gray-200">
                <thead class="bg-gray-50">
                  <tr>
                    <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      {{ $t('global.Subject') }}
                    </th>
                    <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      {{ $t('global.TimeAsPointInTime') }}
                    </th>
                    <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      {{ $t('global.Status') }}
                    </th>
                    <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      {{ $t('global.SendTo') }}
                    </th>
                    <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      {{ $t('global.SendToSubsequentSignups') }}
                    </th>
                    <th scope="col" class="relative px-6 py-3">
                      <span class="sr-only">
                        {{ $t('global.Edit') }}
                      </span>
                    </th>
                  </tr>
                </thead>
                <tbody class="bg-white divide-y divide-gray-200">
                  <tr v-for="item in classEmails">
                    <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {{ item.subject | truncateString(40) }}
                    </td>
                    <td class="px-6 py-4 whitespace-nowrap">
                      <div class="text-sm text-gray-900">
                        {{
                          formatDate(item.send_at_datetime, {
                          weekday: true,
                          time: true,
                          capitalize: true,
                          })
                        }}
                      </div>
                    </td>
                    <td class="px-6 py-4 whitespace-nowrap">
                      <span
                        v-if="item.email_sent"
                        class="px-2 inline-flex text-xs leading-5 font-semibold rounded-full text-green-900"
                        v-tooltip="{
                        content: item.instances.map(i => i.recipient.first_name + ' ' + i.recipient.last_name).join(',<br>'),
                        offset: 5,
                        }"
                      >
                        {{ $t('global.Send2') }} ({{ item.instances.length }})
                      </span>

                      <span
                        v-else
                        class="px-2 inline-flex text-xs leading-5 font-semibold rounded-full text-green-900"
                      >
                        {{ $t('global.WillBeSentAsScheduled') }}
                      </span>
                    </td>

                    <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {{ sendToText(item) }}
                    </td>

                    <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      <span
                        v-if="item.auto_send_status === 'active' && item.email_sent"
                        class="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800"
                        v-tooltip="{
                        content: $t('global.ActiveSendingToNewSignups'),
                        offset: 5,
                        }"
                      >
                        {{ $t('global.Active') }}
                      </span>

                      </span>
                      <span
                        v-else-if="item.auto_send_status === 'active'"
                        class="px-2 inline-flex text-xs leading-5 font-semibold rounded-full text-green-900"
                        v-tooltip="{
                        content: $t('global.AfterSendingSendToSubsequentSignups'),
                        offset: 5,
                        }"
                      >
                        <AutoSendActiveIndicator></AutoSendActiveIndicator>
                      </span>
                      <span v-else>--</span>
                    </td>
                    <td class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <a
                        @click.prevent="$emit('openEmailModal', item.id)"
                        class="text-indigo-600 hover:text-indigo-900 cursor-pointer">
                        {{ $t('global.Edit') }}
                      </a>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>

  </div>

</template>

<script>

import dateTimeFunctions from '@/mixins/dateTimeFunctions.vue';
import AutoSendActiveIndicator from '@/graphics/AutoSendActiveIndicator';

import { mapGetters } from 'vuex';

export default {
  name: 'ClassEmails',
  components: { AutoSendActiveIndicator },
  props: ['classEmails'],
  computed: {
    ...mapGetters([
      'client',
    ]),
  },
  mixins: [dateTimeFunctions],
  methods: {
    createEmail() {
      this.$emit('composeEmail');
    },
    sendToText(email) {
      const recipientGroups = [];
      if (email.send_to_signups) {
        recipientGroups.push(this.client.settings.livestream_enabled ? this.$t('global.AttendeesStudio') : this.$t('global.Attendees'));
      }
      if (email.send_to_livestream_signups) {
        recipientGroups.push(this.$t('global.AttendeesLivestream'));
      }
      if (email.send_to_waiting_list) {
        recipientGroups.push(this.$t('global.Waitlist'));
      }
      return recipientGroups.join(', ');
    },

  },
};

</script>

