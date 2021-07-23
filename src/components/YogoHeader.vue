<template>

  <div v-if="userIsLoggedIn">
    <nav class="bg-gray-100">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex items-center justify-between h-16">

          <div class="flex items-center">
            <router-link :to="{ name: 'MySchedule' }">
              <div class="flex flex-shrink-0">
                <img
                  class="h-12 w-12 mr-4"
                  :src="Imgix(client.logo.filename)"
                  v-if="client && client.logo && client.logo.filename.slice(-4) === '.svg'"
                />
                <div v-else-if="client && client.logo"
                     :style="{'background-image' : 'url(' + Imgix(client.logo.filename, {w:480, h:160}) + ')'}"
                     class="h-12 w-12 mr-4 bg-contain bg-no-repeat bg-center">
                </div>
                <p class="text-2xl font-bold flex items-center">
                  {{ client.name }}
                </p>
              </div>
            </router-link>

            <div class="hidden md:block">
              <div class="ml-10 flex items-baseline">
                <a
                  class="px-3 py-2 rounded-sm text-sm font-medium text-white bg-gray-900 focus:outline-none focus:text-white focus:bg-gray-700"
                  href="#"
                >
                  <router-link :to="{ name: 'MySchedule' }">
                    {{ $t('global.mySchedule') }}
                  </router-link>
                </a>
              </div>
            </div>
          </div>

          <div class="hidden md:block">
            <div class="ml-4 flex items-center md:ml-6">
              <p
                class="text-sm leading-5 cursor-pointer"
                @click="toggleMenu"
                v-show="userIsLoggedIn"
              >
                {{ user.first_name + ' ' + user.last_name }}
              </p>

              <div class="ml-3 relative">
                <div>
                  <button
                    @click="toggleMenu"
                    class="max-w-xs flex items-center text-sm rounded-full text-white focus:outline-none focus:shadow-solid"
                    v-show="userIsLoggedIn"
                  >
                    <img class="h-8 w-8 rounded-full" :src="profileImageSrc(user.image)" alt="Profile image"/>
                  </button>
                </div>

                <transition name="slide-fade">
                  <div v-if="!profileMenuIsHidden"
                       class="origin-top-right absolute right-0 mt-2 w-48 rounded-sm shadow-lg z-10">
                    <div class="py-1 rounded-sm bg-white shadow-xs" role="menu"
                         aria-orientation="vertical" aria-labelledby="user-menu">
                      <a
                        href="#"
                        @click.prevent.stop="profileEditClick"
                        class="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                        role="menuitem">
                        <span class="flex">
                          <span class="mr-4">
                            <GearsIcon></GearsIcon>
                          </span>
                          {{ $t('global.profileSettings') }}
                        </span>
                      </a>
                      <a
                        href="#"
                        @click.prevent.stop="salaryReportClick"
                        class="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                        role="menuitem">
                        <span class="flex">
                          <span class="mr-4">
                            <GearsIcon></GearsIcon>
                          </span>
                          {{ $t('global.SalaryReport') }}
                        </span>
                      </a>
                      <a
                        href="#"
                        @click="logout"
                        class="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                        role="menuitem">
                        <span class="flex">
                          <span class="mr-4">
                            <LogOutIcon></LogOutIcon>
                          </span>
                          {{ $t('global.logOut') }}
                        </span>
                      </a>
                    </div>
                  </div>
                </transition>

              </div>
            </div>
          </div>

          <div
            @click.prevent.stop="toggleMenu"
            class="-mr-2 flex md:hidden">
            <button
              class="inline-flex items-center justify-center p-2 rounded-sm text-blue focus:outline-none focus:bg-blue focus:text-white">
              <MenuIcon v-if="profileMenuIsHidden" class="h-6 w-6"/>
              <MenuCloseIcon v-if="!profileMenuIsHidden" class="h-6 w-6"/>
            </button>
          </div>
        </div>
      </div>

      <transition name="slide-fade">
        <div v-if="!profileMenuIsHidden" class="md:hidden">
          <div class="px-2 pt-2 pb-3 sm:px-3">
            <a href="#" @click="navigateTo({ name: 'MySchedule' })"
               class="block px-3 py-2 rounded-sm text-base font-medium text-white bg-gray-900 focus:outline-none focus:text-white focus:bg-gray-700">
                {{ $t('global.mySchedule') }}
            </a>
          </div>
          <div class="pt-4 pb-3 border-t border-gray-700">
            <div class="flex items-center px-5">
              <div class="flex-shrink-0">
                <img class="h-10 w-10 rounded-full" :src="profileImageSrc" alt="Profile image"/>
              </div>
              <div class="ml-3">
                <p
                  class="text-sm leading-5 cursor-pointer"
                  @click="toggleMenu"
                  v-show="userIsLoggedIn"
                >
                  {{ user.first_name + ' ' + user.last_name }}
                </p>

              </div>
            </div>
            <div class="mt-3 px-2">
              <a
                href="#"
                @click="navigateTo({ name: 'ProfileEdit' })"
                class="block px-4 py-2 text-sm hover:bg-gray-100"
                role="menuitem">
                <span class="flex">
                  <span class="mr-4">
                    <GearsIcon></GearsIcon>
                  </span>
                  {{ $t('global.profileSettings') }}
                </span>
              </a>
              <a
                href="#"
                @click="logout"
                class="block px-4 py-2 text-sm hover:bg-gray-100" role="menuitem">
                <span class="flex">
                  <span class="mr-4">
                    <LogOutIcon></LogOutIcon>
                  </span>
                  {{ $t('global.logOut') }}
                </span>
              </a>

            </div>
          </div>
        </div>
      </transition>
    </nav>

  </div>
