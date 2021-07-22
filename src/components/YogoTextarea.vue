<template>
  <div class="yogo-input-field">

    <div class="flex flex-col">

      <label :for="inputId">
        {{ label }} <span v-if="required">*</span>
      </label>

      <div class="input-container">

        <textarea
          ref="textarea"
          :value="value"
          @input="updateValue"
          :id="inputId"
          :v-model="vModel"
          cols="30"
          rows="10"
        >

        </textarea>

      </div>

    </div>

    <slot name="errors"></slot>

  </div>
</template>

<script>
export default {
  name: 'YogoTextarea',
  props: [
    'label',
    'value',
    'required',
    'vModel',
    'inputId',
  ],
  methods: {
    updateValue() {
      this.$emit('input', this.$refs.textarea.value);
    },
  },
};
</script>

<style lang="scss" scoped>


.yogo-input-field {

  padding-bottom: 10px;

  textarea {
    display: flex;
    vertical-align: middle;
    border-radius: 2px;
    min-width: 50px;
    max-width: 635px;
    width: 100%;
    min-height: 52px;
    background-color: #edf2f7;
    border: 1px solid rgba(36, 28, 21, 0.3);
    transition: all 0.2s ease-in-out 0s;
    font-size: 1em;
    line-height: 20px;
    padding: 15px;
    margin-bottom: 10px;
    -webkit-appearance: none;

    &:focus {
      outline: none;
      border: 1px solid #000;
      box-shadow: inset 0 0 0 1px #000;
    }
  }

  label {
    color: #000;
    font-weight: bold;
    display: block;
    max-width: 635px;
    padding-bottom: 12px;
    -webkit-user-select: none;
    -ms-user-select: none;
    -moz-user-select: none;
    user-select: none;
  }

  .error {
    display: none;
    left: 0;
    opacity: 0;
    -webkit-transform: translate3d(0, -8px, 0);
    transform: translate3d(0, -8px, 0);
  }

  &.invalid .error {
    opacity: 1;
    -webkit-transform: translateZ(0);
    transform: translateZ(0);
    background: #fbeeca;
    font-weight: bold;
    padding: 14px;
    padding-left: 55px;
    margin-bottom: 10px;
    display: flex !important;
    align-items: center;

    &:before {
      content: '';
      background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='currentColor' stroke-width='2' stroke-linecap='round' stroke-linejoin='round' class='feather feather-info'%3E%3Ccircle cx='12' cy='12' r='10'%3E%3C/circle%3E%3Cline x1='12' y1='16' x2='12' y2='12'%3E%3C/line%3E%3Cline x1='12' y1='8' x2='12.01' y2='8'%3E%3C/line%3E%3C/svg%3E");
      padding-bottom: 6px;
      font-size: 16px;
      position: absolute;
      width: 25px;
      height: 25px;
      left: 16px;
      display: flex;
      justify-content: center;
      align-items: center;
      line-height: 1;
    }
  }

}

</style>
