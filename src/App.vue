<script setup lang="ts">
import { type Ref, ref } from 'vue'
import Slideshow from './components/Slideshow.vue'

const photos: Ref<FileSystemFileHandle[] | null> = ref(null)

async function triggerDirectorySelection() {
  try {
    const dirHandle: FileSystemDirectoryHandle = await window.showDirectoryPicker();
    const newPhotos: FileSystemFileHandle[] = []
    for await (const entry of dirHandle.values()) {
      if (entry.kind === 'file' && /\.(jpg|jpeg)$/i.test(entry.name)) {
        newPhotos.push(entry);
      }
    }
    newPhotos.sort((a: FileSystemFileHandle, b: FileSystemFileHandle): number => a.name.localeCompare(b.name));

    if (newPhotos.length > 0) {
      photos.value = newPhotos;
    }
  } catch (err) {
    console.error('Error selecting directory:', err);
  }
}
</script>

<template>
  <button v-on:click="triggerDirectorySelection" v-if="photos == null">Select Directory</button>
  <Slideshow v-if="photos != null" :photos="photos"></Slideshow>
</template>

<style scoped>
</style>
