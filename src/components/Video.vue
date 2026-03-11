<script setup lang="ts">
import { ref } from 'vue'

const props = defineProps<{ videoUrl: string }>()

const videoElement = ref<HTMLVideoElement | null>(null)

function togglePlayPause() {
  const v = videoElement.value
  if (!v) return
  if (v.paused) {
    v.play()
  } else {
    v.pause()
  }
}

defineExpose({ togglePlayPause })
</script>

<template>
  <div id="wrapper">
    <video ref="videoElement" :src="props.videoUrl" autoplay loop controls playsinline></video>
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
video {
  max-width: 100%;
  max-height: 100%;
  z-index: 10;
  box-shadow: 0 0 4em #00000075;
  background: #000;
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
