<template>
  <span class="auto-send-active-indicator"></span>
</template>

<script>

export default {
  name: 'AutoSendActiveIndicator'
}

</script>

<style lang="scss" scoped>

/*
Pulsating circle
https://codepen.io/peeke/pen/BjxXZa
*/
.auto-send-active-indicator {
  display: inline-block;
  position:relative;
  width: 20px;
  height: 20px;

  /*&:before {
    content: '';
    position: relative;
    display: block;
    width: 300%;
    height: 300%;
    box-sizing: border-box;
    margin-left: -100%;
    margin-top: -100%;
    border-radius: 45px;
    background-color: #4CAF50;
    animation: pulse-ring 1.25s cubic-bezier(0.215, 0.61, 0.355, 1) infinite;
  }*/

  &:after {
    content: '';
    position: absolute;
    left: 0;
    top: 0;
    display: block;
    width: 100%;
    height: 100%;
    background-color: #4CAF50;
    border-radius: 15px;
    box-shadow: 0 0 8px rgba(0, 0, 0, .3);
    animation: pulse-dot 1.25s cubic-bezier(0.455, 0.03, 0.515, 0.955) -.4s infinite;
  }
}

@keyframes pulse-ring {
  0% {
    transform: scale(.33);
  }
  80%, 100% {
    opacity: 0;
  }
}

@keyframes pulse-dot {
  0% {
    transform: scale(.8);
  }
  50% {
    transform: scale(1);
  }
  100% {
    transform: scale(.8);
  }
}

</style>
