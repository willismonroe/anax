<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'

import MapContainer from './MapContainer.vue'

import place_names from '../name_index.json'

const selectedPlaces = ref<string[][]>([])
const filterInput = ref('')

interface placeDataType {
  id: string
  title: string
  data: object
  changedName: boolean | null
}

const placeData = ref<placeDataType[]>([])

function clearFilter() {
  filterInput.value = ''
}

function clearSelectedPlaces() {
  selectedPlaces.value = []
  placeData.value = []
  mapUpdate.value += 1
  updateURL()
}

function removePlace(index: number) {
  selectedPlaces.value.splice(index, 1)
  placeData.value.splice(index, 1)
  updateURL()
  mapUpdate.value += 1
}

function editPlaceName(index: number, title: string) {
  editingIndex.value = index
  editName.value = title
}

function savePlaceName(index: number) {
  placeData.value[index].title = editName.value
  placeData.value[index].changedName = true
  editingIndex.value = null
  updateURL()
  mapUpdate.value += 1
}

const filteredPlaces = computed(() => {
  if (filterInput.value.length > 0) {
    const filter_text = filterInput.value.toLowerCase()
    const data = place_names.filter((place) => {
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

async function addPlace(place: string[], name: string | null) {
  await fetch(
    `https://raw.githubusercontent.com/ryanfb/pleiades-geojson/gh-pages/geojson/${place[1]}.geojson`
  )
    .then((response) => response.json())
    .then((data) => {
      if (name) {
        placeData.value.push({ id: place[1], title: name, data: data, changedName: true })
      } else {
        placeData.value.push({ id: place[1], title: data.title, data: data, changedName: false })
      }
      mapUpdate.value += 1
      updateURL()
    })
  selectedPlaces.value.push(place)
}

const editingIndex = ref<number | null>(null)
const editName = ref('')

// This ref is just incremented every change we make to force a map reload, feels janky
const mapUpdate = ref(0)

import { useRouter, useRoute } from 'vue-router'

const router = useRouter()

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
  if (route.query.places) {
    if (Array.isArray(route.query.places)) {
      for (const placeString of route.query.places) {
        if (placeString.includes('|')) {
          const [id, newTitle] = placeString.split('|')
          addPlace(
            place_names.find((place) => place[1] == id),
            newTitle
          ).then(() => {
            placeData.value.find((p) => p.id == id).title = newTitle
            placeData.value.find((p) => p.id == id).changedName = true
            mapUpdate.value += 1
          })
        } else {
          await addPlace(place_names.find((place) => place[1] == placeString))
        }
      }
    } else {
      if (route.query.places.includes('|')) {
        const [id, newTitle] = route.query.places.split('|')
        await addPlace(
          place_names.find((place) => place[1] == id),
          newTitle
        )
        placeData.value.find((p) => p.id == id).title = newTitle
        placeData.value.find((p) => p.id == id).changedName = true
        mapUpdate.value += 1
      } else {
        await addPlace(place_names.find((place) => place[1] == route.query.places))
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
    <a href="https://github.com/ryanfb">ryanfb</a>. It was created by <a href="https://willismonroe.com">Willis Monroe</a>.
  </p>
  <h4>Instructions:</h4>
  <p>
    Use the search bar below to find places in the Pleiades data and add them to your "Selected
    Places" to see them appear on the map. You can edit the name of each place to change the string
    displayed in the label. You can remove each place manually, or clear all of the selected places.
    As you modify the map the URL will change to reflect the current status of the map. You can save
    or distribute this URL to come back to the same map (it preserves name changes as well). To use this map in a presentation or publication, screenshot the resulting map and include the relevant attribution (and the URL if you want).
  </p>
  <div>
    <div class="container">
      <div class="row">
        <div class="col-sm">
          <h4>Search Places:</h4>
          <input type="text" v-model.trim="filterInput" autofocus />
          <button class="btn btn-danger" v-on:click="clearFilter">Clear</button>

          <ul v-if="filterInput">
            <li v-for="(place, index) in filteredPlaces.slice(0, 10)" v-bind:key="index">
              {{ place[0] }} <button v-on:click="addPlace(place)">Add</button>
            </li>
          </ul>
        </div>
        <div class="col-sm">
          <h4>Selected Places:</h4>
          <ul v-if="placeData.length > 0">
            <li v-for="(place, index) in placeData" v-bind:key="index">
              <span v-if="editingIndex == index">
                <input v-model="editName" type="text" />
                <button class="btn btn-success" @click="savePlaceName(index)">Save</button>
              </span>
              <span v-else
                >{{ place.title }}
                <button class="btn btn-primary" @click="editPlaceName(index, place.title)">
                  Edit
                </button>
                <button class="btn btn-danger" @click="removePlace(index)">Remove</button>
              </span>
            </li>
          </ul>
          <span class="clear-btn">
            <button
              class="btn btn-danger"
              v-if="placeData.length > 0"
              v-on:click="clearSelectedPlaces"
            >
              Clear Selected Places
            </button>
          </span>
        </div>
      </div>
    </div>
  </div>
  <MapContainer :places="placeData" :key="mapUpdate" />
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
</style>
