<script setup lang="ts">
const { client } = usePrismic()
const { data: pages } = await useAsyncData(`[home-index]`, () =>
  client.getAllByType('record')
)
</script>

<template>
  <main>
    <ul>
      <li v-for="page in pages">
        <NuxtLink :to="`/records/${page.uid}`">
          <div>
            <PrismicImage
              :field="page.data.cover"
              :widths="[300, 600]"
              width="300"
              :imgix-params="{ cs: 'srgb' }"
            />
          </div>
        </NuxtLink>
      </li>
    </ul>
  </main>
</template>
