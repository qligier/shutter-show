<script setup lang="ts">
const props = defineProps<{ photoUrl: string }>()
</script>

<template>
  <div id="wrapper">
    <div id="backdrop" :style="{ backgroundImage: `url(${props.photoUrl})` }"></div>
    <img id="photo" :src="props.photoUrl" alt="The current photo" />
  </div>
</template>

<style scoped>
#wrapper {
  width: 100%;
  height: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
  user-select: none;
}

img#photo {
  max-width: 100%;
  max-height: 100%;
  z-index: 10;
  box-shadow: 0 0 4em #00000075;
}

#backdrop {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-repeat: no-repeat;
  background-position: center center;
  background-size: cover;
  filter: blur(30px) brightness(0.6);
  transform: scale(1.05); /* small upscale so the blur doesn't show edges */
  z-index: 0;
}
</style>
