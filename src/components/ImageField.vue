<template>
  <div
    class="image-upload-field flex pb-4"
    v-bind:class="{'invalid': showImageDimensionsError}"
    :data-image-format="imageFormat"
  >

    <div
      :class="'image-format-' + imageFormat"
      class="image-format-container"
    >
      <img :src="imagePreviewSrc" v-images-loaded="imageDidLoad">
      <label :for="fileInputId" class="button-overlay">
        <CameraIcon></CameraIcon>
      </label>
      <input :id="fileInputId" @change="uploadImage" type="file" accept="image/*" tabindex="100"
             :key="fileInputKey">

      <div class="remove-image-button"
           v-if="imageId && !imageIsWaiting && !imageIsLoading" @click.stop="removeImage">
        <CloseIcon></CloseIcon>
      </div>
      <div class="progress-bar-container" v-if="imageFormat === 'profile' && imageIsLoading">
        <div class="progress-bar-inner" :style="{ width: this.imageUploadProgress + '%' }">
        </div>
      </div>

      <div class="progress-bar-container" v-if="imageFormat === 'profile' && imageIsWaiting">
        <div class="progress-bar-inner animating">
        </div>
      </div>
    </div>
    <span class="error" v-if="showImageDimensionsError">
        {{ $t('global.ImageHasToBe') }}
        {{ imageFormatMinSizes[imageFormat].width + 'x' + imageFormatMinSizes[imageFormat].height
        }} {{ $t('global.imageDesc') }}
    </span>

  </div>
</template>

<script>

import YogoApi from '@/gateways/YogoApi';
import imagePlaceholders from '@/graphics/imagePlaceholders';
import imagesLoaded from 'vue-images-loaded';
import Imgix from '../services/Imgix';
import CloseIcon from '../graphics/icons/CloseIcon.vue';
import CameraIcon from '../graphics/icons/CameraIcon.vue';

