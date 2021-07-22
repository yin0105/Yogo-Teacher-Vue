<template>
  <div id="app" class="bg-gray-200 min-h-screen pb-10" :key="locale">

    <YogoHeader v-if="!fullBleedPage"></YogoHeader>

    <div v-if="!fullBleedPage">
      <router-view></router-view>
    </div>

    <router-view v-if="fullBleedPage"></router-view>

    <transition name="slide-up">
      <div v-if="showFlashMessageSnackbar"
           class="fixed max-w-xl rounded-md py-4 px-6 inset-x-0 bottom-0 mx-auto bg-green-100 text-green-800">
        <div class="flex justify-between">
          <span class="flex">
            <span class="mr-4">
              <CheckmarkIcon></CheckmarkIcon>
            </span>
            {{ flashMessageSnackbarText }}
          </span>
          <span
            class="cursor-pointer"
            @click="showFlashMessageSnackbar = false"
          >
            <CloseIcon></CloseIcon>
          </span>
        </div>
      </div>
    </transition>

    <Modal v-show="showAlert" @close="showAlert = false">
      <template v-slot:header>
        <h3 class="mb-5">
          {{ alertTitle }}
        </h3>
      </template>
      <template v-slot:body>{{ alertMessage }}</template>
      <template v-slot:footer>
        <button
          type="button"
          class="btn btn-secondary"
          @click="showAlert = false"
        >
          {{ $t('global.Close') }}
        </button>
      </template>
    </Modal>

  </div>
</template>

<script>

import Imgix from '@/services/Imgix';
import Modal from '@/components/Modal.vue';
import { mapGetters } from 'vuex';
import YogoHeader from './components/YogoHeader.vue';
import CloseIcon from './graphics/icons/CloseIcon.vue';
import CheckmarkIcon from './graphics/icons/CheckmarkIcon.vue';

export default {
  data() {
    return {
      showFlashMessageSnackbar: false,
      flashMessageSnackbarText: '',
      flashMessageTimeout: null,

      showAlert: false,
      alertTitle: '',
      alertMessage: '',
    };
  },
  methods: {
    toggleMenu() {
      this.menuVisible = !this.menuVisible;
    },
  },
  mixins: [Imgix],
  computed: {
    fullBleedPage() {
      return this.$route.meta.fullBleedPage;
    },
    ...mapGetters([
      'flashMessages',
      'alertMessages',
      'client',
    ]),
    ...mapGetters('appSettings', [
      'locale',
    ]),
  },
  components: {
    CloseIcon,
    CheckmarkIcon,
    YogoHeader,
    Modal,
  },
  created() {
    this.$store.dispatch('init');
  },
  watch: {
    flashMessages(updatedFlashMessages) {
      const lastFlashMessage = updatedFlashMessages[updatedFlashMessages.length - 1];
      this.flashMessageSnackbarText = lastFlashMessage.text;
      this.showFlashMessageSnackbar = true;
      if (this.flashMessageTimeout) {
        clearTimeout(this.flashMessageTimeout);
      }
      this.flashMessageTimeout = setTimeout(() => {
        this.flashMessageTimeout = null;
        this.showFlashMessageSnackbar = false;
      }, 5000);
    },
    alertMessages(updatedAlertMessages) {
      const lastAlertMessage = updatedAlertMessages[updatedAlertMessages.length - 1];
      this.alertTitle = lastAlertMessage.title;
      this.alertMessage = lastAlertMessage.message;
      this.showAlert = true;
    },
    locale() {
      document.title = this.$t('system.documentTitle');
    },
  },

};
</script>

<style lang="scss">

  .slide-up-enter-active {
    animation: slideUp .6s;
  }

  .slide-up-leave-active {
    animation: slideUp .6s reverse;
  }

  @keyframes slideUp {
    0% {
      transform: translateY(100px);
      opacity: 0;
    }
    100% {
      opacity: 1;
    }
  }

  .wrapper {
    @media only screen and (min-width: 768px) {
      max-width: 760px;
      margin: 0 auto;
    }
  }


</style>
