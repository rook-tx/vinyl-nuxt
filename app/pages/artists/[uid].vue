<script setup lang="ts">
import { asImageSrc } from '@prismicio/client'

const route = useRoute()
const { client } = usePrismic()
const { data: page } = await useAsyncData(
  `[artist-uid-${route.params.uid}]`,
  () => client.getByUID('artist', route.params.uid as string)
)

useSeoMeta({
  title: page.value?.data.meta_title,
  ogTitle: page.value?.data.meta_title,
  description: page.value?.data.meta_description,
  ogDescription: page.value?.data.meta_description,
  ogImage: computed(() => asImageSrc(page.value?.data.meta_image)),
})
</script>

<template>
  <header>
    <NuxtLink to="/artists">Back to Artists</NuxtLink>
  </header>
  <main v-if="page">
    <h1>{{ page.data.name }}</h1>
    <ul>
      <li v-for="record in page.data.records">
        <div v-if="$prismic.isFilled.contentRelationship(record.record)">
          <NuxtLink :to="`/records/${record.record.uid}`">
            {{ record.record.data?.title }}
          </NuxtLink>
        </div>
      </li>
    </ul>
  </main>
</template>
