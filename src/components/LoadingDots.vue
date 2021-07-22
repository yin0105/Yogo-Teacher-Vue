<template>

  <div class="dots">
    <div class="dot"></div>
    <div class="dot"></div>
    <div class="dot"></div>
  </div>

</template>

<script>
export default {
  name: 'LoadingDots',
};
</script>

<style lang="scss" scoped>
@keyframes fade {
  0%, 100% {
    background-color: #f0f0f0
  }
  50% {
    background-color: #333
  }
}

.dots {
  display: inline-block;
}

.dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: #f0f0f0;
  display: inline-block;
  animation: fade .8s infinite ease-in-out;

  &:nth-child(2) {
    margin: 0 5px;
    animation-delay: .1s;
  }

  &:nth-child(3) {
    animation-delay: .2s;
  }
}

</style>