</template>

<script>

import { mapGetters } from 'vuex';
import Imgix from '../services/Imgix';
import GearsIcon from '../graphics/icons/GearsIcon.vue';
import LogOutIcon from '../graphics/icons/LogOutIcon.vue';
import MenuIcon from '../graphics/icons/MenuIcon.vue';
import MenuCloseIcon from '../graphics/icons/MenuCloseIcon.vue';
import SalaryIcon from '../graphics/icons/SalaryIcon.vue';

export default {
  name: 'Header',
  components: {
    MenuCloseIcon,
    MenuIcon,
    LogOutIcon,
    GearsIcon,
  },
  mixins: [Imgix],
  data() {
    return {
      profileSettings: 'Profil indstillinger',
      signOut: 'Log ud',
      profileMenuIsHidden: true,
      mobileMenu: true,
    };
  },
  computed: {
    ...mapGetters([
      'userIsLoggedIn',
      'userName',
      'user',
      'client',
      'stateReady',
    ]),
  },
  methods: {
    profileEditClick() {
      this.$router.push({ name: 'ProfileEdit' });
      this.profileMenuIsHidden = true;
    },
    salaryReportClick() {
      this.$router.push({ name: 'ReportSalary' });
      this.profileMenuIsHidden = true;
    },
    toggleMenu() {
      this.profileMenuIsHidden = !this.profileMenuIsHidden;
    },
    navigateTo(route) {
      this.$router.push(route);
      this.profileMenuIsHidden = true;
    },
    logout() {
      this.$store.dispatch('logout');
    },
  },
};

</script>

<style lang="scss">
  .slide-fade-enter-active {
    transition: all .3s ease;
  }

  .slide-fade-leave-active {
    transition: all .2s cubic-bezier(0.6, 0.5, 0.3, 1.0);
  }

  .slide-fade-enter, .slide-fade-leave-to
    /* .slide-fade-leave-active below version 2.1.8 */
  {
    transform: translateX(-2px);
    transform: translateY(-2px);
    opacity: 0;
  }
</style>