export default {
  name: 'ImageField',
  components: { CameraIcon, CloseIcon },
  props: ['imageFormat', 'imageId'],
  directives: {
    imagesLoaded,
  },
  mixins: [Imgix],
  data() {
    return {
      randomNumber: Math.round(Math.random() * 999999999),

      fileInputKey: 0,
      imagePreviewSrc: imagePlaceholders[this.imageFormat],
      showImageDimensionsError: false,
      imageIsLoading: false,
      imageIsWaiting: false,
      imageUploadProgress: 0,

      imageFormatMinSizes: {
        profile: {
          width: 400,
          height: 400,
        },
        landscape: {
          width: 790,
          height: 200,
        },
        square: {
          width: 640,
          height: 640,
        },
      },

      windowWidth: 0,

      internalImageId: 0,
    };
  },
  computed: {
    fileInputId() {
      return `file-input-${this.randomNumber}`;
    },
  },
  mounted() {
    if (this.imageId) {
      this.internalImageId = this.imageId;
      this.fetchInitialImage();
    }
    this.$nextTick(function () {
      window.addEventListener('resize', this.getWindowWidth);
      this.getWindowWidth();
    });
  },
  beforeDestroy() {
    window.removeEventListener('resize', this.getWindowWidth);
  },
  watch: {
    imageId(newImageId) {
      if (newImageId && newImageId !== this.internalImageId) {
        this.internalImageId = newImageId;
        this.fetchInitialImage();
      }
    },
  },
  methods: {
    async fetchInitialImage() {
      const image = await YogoApi.get(`/images/${this.internalImageId}`);
      const { width: w, height: h } = this.imageFormatMinSizes[this.imageFormat];
      this.imagePreviewSrc = this.Imgix(image.filename, { w, h, fit: 'crop' });
    },
    async uploadImage(e) {
      this.showImageDimensionsError = false;

      const { files } = e.target;
      if (!files[0]) {
        return;
      }


      this.imageIsWaiting = true;

      const readerResult = await this.getFileReaderResult(files[0]);

      const imageSize = await this.getImageSizeFromReaderResult(readerResult);

      if (
        imageSize.width < this.imageFormatMinSizes[this.imageFormat].width
        || imageSize.height < this.imageFormatMinSizes[this.imageFormat].height
      ) {
        this.showImageDimensionsError = true;
        this.imageIsWaiting = false;
        return;
      }


      const data = new FormData();
      data.append('image', files[0]);

      this.imageIsWaiting = false;
      this.imageIsLoading = true;
      this.imageUploadProgress = 0;


      const image = await YogoApi.request({
        url: '/images',
        method: 'post',
        data,
        headers: { 'Content-Type': 'multipart/form-data' },
        onUploadProgress: (progressEvent) => {
          this.imageUploadProgress = Math.round(progressEvent.loaded / progressEvent.total * 100);
          if (this.imageUploadProgress === 100) {
            this.imageIsLoading = false;
            this.imageIsWaiting = true;
          }
        },
      });

      this.fileInputKey += 1;

      const { width: w, height: h } = this.imageFormatMinSizes[this.imageFormat];
      this.imagePreviewSrc = this.Imgix(image.filename, { w, h, fit: 'crop' });
      this.internalImageId = image.id;
      this.$emit('update:imageId', image.id);

      this.imageIsLoading = false;
      this.imageIsWaiting = true;
    },

    async getFileReaderResult(file) {
      return new Promise((resolve) => {
        const reader = new FileReader();
        reader.onload = () => {
          resolve(reader.result);
        };
        reader.readAsDataURL(file);
      });
    },
    async getImageSizeFromReaderResult(readerResult) {
      return new Promise((resolve) => {
        const i = new Image();
        i.onload = () => {
          resolve({
            width: i.width,
            height: i.height,
          });
        };
        i.src = readerResult;
      });
    },
    getWindowWidth() {
      this.windowWidth = document.documentElement.clientWidth;
    },
    imageDidLoad() {
      if (this.imageIsWaiting) {
        this.imageIsWaiting = false;
      }
    },
    removeImage() {
      this.imagePreviewSrc = imagePlaceholders[this.imageFormat];
      this.internalImageId = null;
      this.$emit('update:imageId', null);
      // We need a new input, because the existing will not fire a change event
      // if the user selects the same image twice in a row.
      this.fileInputKey += 1;
    },
  },


};

</script>


<style lang="scss" scoped>


  .progress-bar-container {
    position: absolute;
    height: 10px;
    border-radius: 3px;
    width: 100%;
    background: #edf2f7;
    bottom: 0;
    overflow: hidden;
  }

  .progress-bar-inner {
    height: 10px;
    border-radius: 3px;
    width: 0;
    background: #0097a7;
  }

  .animating {
    position: absolute;
    width: 40px;
    animation: loading-animation 1s infinite ease;
    left: 0;
  }

  @keyframes loading-animation {
    0% {
      left: -40%;
    }
    100% {
      left: 130%;
    }
  }

  .image-format-container {
    position: relative;
  }

  .image-format-profile {
    width: 100px;
    height: 100px;

    img {
      border-radius: 50%;
    }

    .button-overlay {
      border-radius: 0 0 50px 50px;
    }
  }

  img {
    width: 100%;
    height: 100%;
    position: absolute;
    left: 0;
    top: 0;
  }


  .button-overlay {
    background: rgba(255, 255, 255, 0.5);
    position: absolute;
    height: 50%;
    bottom: 0;
    text-align: center;
    display: flex;
    justify-content: center;
    left: 0;
    width: 100%;
    cursor: pointer;

    svg {
      margin-top: 15px;
      width: 20px;
      height: 20px;
      pointer-events: none;
    }
  }

  input {
    display: none;
  }

  .remove-image-button {
    position: absolute;
    right: -5px;
    top: -5px;
    background: white;
    padding: 5px;
    display: flex;
    justify-content: flex-end;
    align-items: flex-end;
    border-radius: 50%;
    cursor: pointer;

    svg {
      width: 20px;
      height: 20px;
    }

  }

</style>
