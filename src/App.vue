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
  @import "~vue-material/dist/theme/engine"; // Import the theme engine

  @include md-register-theme("default", (
      primary: md-get-palette-color(cyan, 700),
      accent: md-get-palette-color(red, 800)
  ));

  @import "~vue-material/dist/theme/all"; // Apply the theme

  #app {
    --md-theme-default-primary: #0097a7;
    --md-theme-default-accent: #0097a7;
    background: #f1f1f1
  }

  .md-toolbar.md-theme-default.md-primary .md-icon {
    color: #000;
  }

  .md-toolbar.md-theme-default.md-primary {
    height: 60px !important;
  }

  .header-bar {
    height: 60px;
    width: 100vw;
    background: #fff;
    position: fixed !important;
    box-shadow: 0 2px 15px rgba(71, 120, 120, 0.5);
    transform: translate3d(0, 0, 0);
    transition: 0.1s all ease-out;
    z-index: 11 !important;

    button {
      z-index: 20;
    }

    @media screen and (min-device-width: 1030px) {
      z-index: 6 !important;
    }
  }

  .header-bar.header-bar--hidden {
    transform: translate3d(0, -100%, 0);
  }

  .slim-menu {
    transition: 0.3s ease margin;
    @media screen and (min-device-width: 1030px) {
      margin-left: 60px !important;
    }
  }

  .sidebar-slim {
    transition: 0.3s ease width;
    width: 64px !important;
  }

  .slim-logo {
    img,
    .logo-bitmap {
      width: 30px !important;
      margin: 0 !important;
      transition: .3s ease all;
    }
  }

  .md-app {
    height: 100%;
  }

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
<style lang="scss">

  


</style>
