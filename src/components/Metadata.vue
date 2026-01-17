<script setup lang="ts">
import { ref, onMounted, watch, onBeforeUnmount, type Ref } from 'vue'
import ExifReader from 'exifreader'
import moment from 'moment'
import { type LngLatLike, Map, Marker } from 'maplibre-gl'
import 'maplibre-gl/dist/maplibre-gl.css';

const props = defineProps<{ photoFile: File }>()

const metadata: Ref<PhotoMetadata | null> = ref(null)
const mapContainer: Ref<HTMLDivElement | null> = ref(null)
let map: Map | null = null
let mapMarker: Marker | null = null

const DEFAULT_ZOOM = 4

onMounted(() => {
  runParse()
})

onBeforeUnmount(() => {
  // cleanup map resources
  try {
    if (mapMarker) mapMarker.remove()
  } catch {}
  try {
    if (map) map.remove()
  } catch {}
})

watch(
  () => props.photoFile,
  () => {
    runParse()
  },
)

watch(
  () => [metadata.value?.latitude, metadata.value?.longitude],
  async ([lat, lon]) => {
    // initialize or update the map when coords change
    if (lat != null && lon != null) {
      await ensureMapIsReady(lat, lon)
    } else {
      // remove existing marker if coords removed
      try {
        if (mapMarker) mapMarker.remove()
      } catch {}
    }
  },
)

type PhotoMetadata = {
  date: moment.Moment | null
  latitude: number | null
  longitude: number | null
  aperture: string | null
  focalLength: string | null
  exposure: string | null
  iso: string | null
  cameraModel: string | null
}

async function runParse() {
  if (!props.photoFile) return
  metadata.value = null

  try {
    let tags: Record<string, unknown>
    try {
      // ExifReader supports passing a File directly
      tags = await ExifReader.load(props.photoFile)
    } catch {
      // parser failed
      console.error('ExifReader failed to parse EXIF data')
      return
    }
    metadata.value = extractMetadata(tags)
  } catch {
    console.error('ExifReader failed to parse EXIF data')
  }
}

function isObject(v: unknown): v is Record<string, unknown> {
  return typeof v === 'object' && v !== null
}

function extractMetadata(tags: Record<string, unknown>): PhotoMetadata {
  const getTag = (name: string) => {
    const t = (tags as Record<string, unknown>)[name]
    if (!t) return null
    // t may be an object with description or value
    if (isObject(t)) {
      const obj = t as Record<string, unknown>
      if ('description' in obj && obj.description != null) return obj.description
      if ('value' in obj && obj.value != null) return obj.value
    }
    return t as unknown
  }
  const isString = (value: unknown) => typeof value === 'string' || value instanceof String

  // Date
  const dt = getTag('DateTimeOriginal') ?? getTag('DateTime') ?? getTag('CreateDate') ?? null
  const date = isString(dt) ? moment(dt as string, 'YYYY:MM:DD HH:mm:ss') : null

  // Camera model
  const cameraModel = (getTag('Model') ?? getTag('CameraModel') ?? null) as string | null

  // Aperture (FNumber or ApertureValue)
  const aperture = (getTag('FNumber') ?? getTag('ApertureValue') ?? null) as string | null

  // Focal length
  const focalLength = (getTag('FocalLength') ?? getTag('FocalLengthIn35mmFilm') ?? null) as
    | string
    | null

  // Exposure time
  const exposure = (getTag('ExposureTime') ?? null) as string | null

  // ISO
  const iso = (getTag('ISO') ??
    getTag('ISOSpeedRatings') ??
    getTag('PhotographicSensitivity') ??
    null) as string | null

  // GPS
  const latitude = parseGPS(tags, 'GPSLatitude', 'GPSLatitudeRef')
  const longitude = parseGPS(tags, 'GPSLongitude', 'GPSLongitudeRef')

  return {
    date,
    latitude,
    longitude,
    aperture,
    focalLength,
    exposure,
    iso,
    cameraModel,
  } as PhotoMetadata
}

function parseGPS(tags: Record<string, unknown>, coordTag: string, refTag: string): number | null {
  const coord = tags[coordTag] as Record<string, unknown> | undefined
  const ref = tags[refTag] as Record<string, unknown> | undefined
  if (!coord || !ref) return null

  let decimalCoord: number | null = Number.parseFloat(coord.description as string)
  const refCode = (ref.value as string[])[0]

  if (refCode === 'S' || refCode === 'W') {
    decimalCoord = -decimalCoord
  }
  return decimalCoord
}

async function ensureMapIsReady(lat: number, lon: number) {
  if (!mapContainer.value) return

  const position: LngLatLike = [lon, lat]
  try {
    if (!map) {
      map = new Map({
        container: mapContainer.value,
        style: 'https://api.maptiler.com/maps/streets-v4-dark/style.json?key=pxZ3szlS2ezYAhmie1UZ',
        center: position,
        zoom: DEFAULT_ZOOM,
        maplibreLogo: false,
        attributionControl: false,
      })
    } else {
      map.setCenter(position).setZoom(DEFAULT_ZOOM)
    }
    map.resize()

    // update or create marker
    try {
      if (mapMarker) {
        mapMarker.remove()
      }
      mapMarker = new Marker().setLngLat(position).addTo(map)
    } catch {
      // ignore marker errors
    }
  } catch (err) {
    console.error('Failed to load maplibre-gl or initialize map', err)
  }
}

// Expose a helper to open the current coordinates in Google Maps from the parent component.
function openGoogleMaps() {
  const lat = metadata.value?.latitude
  const lon = metadata.value?.longitude
  if (lat == null || lon == null) {
    return
  }
  const query = `${lat},${lon}`
  const url = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(query)}`
  window.open(url, '_blank', 'noopener')
}

defineExpose({ openGoogleMaps })
</script>

<template>
  <div class="metadata">
    <dl v-if="metadata">
      <dt>Date</dt>
      <dd>{{ metadata.date?.format('dddd DD MMMM YYYY') ?? '—' }}</dd>
      <dt>Time</dt>
      <dd>{{ metadata.date?.format('HH:mm:ss') ?? '—' }}</dd>
      <dt>Camera</dt>
      <dd>{{ metadata.cameraModel ?? '—' }}</dd>
      <dt>Aperture</dt>
      <dd>{{ metadata.aperture ?? '—' }}</dd>
      <dt>Exposure</dt>
      <dd>{{ metadata.exposure ?? '—' }}</dd>
      <dt>Focal length</dt>
      <dd>{{ metadata.focalLength ?? '—' }}</dd>
      <dt>ISO</dt>
      <dd>{{ metadata.iso ?? '—' }}</dd>
    </dl>

    <!-- map appears when coordinates are available -->
    <div
      ref="mapContainer"
      id="map"
      :class="{
        hidden: metadata == null || metadata.latitude == null || metadata.longitude == null,
      }"
    ></div>
  </div>
</template>

<style scoped>
.metadata {
  position: absolute;
  top: 0;
  right: 0;
  color: #eee;
  font-size: 13px;
  z-index: 20;
  height: 100%;
  width: 400px;
}

dl {
  display: grid;
  grid-template-columns: 90px 1fr;
  gap: 6px 6px;
  background: rgba(0, 0, 0, 0.7);
  padding: 10px 0;
  width: 270px;
  float: right;
  border-bottom-left-radius: 2px;
}
dt {
  font-style: italic;
  text-align: right;
  opacity: 0.6;
}

#map {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  height: 300px;
  width: 400px;
  border-top-left-radius: 2px;
}
.hidden {
  visibility: hidden;
}
</style>
