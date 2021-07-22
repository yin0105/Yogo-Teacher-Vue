<template>
  <div class="flex flex-col">
    <div class="-my-2 sm:-mx-6 lg:-mx-8">
      <div class="py-2 align-middle sm:px-6 lg:px-8">
        <div class="shadow border-b overflow-scroll border-gray-200">
          <table class="min-w-full overflow-scroll divide-y divide-gray-200">

            <tbody class="bg-white divide-y divide-gray-200">
            <tr
              v-for="(signup, idx) in classObj.waiting_list_signups"
              class="cursor-pointer"
              @click="$emit('openInfoModal', signup)"
              :key="'waiting_list_signup_' + signup.id"
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
                      <Tag color="indigo">
                        #{{ idx + 1 }}
                      </Tag>
                      <Tag color="green" v-if="signup.class_is_users_first_class">
                        {{ $t('global.New') }}
                      </Tag>
                      <Tag color="pink" v-if="signup.class_is_on_users_birthday">
                        {{ $t('global.Birthday') }}
                      </Tag>
                    </div>
                  </div>
                </div>
              </td>

              <td class="px-auto py-4 whitespace-no-wrap">
                <div
                  @click.prevent.stop="$emit('moveToClass', signup)"
                  class="btn btn-secondary"
                  v-if="!hideActionButtons"
                >
                  {{ $t('global.MoveToClass') }}
                </div>
              </td>

              <td class="px-2 py-4 whitespace-no-wrap text-right text-sm leading-5 font-medium">
                <a href="#" class="text-indigo-600 hover:text-indigo-900">
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"
                       fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"
                       stroke-linejoin="round" class="feather feather-more-horizontal">
                    <circle cx="12" cy="12" r="1"></circle>
                    <circle cx="19" cy="12" r="1"></circle>
                    <circle cx="5" cy="12" r="1"></circle>
                  </svg>
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

import Tag from '@/components/Tag.vue';
import Imgix from '@/services/Imgix';

export default {
  name: 'WaitList',
  props: [
    'classObj',
    'hideActionButtons'
  ],
  components: {
    Tag,
  },
  mixins: [Imgix],
  data() {
    return {
      showInfoModal: false,
    };
  },
  methods: {

  },
};
</script>
