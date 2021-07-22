<template>
  <div class="flex flex-col">
    <div class="-my-2 sm:-mx-6 lg:-mx-8">
      <div class="py-2 align-middle sm:px-6 lg:px-8">
        <div class="shadow border-b overflow-scroll border-gray-200">
          <table class="min-w-full overflow-scroll divide-y divide-gray-200">

            <tbody class="bg-white divide-y divide-gray-200">
            <tr
              v-for="signup in classObj.signups"
              class="cursor-pointer"
              @click="$emit('openInfoModal', signup)"
              :key="'signup_' + signup.id"
            >
              <td class="px-auto py-4 whitespace-no-wrap">
                <div class="flex items-center">
                  <div class="mx-2 flex-shrink-0 h-10 w-10">
                    <img class="h-10 w-10 rounded-full"
                         :src="profileImageSrc(signup.user.image)"
                         alt="">
                  </div>
                  <div class="ml-4">
                    <div class="text-sm leading-5 font-medium text-gray-900">
                      {{ signup.user.first_name }} {{ signup.user.last_name }}
                    </div>
                    <div class="text-sm fkex leading-5 text-gray-500">
                      <Tag v-if="signup.class_is_users_first_class" color="green">
                        {{ $t('global.New') }}
                      </Tag>
                      <Tag color="pink" v-if="signup.class_is_on_users_birthday">
                        {{ $t('global.Birthday') }}
                      </Tag>
                    </div>
                  </div>
                </div>
              </td>

              <td class="px-auto py-4 whitespace-no-wrap text-right">
                <div class="px-8 inline-flex" v-if="signup.checked_in">
                  <CheckmarkUser></CheckmarkUser>
                </div>
                <div
                  v-if="!hideActionButtons"
                  v-else @click.stop.prevent="$emit('checkin',signup)"
                  class="btn btn-primary inline-flex">
                  {{ $t('global.CheckIn') }}
                </div>

              </td>

              <td class="px-2 py-4 whitespace-no-wrap text-right text-sm leading-5 font-medium">
                <a href="#" class="text-indigo-600 hover:text-indigo-900">
                  <ThreeDotsIcon></ThreeDotsIcon>
                </a>
              </td>
            </tr>

            <!-- More rows... -->
            </tbody>
          </table>
        </div>
      </div>
    </div>




  </div>
</template>

<script>

import qs from 'qs';
import moment from 'moment-timezone';
import Imgix from '@/services/Imgix';
import ThreeDotsIcon from '@/graphics/icons/ThreeDotsIcon.vue';
import YogoApi from '@/gateways/YogoApi';
import dateTimeFunctions from '@/mixins/dateTimeFunctions.vue';
import CheckmarkIcon from '@/graphics/icons/CheckmarkIcon.vue';
import CheckmarkUser from '@/graphics/icons/CheckmarkUserIcon.vue';
import Modal from './Modal.vue';
import Tag from './Tag.vue';

export default {
  name: 'CheckinList',
  components: {
    CheckmarkIcon,
    CheckmarkUser,
    ThreeDotsIcon,
    Modal,
    Tag,
  },
  mixins: [Imgix, dateTimeFunctions],
  props: [
    'classObj',
    'hideActionButtons'
  ],
  data() {
    return {

    };
  },
  computed: {

  },
  methods: {


  },
};
</script>

<style lang="scss">

</style>
