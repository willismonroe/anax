<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { useRouter, useRoute } from 'vue-router'

import MapContainer from './MapContainer.vue'
import SelectedPlaces from './SelectedPlaces.vue'
import type { place, placeData, placeFeature } from '@/Place'

// import place_names from '../name_index.json'

// This ref is just incremented every change we make to force a map reload, feels janky
const mapUpdate = ref(0)
const mapRef = ref()
const router = useRouter()

const filterInput = ref('')
const place_names = ref<object | null>()
const placeData = ref<place[]>([])
const icon = ref('□')

function clearFilter() {
  filterInput.value = ''
}

function clearSelectedPlaces() {
  placeData.value = []
  mapUpdate.value += 1
  updateURL()
}

function removePlace(index: number) {
  placeData.value.splice(index, 1)
  updateURL()
  mapUpdate.value += 1
}

function savePlaceName(index: number, value: string) {
  placeData.value[index].title = value
  placeData.value[index].changedName = true
  updateURL()
  mapUpdate.value += 1
}

function updateMap() {
  mapUpdate.value += 1
}

const fullURL = computed(() => {
  return window.location.href
})

const filteredPlaces = computed(() => {
  if (filterInput.value.length > 0) {
    const filter_text = filterInput.value.toLowerCase()

    const data = place_names.value.filter((place) => {
      return place[0].toLowerCase().startsWith(filter_text)
    })

    return data.sort((placeA, placeB) => {
      if (placeA[0] < placeB[0]) {
        return -1
      } else {
        return 1
      }
    })
  } else {
    return []
  }
})

function moveToPlace(index: number) {
  const place = placeData.value[index]
  if (!location) return
  const [long, lat] = place.data.features[0].geometry.coordinates
  mapRef.value.moveToMapLocation(lat, long)
}

async function addPlace(place: string[], name?: string) {
  await fetch(
    `https://raw.githubusercontent.com/ryanfb/pleiades-geojson/gh-pages/geojson/${place[1]}.geojson`
  )
    .then((response) => response.json())
    .then((data) => {
      const known = data.features[0].geometry ? true : false
      placeData.value.push({
        id: place[1],
        title: name || data.title,
        data: data,
        changedName: name ? true : false,
        known: known
      })
      mapUpdate.value += 1
      updateURL()
    })
}

function updateURL() {
  let placeList = []
  for (const place of placeData.value) {
    if (place.changedName) {
      placeList.push(`${place.id}|${place.title}`)
    } else {
      placeList.push(place.id)
    }
  }
  router.push({
    query: {
      places: placeList
    }
  })
}

const route = useRoute()

onMounted(async () => {
  await router.isReady()

  await fetch('https://raw.githubusercontent.com/ryanfb/pleiades-geojson/gh-pages/name_index.json')
    .then((response) => response.json())
    .then((data) => {
      place_names.value = data
    })

  if (route.query.places) {
    if (Array.isArray(route.query.places)) {
      for (const placeString of route.query.places) {
        if (!placeString) continue

        if (placeString.includes('|')) {
          const [id, newTitle] = placeString.split('|')

          const foundPlaceName = place_names.value.find((place) => place[1] == id)

          if (!foundPlaceName) continue

          addPlace(foundPlaceName, newTitle).then(() => {
            const place = placeData.value.find((p) => p.id == id)

            // Place not found by ID
            if (!place) return

            place.title = newTitle
            place.changedName = true

            mapUpdate.value += 1
          })
        } else {
          const place = place_names.value.find((place) => place[1] == placeString)

          if (!place) return

          await addPlace(place)
        }
      }
    } else {
      if (route.query.places.includes('|')) {
        const [id, newTitle] = route.query.places.split('|')

        const place_name = place_names.value.find((place) => place[1] == id)

        if (!place_name) return

        await addPlace(place_name, newTitle)

        const place = placeData.value.find((p) => p.id == id)

        if (!place) return

        place.title = newTitle
        place.changedName = true

        mapUpdate.value += 1
      } else {
        const place_name = place_names.value.find((place) => place[1] == route.query.places)

        if (!place_name) return

        await addPlace(place_name)
      }
    }
    mapUpdate.value += 1
  }
})
</script>

