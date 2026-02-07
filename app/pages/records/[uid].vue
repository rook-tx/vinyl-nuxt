<script setup lang="ts">
import { asImageSrc } from '@prismicio/client'

const route = useRoute()
const { client } = usePrismic()
const { data: page } = await useAsyncData(
  `[record-uid-${route.params.uid}]`,
  () => client.getByUID('record', route.params.uid as string)
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
    <NuxtLink to="/records">< Records</NuxtLink>
  </header>
  <main v-if="page" class="record">
    <PrismicImage :field="page.data.cover" width="300" />
    <h1>{{ page.data.title }}</h1>
    <NuxtLink
      v-if="$prismic.isFilled.contentRelationship(page.data.artist)"
      :to="`/artists/${page.data.artist.uid}`"
    >
      <h2>{{ page.data.artist.data?.name }}</h2>
    </NuxtLink>
    <h3>
      {{ page.data.year }}
      <span v-if="page.data.original_year"
        >({{ page.data.original_year }})</span
      >
    </h3>
  </main>
</template>

<style lang="stylus">
@import '../../stylus/_variables.styl'

.record {
  pad(1, 1)
}
</style>
