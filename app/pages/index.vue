<script setup lang="ts">
import SearchSection from '~/components/SearchSection.vue'

const { client } = usePrismic()
const { data: records } = await useAsyncData(`[home-index]`, () =>
  client.getAllByType('record')
)
</script>

<template>
  <main class="page">
    <div class="content">
      <SearchSection :records="records ?? []" />
      <ul>
        <li v-for="record in records" :key="record.id">
          <NuxtLink :to="`/records/${record.uid}`">
            <div>
              <PrismicImage
                :field="record.data.cover"
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
