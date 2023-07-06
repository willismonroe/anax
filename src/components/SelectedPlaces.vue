<script setup lang="ts">
import { ref } from 'vue'

import type { place } from '@/Place'

import WarningIcon from './icons/WarningIcon.vue'

const props = defineProps<{
  places: place[]
}>()

const emit = defineEmits<{
  (e: 'savePlaceName', index: number, value: string): void
  (e: 'moveToPlace', index: number): void
  (e: 'removePlace', index: number): void
}>()

const editName = ref<string>('')
const editingIndex = ref<number | null>(null)

function savePlaceName(index: number) {
  editingIndex.value = null
  emit('savePlaceName', index, editName.value)
}

function editPlaceName(index: number, title: string) {
  editingIndex.value = index
  editName.value = title
}
</script>

<template>
  <ul v-if="places.length > 0">
    <li v-for="(place, index) in places" v-bind:key="index">
      <span v-if="editingIndex == index">
        <input v-model="editName" type="text" />
        <button class="btn btn-success" @click="savePlaceName(index)">Save</button>
      </span>
      <span v-else
        >{{ place.title }}
        <span v-if="!place.known">
          <WarningIcon />
        </span>
        <button class="btn btn-primary" @click="editPlaceName(index, place.title)">Edit</button>
        <button class="btn btn-success" @click="emit('moveToPlace', index)">Move to</button>
        <button class="btn btn-danger" @click="emit('removePlace', index)">Remove</button>
      </span>
    </li>
  </ul>
</template>
