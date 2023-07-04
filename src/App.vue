<script setup lang="ts">
import MainContent from "./components/MainContent.vue";
</script>

<template>
  <div class="page">
    <div></div>
    <div>
      <header>
        <h2>Anax - A Pleiades Map Making Tool</h2>
        <p>Created by <a href="https://twitter.com/willismonroe">@willismonroe</a> (<a href="https://github.com/willismonroe">Github</a>)</p>
      </header>
      <div class="content">
        <MainContent />
      </div>
    </div>
    <div></div>
  </div>
</template>

<style scoped>
.page {
  display: grid;
  grid-template-columns: 1fr 5fr 1fr;
}

header {
  margin: 1em;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  background-color: aliceblue;
  border: 2px solid #00A4BD;
  padding: 10px;
  box-shadow: 6px 4px #00A4BD;
  border-radius: 1em;
}

.content {
  margin: 1em;
  padding: 2em;
  display: flex;
  flex-direction: column;
  /* align-items: center; */
  justify-content: center;
  background-color: aliceblue;
  border: 2px solid #00A4BD;
  padding: 10px;
  box-shadow: 6px 4px #00A4BD;
  border-radius: 1em;
}

/* div {
  border: solid red 1px;
} */

h2 {
  color: #577590;
}
</style>
