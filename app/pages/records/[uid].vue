<script setup lang="ts">
import { asDate, asImageSrc, isFilled } from '@prismicio/client'

const route = useRoute()
const { client } = usePrismic()
const { data: page } = await useAsyncData(
  `[record-uid-${route.params.uid}]`,
  () => client.getByUID('record', route.params.uid as string)
)

const marked = ref(false)

useSeoMeta({
  title: page.value?.data.meta_title,
  ogTitle: page.value?.data.meta_title,
  description: page.value?.data.meta_description,
  ogDescription: page.value?.data.meta_description,
  ogImage: computed(() => asImageSrc(page.value?.data.meta_image)),
})

async function addDate() {
  if (!page.value) return
  marked.value = true

  const data = await $fetch('/api/updateRecord', {
    method: 'POST',
    body: JSON.stringify({
      page: page.value,
    }),
  })
}
</script>

<template>
  <main v-if="page" class="record">
    <PrismicImage
      class="cover"
      :field="page.data.cover"
      :widths="[300, 600]"
      width="300"
      :imgix-params="{ cs: 'srgb' }"
    />
    <h1 class="record-title">{{ page.data.title }}</h1>
    <h2 class="artist-link">
      <NuxtLink
        v-if="$prismic.isFilled.contentRelationship(page.data.artist)"
        :to="`/artists/${page.data.artist.uid}`"
      >
        {{ page.data.artist.data?.name }}
      </NuxtLink>
    </h2>

    <h3 class="record-id" v-if="page.data.record_id">
      {{ page.data.record_id }}
    </h3>

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

    <h3 class="detail-heading">Played</h3>
    <div class="detail" v-if="page.data.played?.length">
      <div v-if="page.data.played[page.data.played.length - 1]?.date">
        {{
          asDate(
            page.data.played[page.data.played.length - 1]?.date
          )?.toLocaleDateString(undefined, {
            dateStyle: 'long',
          })
        }}
      </div>
    </div>

    <button
      @click="addDate"
      type="button"
      :class="['played-button', { marked: marked }]"
      :disabled="marked"
    >
      {{ marked ? '✔' : '+' }} Played today
    </button>

    <hr class="closer" />
  </main>
</template>

<style lang="stylus">
@import '../../stylus/_variables.styl'

.record {
  pad(3, 1, 2)

  .cover {
    max-width $pwidth * 1rem
    width 100%
  }

  .record-title {
    margin-bottom 0
  }

  .artist-link {
    color rgba($white, .75)
    text-decoration none
    transition color .2s
    border-bottom 1px solid rgba($white, .1)
    pad(0, 0, .5)
    mgn(1, -1, .5, 0)
    max-width none

    &:hover,
    &:focus {
      color $white
    }
  }

  .record-id {
    font-weight normal
    color rgba($white, .5)
    fs(mp(-2))
    letter-spacing .15em
    text-transform uppercase
    line-height let(1)
    mgn(.5, 0, 1)
  }

  .detail-heading {
    border-bottom 1px solid rgba($white, .1)
    font-weight normal
    color rgba($white, .75)
    fs(mp(-2))
    letter-spacing .15em
    text-transform uppercase
    line-height let(1)
    max-width none
    mgn(2, -1, .5, 0)
  }

  .detail {
    p {
      mgn(.5, 0)
    }
  }

  .played-button {
    border 1px solid rgba($white, .4)
    border-radius 4px
    font-weight normal
    color rgba($white, .75)
    fs(mp(-2))
    letter-spacing .1em
    text-transform uppercase
    transition color, border-color, background .2s
    line-height let(1)
    pad(.25, .5)
    mgn(.5, 0)

    &:hover,
    &:focus {
      background rgba($white, .1)
      color rgba($white, .75)
    }

    &:active {
      background rgba($white, .6)
      color $purple
    }

    &.marked {
      border-color rgba($white, .1)
      background rgba($white, .5)
      color $purple
    }
  }

  .closer {
    border-width 0
    border-bottom 1px solid rgba($white, .2)
    pad(0, 0, 3)
  }
}
</style>
