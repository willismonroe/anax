<template>
  <div id="container" style="height: 50rem;" />
  <!-- <div class="Icon">
  </div> -->
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
import type { place, placeData, placeFeature } from '/Place'

const TILE_URL = 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png'
const ATTRIBUTION = '&copy; <a href="https://www.openstreetmap.org/copyright">OSM</a>'

const map = ref<Map | null>()

const props = defineProps<{
  places: place[]
}>()

defineExpose({ moveToMapLocation })

const placeData = ref<place[]>()

const heartIcon = new DivIcon({
  html:'<svg xmlns="http://www.w3.org/2000/svg" height="1em" viewBox="0 0 512 512"><!--! Font Awesome Free 6.4.0 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license (Commercial License) Copyright 2023 Fonticons, Inc. --><path d="M47.6 300.4L228.3 469.1c7.5 7 17.4 10.9 27.7 10.9s20.2-3.9 27.7-10.9L464.4 300.4c30.4-28.3 47.6-68 47.6-109.5v-5.8c0-69.9-50.5-129.5-119.4-141C347 36.5 300.6 51.4 268 84L256 96 244 84c-32.6-32.6-79-47.5-124.6-39.9C50.5 55.6 0 115.2 0 185.1v5.8c0 41.5 17.2 81.2 47.6 109.5z"/></svg>',
  iconSize: new Point(14, 22),
  iconAnchor: new Point(7, 22)
})


const cartIcon = new DivIcon({
  html:'<svg xmlns="http://www.w3.org/2000/svg" height="1em" viewBox="0 0 576 512"><!--! Font Awesome Free 6.4.0 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license (Commercial License) Copyright 2023 Fonticons, Inc. --><path d="M0 24C0 10.7 10.7 0 24 0H69.5c22 0 41.5 12.8 50.6 32h411c26.3 0 45.5 25 38.6 50.4l-41 152.3c-8.5 31.4-37 53.3-69.5 53.3H170.7l5.4 28.5c2.2 11.3 12.1 19.5 23.6 19.5H488c13.3 0 24 10.7 24 24s-10.7 24-24 24H199.7c-34.6 0-64.3-24.6-70.7-58.5L77.4 54.5c-.7-3.8-4-6.5-7.9-6.5H24C10.7 48 0 37.3 0 24zM128 464a48 48 0 1 1 96 0 48 48 0 1 1 -96 0zm336-48a48 48 0 1 1 0 96 48 48 0 1 1 0-96z"/></svg>',
  iconSize: new Point(14, 22),
  iconAnchor: new Point(7, 22)
})


const techIcon = new DivIcon({
  html:'<svg xmlns="http://www.w3.org/2000/svg" height="1em" viewBox="0 0 640 512"><!--! Font Awesome Free 6.4.0 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license (Commercial License) Copyright 2023 Fonticons, Inc. --><path d="M384 96V320H64L64 96H384zM64 32C28.7 32 0 60.7 0 96V320c0 35.3 28.7 64 64 64H181.3l-10.7 32H96c-17.7 0-32 14.3-32 32s14.3 32 32 32H352c17.7 0 32-14.3 32-32s-14.3-32-32-32H277.3l-10.7-32H384c35.3 0 64-28.7 64-64V96c0-35.3-28.7-64-64-64H64zm464 0c-26.5 0-48 21.5-48 48V432c0 26.5 21.5 48 48 48h64c26.5 0 48-21.5 48-48V80c0-26.5-21.5-48-48-48H528zm16 64h32c8.8 0 16 7.2 16 16s-7.2 16-16 16H544c-8.8 0-16-7.2-16-16s7.2-16 16-16zm-16 80c0-8.8 7.2-16 16-16h32c8.8 0 16 7.2 16 16s-7.2 16-16 16H544c-8.8 0-16-7.2-16-16zm32 160a32 32 0 1 1 0 64 32 32 0 1 1 0-64z"/></svg>',
  iconSize: new Point(14, 22),
  iconAnchor: new Point(7, 22)
})

const bedIcon = new DivIcon({
  html:'<svg xmlns="http://www.w3.org/2000/svg" height="1em" viewBox="0 0 640 512"><!--! Font Awesome Free 6.4.0 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license (Commercial License) Copyright 2023 Fonticons, Inc. --><path d="M32 32c17.7 0 32 14.3 32 32V320H288V160c0-17.7 14.3-32 32-32H544c53 0 96 43 96 96V448c0 17.7-14.3 32-32 32s-32-14.3-32-32V416H352 320 64v32c0 17.7-14.3 32-32 32s-32-14.3-32-32V64C0 46.3 14.3 32 32 32zm144 96a80 80 0 1 1 0 160 80 80 0 1 1 0-160z"/></svg>',
  iconSize: new Point(14, 22),
  iconAnchor: new Point(7, 22)
})