<template>
  <h4>Introduction:</h4>
  <p>
    This tool allows you to make simple maps of points derived from the
    <a href="https://pleiades.stoa.org/">Pleiades project</a>. It uses a
    <a href="https://github.com/ryanfb/pleiades-geojson">dump</a> of the Pleiades data provided by
    <a href="https://github.com/ryanfb">ryanfb</a>. It was created by
    <a href="https://willismonroe.com">Willis Monroe</a>.
  </p>
  <h4>Instructions:</h4>
  <p>
    Use the search bar below to find places in the Pleiades data and add them to your "Selected
    Places" to see them appear on the map. You can edit the name of each place to change the string
    displayed in the label. You can remove each place manually, or clear all of the selected places.
    As you modify the map the URL will change to reflect the current status of the map. You can save
    or distribute this URL to come back to the same map (it preserves name changes as well); here's
    an
    <a
      href="https://willismonroe.github.io/anax/?places=912986|Uruk&places=893964|Borsippa&places=893951|Babylon+(%F0%92%86%8D%F0%92%80%AD%F0%92%8A%8F%F0%92%86%A0)&places=912910|Nippur&places=893976|Ctesiphon"
      >example url</a
    >
    featuring some cuneiform in a place label. To use this map in a presentation or publication,
    screenshot the resulting map and include the relevant attribution (and the URL if you want).
  </p>
  <p>
    If you encounter bugs or think of improvements to this tool please add them to the
    <a href="https://github.com/willismonroe/anax/issues">issues page</a> on Github. If you want to
    help out with development feel free to pitch in as well!
  </p>
  <div>
    <div class="container">
      <div class="row">
        <div class="col-sm">
          <h5>Search Places:</h5>
          <input type="text" v-model.trim="filterInput" autofocus />
          <button class="btn btn-danger" v-on:click="clearFilter">Clear</button>
          <ul v-if="filterInput">
            <li v-for="(place, index) in filteredPlaces.slice(0, 10)" v-bind:key="index">
              {{ place[0] }}
              <button class="btn btn-primary" v-on:click="addPlace(place)">→</button>
            </li>
          </ul>
        </div>
        <div class="col-sm">
          <h5>Selected Places:</h5>
          <SelectedPlaces
            :places="placeData"
            @savePlaceName="savePlaceName"
            @moveToPlace="moveToPlace"
            @removePlace="removePlace"
          />
          <span class="clear-btn">
            <button
              class="btn btn-danger"
              v-if="placeData.length > 0"
              v-on:click="clearSelectedPlaces"
            >
              Clear Selected Places
            </button>
          </span>
          <h5>Select Icon</h5>
          <select v-model="icon" @change="updateMap">
            <option selected>□</option>
            <option>★</option>
            <option>✱</option>
            <option>◈</option>
            <option>❖</option>
            <option>▲</option>
            <option>⇩</option>
          </select>
        </div>
      </div>
    </div>
  </div>
  <h4>Map:</h4>
  <div class="map-border">
    <MapContainer :places="placeData" :key="mapUpdate" :icon="icon" ref="mapRef" />
  </div>
  <h4>URL:</h4>
  <pre>{{ fullURL }}</pre>
  <h4>Attribution:</h4>
  <p>
    The map data is provided by <a href="https://pleiades.stoa.org/credits">Pleiades</a> under a
    CC-BY license. The map tiles are provided by
    <a href="http://cawm.lib.uiowa.edu/index.html">Consortium of Ancient World Mappers</a> also
    under a CC-BY license.
  </p>
</template>

<style scoped>
h4 {
  padding-top: 1rem;
}
span {
  padding: 1rem;
}
.btn {
  margin: 0.2rem;
}
.clear-btn {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}
.map-border {
  border: 5px solid black;
}
</style>
