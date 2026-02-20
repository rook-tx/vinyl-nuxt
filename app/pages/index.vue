<script setup lang="ts">
const { client } = usePrismic()
const { data: pages } = await useAsyncData(`[home-index]`, () =>
  client.getAllByType('record')
)
</script>

<template>
  <main class="page">
    <div class="content">
      <ul>
        <li v-for="page in pages">
          <NuxtLink :to="`/records/${page.uid}`">
            <div>
              <PrismicImage
                :field="page.data.cover"
                :widths="[512, 1024]"
                width="512"
                :imgix-params="{ cs: 'srgb' }"
              />
            </div>
          </NuxtLink>
        </li>
      </ul>
    </div>
  </main>
</template>