const utensilIcon = new DivIcon({
  html:'<svg xmlns="http://www.w3.org/2000/svg" height="1em" viewBox="0 0 448 512"><!--! Font Awesome Free 6.4.0 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license (Commercial License) Copyright 2023 Fonticons, Inc. --><path d="M416 0C400 0 288 32 288 176V288c0 35.3 28.7 64 64 64h32V480c0 17.7 14.3 32 32 32s32-14.3 32-32V352 240 32c0-17.7-14.3-32-32-32zM64 16C64 7.8 57.9 1 49.7 .1S34.2 4.6 32.4 12.5L2.1 148.8C.7 155.1 0 161.5 0 167.9c0 45.9 35.1 83.6 80 87.7V480c0 17.7 14.3 32 32 32s32-14.3 32-32V255.6c44.9-4.1 80-41.8 80-87.7c0-6.4-.7-12.8-2.1-19.1L191.6 12.5c-1.8-8-9.3-13.3-17.4-12.4S160 7.8 160 16V150.2c0 5.4-4.4 9.8-9.8 9.8c-5.1 0-9.3-3.9-9.8-9L127.9 14.6C127.2 6.3 120.3 0 112 0s-15.2 6.3-15.9 14.6L83.7 151c-.5 5.1-4.7 9-9.8 9c-5.4 0-9.8-4.4-9.8-9.8V16zm48.3 152l-.3 0-.3 0 .3-.7 .3 .7z"/></svg>',
  iconSize: new Point(14, 22),
  iconAnchor: new Point(7, 22)
})


const bulbIcon = new DivIcon({
  html:'<svg xmlns="http://www.w3.org/2000/svg" height="1em" viewBox="0 0 384 512"><!--! Font Awesome Free 6.4.0 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license (Commercial License) Copyright 2023 Fonticons, Inc. --><path d="M272 384c9.6-31.9 29.5-59.1 49.2-86.2l0 0c5.2-7.1 10.4-14.2 15.4-21.4c19.8-28.5 31.4-63 31.4-100.3C368 78.8 289.2 0 192 0S16 78.8 16 176c0 37.3 11.6 71.9 31.4 100.3c5 7.2 10.2 14.3 15.4 21.4l0 0c19.8 27.1 39.7 54.4 49.2 86.2H272zM192 512c44.2 0 80-35.8 80-80V416H112v16c0 44.2 35.8 80 80 80zM112 176c0 8.8-7.2 16-16 16s-16-7.2-16-16c0-61.9 50.1-112 112-112c8.8 0 16 7.2 16 16s-7.2 16-16 16c-44.2 0-80 35.8-80 80z"/></svg>',
  iconSize: new Point(14, 22),
  iconAnchor: new Point(7, 22)
})

const bellIcon = new DivIcon({
  html:'<svg xmlns="http://www.w3.org/2000/svg" height="1em" viewBox="0 0 448 512"><!--! Font Awesome Free 6.4.0 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license (Commercial License) Copyright 2023 Fonticons, Inc. --><path d="M224 0c-17.7 0-32 14.3-32 32V49.9C119.5 61.4 64 124.2 64 200v33.4c0 45.4-15.5 89.5-43.8 124.9L5.3 377c-5.8 7.2-6.9 17.1-2.9 25.4S14.8 416 24 416H424c9.2 0 17.6-5.3 21.6-13.6s2.9-18.2-2.9-25.4l-14.9-18.6C399.5 322.9 384 278.8 384 233.4V200c0-75.8-55.5-138.6-128-150.1V32c0-17.7-14.3-32-32-32zm0 96h8c57.4 0 104 46.6 104 104v33.4c0 47.9 13.9 94.6 39.7 134.6H72.3C98.1 328 112 281.3 112 233.4V200c0-57.4 46.6-104 104-104h8zm64 352H224 160c0 17 6.7 33.3 18.7 45.3s28.3 18.7 45.3 18.7s33.3-6.7 45.3-18.7s18.7-28.3 18.7-45.3z"/></svg>',
  iconSize: new Point(14, 22),
  iconAnchor: new Point(7, 22)
})


const houseIcon = new DivIcon({
  html:'<svg xmlns="http://www.w3.org/2000/svg" height="1em" viewBox="0 0 576 512"><!--! Font Awesome Free 6.4.0 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license (Commercial License) Copyright 2023 Fonticons, Inc. --><path d="M575.8 255.5c0 18-15 32.1-32 32.1h-32l.7 160.2c0 2.7-.2 5.4-.5 8.1V472c0 22.1-17.9 40-40 40H456c-1.1 0-2.2 0-3.3-.1c-1.4 .1-2.8 .1-4.2 .1H416 392c-22.1 0-40-17.9-40-40V448 384c0-17.7-14.3-32-32-32H256c-17.7 0-32 14.3-32 32v64 24c0 22.1-17.9 40-40 40H160 128.1c-1.5 0-3-.1-4.5-.2c-1.2 .1-2.4 .2-3.6 .2H104c-22.1 0-40-17.9-40-40V360c0-.9 0-1.9 .1-2.8V287.6H32c-18 0-32-14-32-32.1c0-9 3-17 10-24L266.4 8c7-7 15-8 22-8s15 2 21 7L564.8 231.5c8 7 12 15 11 24z"/></svg>',
  iconSize: new Point(14, 22),
  iconAnchor: new Point(7, 22)
})


const searchIcon = new DivIcon({
html:'<svg xmlns="http://www.w3.org/2000/svg" height="1em" viewBox="0 0 512 512"><!--! Font Awesome Free 6.4.0 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license (Commercial License) Copyright 2023 Fonticons, Inc. --><path d="M416 208c0 45.9-14.9 88.3-40 122.7L502.6 457.4c12.5 12.5 12.5 32.8 0 45.3s-32.8 12.5-45.3 0L330.7 376c-34.4 25.2-76.8 40-122.7 40C93.1 416 0 322.9 0 208S93.1 0 208 0S416 93.1 416 208zM208 352a144 144 0 1 0 0-288 144 144 0 1 0 0 288z"/></svg>',
iconSize: new Point(14, 22),
iconAnchor: new Point(7, 22)
})

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
    return new Marker(latlng, { icon: heartIcon }).bindTooltip((feature as any).title, {
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
