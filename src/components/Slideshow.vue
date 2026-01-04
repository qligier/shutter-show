<script setup lang="ts">
import { type Ref, ref, watch } from 'vue'
import Photo from '@/components/Photo.vue'

const props = defineProps<{
  photos: FileSystemFileHandle[]
}>()

const currentPhoto: Ref<FileSystemFileHandle | null> = ref(null)
const currentIndex: Ref<number> = ref(0)
const photoLength: Ref<number> = ref(0)

watch(
  () => props.photos,
  (newValue) => {
    photoLength.value = newValue.length
    if (photoLength.value > 0) {
      displayPhotoAtIndex(0)
    }
  }
)

function displayPhotoAtIndex(index: number) {
  if (index >= 0 && index < photoLength.value) {
    currentPhoto.value = props.photos[index] as FileSystemFileHandle
    currentIndex.value = index
  }
}
</script>

<template>
  <Photo v-if="currentPhoto != null" :photo="currentPhoto"></Photo>
</template>

<style scoped></style>
