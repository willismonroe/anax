<script setup lang="ts">
import MainContent from './components/MainContent.vue'
</script>

<template>
  <div class="page">
    <div></div>
    <div class="card">
      <div class="card-body">
        <div class="card-title">
          <h2>Anax - A Pleiades Map Making Tool</h2>
          <p>
            Created by <a href="https://twitter.com/willismonroe">@willismonroe</a> (<a
              href="https://github.com/willismonroe"
              >Github</a
            >)
          </p>
        </div>
        <div class="card-text">
          <MainContent />
        </div>
      </div>
    </div>
    <div></div>
  </div>
</template>

<style scoped>
.page {
  display: grid;
  grid-template-columns: 1fr 6fr 1fr;
}

h2 {
  color: #577590;
}
</style>
