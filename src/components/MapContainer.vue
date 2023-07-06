<template>
  <div id="container" style="height: 50rem;" />
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue'

import 'leaflet/dist/leaflet.css'
import {
  Map,
  TileLayer,
  Marker,
  Control,
  LayerGroup,
  GeoJSON,
  DivIcon,
  Point,
  LatLng
} from 'leaflet'
import type { place, placeData, placeFeature } from '@/Place'

const TILE_URL = 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png'
const ATTRIBUTION = '&copy; <a href="https://www.openstreetmap.org/copyright">OSM</a>'

const map = ref<Map | null>()

const props = defineProps<{
  places: place[]
}>()

defineExpose({ moveToMapLocation })

const placeData = ref<place[]>()

const squareIcon = new DivIcon({
  html: '□',
  iconSize: new Point(14, 22),
  iconAnchor: new Point(7, 22)
})

const tiles = new TileLayer(TILE_URL, {
  attribution: ATTRIBUTION,
  maxZoom: 18,
  tileSize: 512,
  zoomOffset: -1
})
const overlay = new TileLayer('https://cawm.lib.uiowa.edu/tiles/{z}/{x}/{y}.png', {
  tileSize: 512,
  zoomOffset: -1
})
const scale = new Control.Scale()
const markerLayer = new LayerGroup()

const geoJSON = new GeoJSON(undefined, {
  pointToLayer: function (feature, latlng) {
    return new Marker(latlng, { icon: squareIcon }).bindTooltip((feature as any).title, {
      permanent: true,
      direction: 'right'
    })
  }
})

function setupMap() {
  let zoom = 6

  // Find center point... very janky
  let [max_lat, min_lat, max_long, min_long] = [0, 180, 0, 180]
  let [center_lat, center_long] = [37.9, 23.7]
  let known_places = false
  for (const place of props.places) {
    if (place.known) {
      known_places = true

      const [long, lat] = place.data.features[0].geometry.coordinates
      if (max_long < long) {
        max_long = long
      }
      if (min_long > long) {
        min_long = long
      }
      if (max_lat < lat) {
        max_lat = lat
      }
      if (min_lat > lat) {
        min_lat = lat
      }
    }
  }
  if (known_places) {
    ;[center_lat, center_long] = [(max_lat + min_lat) / 2, (max_long + min_long) / 2]
  }

  map.value = new Map('container', {
    preferCanvas: true,
    zoomAnimation: false,
    zoomControl: false,
    attributionControl: false,
    zoomSnap: 0.25,
    zoom: zoom
  })

  moveToMapLocation(center_lat, center_long)

  tiles.addTo(map.value)
  overlay.addTo(map.value)
  scale.addTo(map.value)
  markerLayer.addTo(map.value)
  geoJSON.addTo(map.value)
}

function moveToMapLocation(x: number, y: number) {
  const mapValue = map.value

  if (!mapValue) return

  const mapZoom = mapValue.getZoom()

  mapValue.setView(new LatLng(x, y), mapZoom)
}

function reloadMarkers() {
  markerLayer.clearLayers()
  geoJSON.clearLayers()
  for (const place of props.places) {
    if (place.known) {
      place.data.features[0].title = place.title

      let geoJSONdata = place.data.features[0]

      geoJSONdata.title = place.title
      geoJSON.addData(geoJSONdata as any)
    }
  }
}

onMounted(() => {
  setupMap()
  reloadMarkers()
})
</script>

<style>
.leaflet-div-icon {
  background-color: transparent;
  border: transparent;
  font-size: 2em;
  font-weight: 1000;
}

.leaflet-tooltip {
  background-color: transparent;
  border: transparent;
  box-shadow: none;
  color: black;
  font-size: 1.6em;
  font-weight: 800;
  /* position: relative; */
  top: 2px;
  /* -webkit-text-stroke: 1px white; */
}

.leaflet-popup-tip-container {
  display: none;
}

.leaflet-tooltip-top:before,
.leaflet-tooltip-bottom:before,
.leaflet-tooltip-left:before,
.leaflet-tooltip-right:before {
  position: absolute;
  pointer-events: none;
  border: 6px solid transparent;
  background: transparent;
  content: '';
}

.leaflet-tile-pane {
  -webkit-filter: grayscale(100%);
  filter: grayscale(100%);
}
</style>
