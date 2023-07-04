<template>
  <div id="container" style="height: 700px" />
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue'

import 'leaflet/dist/leaflet.css'
import { Map, TileLayer, Marker, Control, LayerGroup, GeoJSON, DivIcon, Point } from 'leaflet'

const TILE_URL = 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png'
const ATTRIBUTION = '&copy; <a href="https://www.openstreetmap.org/copyright">OSM</a>'

const map = ref<Map | null>()

interface placeDataType {
  id: string
  data: object
}
const props = defineProps<{
  places: placeDataType[]
}>()

const placeData = ref<placeDataType[]>()

const squareIcon = new DivIcon({
  html: '□',
  iconSize: new Point(14, 22),
  iconAnchor: new Point(7, 22)
})

const tiles = new TileLayer(TILE_URL, { attribution: ATTRIBUTION, maxZoom: 18 })
const overlay = new TileLayer('https://cawm.lib.uiowa.edu/tiles/{z}/{x}/{y}.png')
const scale = new Control.Scale()
const markerLayer = new LayerGroup()
// TODO: fixme
// @ts-ignore
const geoJSON = new GeoJSON(null, {
  pointToLayer: function (feature, latlng) {
    // TODO: fixme
    // @ts-ignore
    return new Marker(latlng, { icon: squareIcon }).bindTooltip(feature.title, {
      permanent: true,
      direction: 'right'
    })
  }
})

function setupMap() {
  let zoom = 6

  // Find center point... very janky
  let [max_lat, min_lat, max_long, min_long] = [0, 180, 0, 180]
  for (const place of props.places) {
    // TODO: fixme
    // @ts-ignore
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
  const [center_lat, center_long] = [(max_lat + min_lat) / 2, (max_long + min_long) / 2]

  map.value = new Map('container', {
    preferCanvas: true,
    zoomAnimation: false,
    zoomControl: false,
    attributionControl: false,
    zoomSnap: 0.25
  }).setView([center_lat, center_long], zoom)

  // tiles.addTo(map.value)
  overlay.addTo(map.value)
  scale.addTo(map.value)
  markerLayer.addTo(map.value)
  geoJSON.addTo(map.value)
}

function reloadMarkers() {
  markerLayer.clearLayers()
  geoJSON.clearLayers()
  for (const place of props.places) {
    // TODO: fixme
    // @ts-ignore
    place.data.features[0].title = place.title
    // TODO: fixme
    // @ts-ignore
    let geoJSONdata = place.data.features[0]
    // TODO: fixme
    // @ts-ignore
    geoJSONdata.title = place.title
    geoJSON.addData(geoJSONdata)
    // new Marker(place.data.features[0].geometry.coordinates.reverse()).addTo(markerLayer)
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
}

.leaflet-tooltip {
  background-color: transparent;
  border: transparent;
  box-shadow: none;
  color: white;
  font-size: 1.4em;
  -webkit-text-stroke: 1px black;
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