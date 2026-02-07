<script setup lang="ts">
const { client } = usePrismic()
const { data: pages } = await useAsyncData(
  `[artist-index]`,
  () => client.getAllByType('artist')
)

</script>

<template>
  <main>
    <h1>Artists</h1>
    <ul>
      <li v-for="page in pages" :key="page.id">
        <NuxtLink :to="`/artists/${page.uid}`">{{ page.data.name }}</NuxtLink>
      </li>
    </ul>
  </main>
</template>
