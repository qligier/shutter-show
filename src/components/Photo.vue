<script setup lang="ts">
import { type Ref, watch, ref } from 'vue'

const props = defineProps<{
  photo: FileSystemFileHandle
}>()

const photoUrl: Ref<string | undefined> = ref(undefined)

watch(
  () => props.photo,
  async (newValue) => {
    photoUrl.value = await getUrl(newValue)
  }
)

async function getUrl(fileHandle: FileSystemFileHandle): Promise<string> {
  const file = await fileHandle.getFile()
  return URL.createObjectURL(file)
}
</script>

<template>
  <div id="photo-wrapper">
    <img id="photo-display" :src="photoUrl" alt="The current photo"> />
  </div>
</template>

<style scoped>
#photo-wrapper {
  width: 100%;
  height: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
}

img#photo-display {
  max-width: 100%;
  max-height: 100%;
}
</style>
