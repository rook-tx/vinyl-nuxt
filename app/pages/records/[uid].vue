<script setup lang="ts">
import { asImageSrc, isFilled } from '@prismicio/client'

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
  <main v-if="page" class="record">
    <PrismicImage :field="page.data.cover" width="300" />
    <h1>{{ page.data.title }}</h1>
    <NuxtLink
      v-if="$prismic.isFilled.contentRelationship(page.data.artist)"
      :to="`/artists/${page.data.artist.uid}`"
    >
      <h2>{{ page.data.artist.data?.name }}</h2>
    </NuxtLink>

    <h3 class="detail-heading" v-if="page.data.year">Release</h3>
    <div class="detail" v-if="page.data.year">
      {{ page.data.year }}
      <span v-if="page.data.original_year">
        ({{ page.data.original_year }})
      </span>
    </div>

    <h3 class="detail-heading" v-if="page.data.label">Label</h3>
    <div class="detail" v-if="page.data.label">{{ page.data.label }}</div>

    <h3 class="detail-heading" v-if="isFilled.richText(page.data.notes)">
      Notes
    </h3>
    <div class="detail" v-if="isFilled.richText(page.data.notes)">
      <PrismicRichText :field="page.data.notes" />
    </div>
  </main>
</template>

<style lang="stylus">
@import '../../stylus/_variables.styl'

.record {
  pad(3, 0, 2, 1)

  .detail-heading {
    border-bottom 1px solid rgba($white, .1)
    font-weight normal
    color rgba($white, .75)
    fs(mp(-2))
    letter-spacing .15em
    text-transform uppercase
    line-height let(1)
    max-width 100%
    mgn(2, 0, .5)
  }

  .detail {
    p {
      mgn(.5, 0)
    }

    &:last-child {
      border-bottom 1px solid rgba($white, .1)
      pad(0, 0, 3)
    }
  }
}
</style>
