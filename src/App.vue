<script setup lang="ts">
import { type Ref, ref } from 'vue'
import Slideshow from './components/Slideshow.vue'

const photos: Ref<FileSystemFileHandle[] | null> = ref(null)
const collator = new Intl.Collator(undefined, { numeric: true, sensitivity: 'base' })

async function triggerDirectorySelection() {
  try {
    const dirHandle: FileSystemDirectoryHandle = await window.showDirectoryPicker()
    const newPhotos: FileSystemFileHandle[] = []
    for await (const entry of dirHandle.values()) {
      if (entry.kind === 'file' && /\.(jpg|jpeg)$/i.test(entry.name)) {
        newPhotos.push(entry)
      }
    }
    newPhotos.sort((a: FileSystemFileHandle, b: FileSystemFileHandle): number =>
      collator.compare(a.name, b.name),
    )

    if (newPhotos.length > 0) {
      photos.value = newPhotos
    }
  } catch (err) {
    console.error('Error selecting directory:', err)
  }
}
</script>

<template>
  <div class="center-wrap" v-if="photos == null">
    <p>Welcome to ShutterShow, a simple but visually appealing photo slideshow app.</p>
    <p>Select a directory containing JPEG photos to get started.</p>
    <ul>
      <li>Use <kbd>left arrow</kbd> and <kbd>right arrow</kbd> keys to navigate between photos;</li>
      <li>Use <kbd>space</kbd> to toggle the photo metadata and map.</li>
    </ul>
    <button
      v-on:click="triggerDirectorySelection"
      v-if="photos == null"
      class="select-dir"
      aria-label="Select photo directory"
    >
      Select directory…
    </button>
  </div>
  <Slideshow v-if="photos != null" class="slideshow" :photos="photos"></Slideshow>
</template>

<style scoped>
.center-wrap {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 2rem;
  font-size: 1.2rem;
}

.select-dir {
  appearance: none;
  -webkit-appearance: none;
  background: linear-gradient(135deg, #4f46e5 0%, #06b6d4 100%);
  color: #fff;
  border: none;
  padding: 1.25rem 2rem;
  font-size: 1.5rem;
  line-height: 1;
  border-radius: 16px;
  font-weight: 800;
  cursor: pointer;
  transition:
    transform 0.08s ease,
    box-shadow 0.12s ease,
    opacity 0.12s ease;
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  font-family: inherit;
  outline: 4px solid rgba(99, 102, 241, 0.18);
  outline-offset: 4px;
  transform: translateY(-3px);
  box-shadow: 0 18px 44px rgba(15, 23, 42, 0.2);
  margin-top: 2em;
}
.select-dir:hover {
  transform: translateY(-3px);
  box-shadow: 0 14px 34px rgba(15, 23, 42, 0.18);
}
.select-dir:active {
  transform: translateY(0);
  box-shadow: 0 8px 28px rgba(15, 23, 42, 0.14);
}
.select-dir:focus {
  outline: 4px solid rgba(99, 102, 241, 0.18);
  outline-offset: 4px;
}

kbd {
  color: #ccc;
  font-size: 0.85em;
  font-weight: bold;
  padding: 2px 4px;
}

p,
ul {
  margin: 0.6em 0;
}
</style>
