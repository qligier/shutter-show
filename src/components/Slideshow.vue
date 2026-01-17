<script setup lang="ts">
import { onMounted, onBeforeUnmount, type Ref, ref, watch } from 'vue'
import Photo from '@/components/Photo.vue'
import Metadata from '@/components/Metadata.vue'

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
  if (currentPhoto.value) {
    URL.revokeObjectURL(currentPhoto.value.url)
    currentPhoto.value = null
  }
})

watch(
  () => props.photos,
  () => initializeSlideshow(),
  { deep: true },
)

const currentPhoto: Ref<LoadedPhoto | null> = ref(null)
const currentIndex: Ref<number> = ref(0)
const photoLength: Ref<number> = ref(0)

const metadataVisible: Ref<boolean> = ref(false)

// Template ref to the Metadata component
const metadataComp = ref<typeof Metadata | null>(null)

class LoadedPhoto {
  constructor(
    public readonly handle: FileSystemFileHandle,
    public readonly file: File,
    public readonly url: string,
  ) {}
}

function initializeSlideshow() {
  photoLength.value = props.photos.length
  if (photoLength.value > 0) {
    displayPhotoAtIndex(0)
  }
}
async function displayPhotoAtIndex(index: number) {
  if (index >= 0 && index < photoLength.value) {
    const handle = props.photos[index]
    if (!handle) return
    const file = await handle.getFile()
    const url = URL.createObjectURL(file)
    currentPhoto.value = new LoadedPhoto(handle, file, url)
    currentIndex.value = index
  }
}

function onKeyPress(event: KeyboardEvent) {
  // Ignore events originating from inputs / textareas / contenteditable elements
  const target = event.target as HTMLElement | null
  if (target && target.closest('input, textarea, [contenteditable="true"]')) return

  switch (event.key) {
    case 'ArrowRight': {
      const nextIndex = (currentIndex.value + 1) % photoLength.value
      displayPhotoAtIndex(nextIndex)
      break
    }
    case 'ArrowLeft': {
      const prevIndex = (currentIndex.value - 1 + photoLength.value) % photoLength.value
      displayPhotoAtIndex(prevIndex)
      break
    }
    case ' ': {
      metadataVisible.value = !metadataVisible.value
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
    <div id="counter">{{ currentIndex + 1 }} / {{ photoLength }}</div>
    <Metadata
      v-if="currentPhoto != null"
      ref="metadataComp"
      :photo-file="currentPhoto.file"
      :class="{ hidden: !metadataVisible }"
    ></Metadata>
    <Photo v-if="currentPhoto != null" :photo-url="currentPhoto.url"></Photo>
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
