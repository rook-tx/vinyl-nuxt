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
  <main v-if="page" class="artist">
    <h1>{{ page.data.name }}</h1>
    <ul>
      <li v-for="record in page.data.records" class="list-item">
        <div v-if="$prismic.isFilled.contentRelationship(record.record)">
          <NuxtLink :to="`/records/${record.record.uid}`" class="list-link">
            <div class="list-content">
              <PrismicImage
                v-if="record.record.data?.cover"
                :field="record.record.data.cover"
                :widths="[64, 128]"
                width="64"
                :imgix-params="{ cs: 'srgb' }"
              />
              {{ record.record.data?.title }}
            </div>
          </NuxtLink>
        </div>
      </li>
    </ul>
  </main>
</template>

<style lang="stylus">
@import '../../stylus/_variables.styl'

.artist {
  pad(2, 0, 2, 1)

  .list-item {
    border-bottom 1px solid rgba($white, 0.1)
  }

  .list-link {
    display block
    pad(.5, 0)
  }

  .list-content {
    display flex
    align-items center
    gap gut(1)
  }
}
</style>
