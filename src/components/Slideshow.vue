<script setup lang="ts">
import { onBeforeUnmount, onMounted, type Ref, ref, watch } from 'vue'
import Photo from '@/components/Photo.vue'
import Metadata from '@/components/Metadata.vue'
import { type LoadedMedia, LoadedPhoto, LoadedVideo, MediaType } from '@/types.ts'
import Video from '@/components/Video.vue'

const props = defineProps<{ photos: FileSystemFileHandle[] }>()

onMounted(() => {
  initializeSlideshow()
  // Register global keydown listener for slideshow navigation
  window.addEventListener('keydown', onKeyPress)
})

// Remove the global listener when component is destroyed
onBeforeUnmount(() => {
  window.removeEventListener('keydown', onKeyPress)
  // Revoke any created object URL for the blurred background
  if (currentMedia.value) {
    URL.revokeObjectURL(currentMedia.value.url)
    currentMedia.value = null
  }
})

watch(
  () => props.photos,
  () => initializeSlideshow(),
  { deep: true },
)

const currentMedia: Ref<LoadedMedia | null> = ref(null)
const currentIndex: Ref<number> = ref(0)
const mediaLength: Ref<number> = ref(0)

const metadataVisible: Ref<boolean> = ref(false)

// Template ref to the Metadata component
const metadataComp = ref<typeof Metadata | null>(null)
// Template ref to the Video component
const videoComp = ref<typeof Video | null>(null)

const VIDEO_EXTENSIONS = /\.(mp4|webm|mov|mkv|avi)$/i

function initializeSlideshow() {
  mediaLength.value = props.photos.length
  if (mediaLength.value > 0) {
    displayMediaAtIndex(0)
  }
}
async function displayMediaAtIndex(index: number) {
  if (index >= 0 && index < mediaLength.value) {
    const handle = props.photos[index]
    if (!handle) return
    // Revoke old URL before creating a new one
    if (currentMedia.value) {
      URL.revokeObjectURL(currentMedia.value.url)
    }
    const file = await handle.getFile()
    const url = URL.createObjectURL(file)
    if (VIDEO_EXTENSIONS.test(file.name)) {
      currentMedia.value = new LoadedVideo(handle, file, url)
    } else {
      currentMedia.value = new LoadedPhoto(handle, file, url)
    }
    currentIndex.value = index
  }
}

function onKeyPress(event: KeyboardEvent) {
  // Ignore events originating from inputs / textareas / contenteditable elements
  const target = event.target as HTMLElement | null
  if (target && target.closest('input, textarea, [contenteditable="true"]')) return

  switch (event.key) {
    case 'ArrowRight': {
      const nextIndex = (currentIndex.value + 1) % mediaLength.value
      displayMediaAtIndex(nextIndex)
      break
    }
    case 'ArrowLeft': {
      const prevIndex = (currentIndex.value - 1 + mediaLength.value) % mediaLength.value
      displayMediaAtIndex(prevIndex)
      break
    }
    case ' ': {
      if (currentMedia.value?.mediaType === MediaType.VIDEO) {
        // Delegate play/pause to the media component
        videoComp.value?.togglePlayPause()
      } else {
        metadataVisible.value = !metadataVisible.value
      }
      break
    }
    case 'm': {
      metadataComp.value?.openGoogleMaps()
      break
    }
  }
}
</script>

<template>
  <div id="wrapper">
    <div id="counter">{{ currentIndex + 1 }} / {{ mediaLength }}</div>
    <Metadata
      v-if="currentMedia != null && currentMedia.mediaType === MediaType.PHOTO"
      ref="metadataComp"
      :photo-file="currentMedia.file"
      :class="{ hidden: !metadataVisible }"
    ></Metadata>
    <Photo
      v-if="currentMedia != null && currentMedia.mediaType === MediaType.PHOTO"
      :photo-url="currentMedia.url"
    ></Photo>
    <Video
      v-if="currentMedia != null && currentMedia.mediaType === MediaType.VIDEO"
      :video-url="currentMedia.url"
      ref="videoComp"
    ></Video>
  </div>
</template>

<style scoped>
#wrapper {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  overflow: hidden;
  background-color: rgba(51, 51, 51, 0.6); /* slightly darken above blurred bg */
  z-index: 1; /* ensure content is above the blurred background */
}
#counter {
  position: absolute;
  top: 0;
  left: 0;
  color: white;
  background-color: rgba(0, 0, 0, 0.5);
  padding: 0 5px;
  font-size: 12px;
  z-index: 10;
}
Metadata {
  position: absolute;
  bottom: 10px;
  right: 10px;
  z-index: 20;
}
.hidden {
  visibility: hidden;
}
</style>
