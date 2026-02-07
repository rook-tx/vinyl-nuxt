<script setup lang="ts">
const { client } = usePrismic()
const { data: pages } = await useAsyncData(`[record-index]`, () =>
  client.getAllByType('record')
)
</script>

<template>
  <main>
    <h1>Records</h1>
    <ul>
      <li v-for="page in pages" :key="page.id">
        <NuxtLink :to="`/records/${page.uid}`">
          <div>
            <PrismicImage :field="page.data.cover" width="100" />
            {{ page.data.title }}
          </div>
        </NuxtLink>
      </li>
    </ul>
  </main>
</template>
