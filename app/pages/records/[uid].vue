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

  console.log('Response from server:', data)
}
</script>

<template>
  <main v-if="page" class="page record">
    <div class="content">
      <div class="cover-wrapper">
        <PrismicImage
          class="cover"
          :field="page.data.cover"
          :widths="[300, 600]"
          width="300"
          :imgix-params="{ cs: 'srgb' }"
        />
      </div>
      <h1 class="record-title">{{ page.data.title }}</h1>
      <h2 class="artist-link">
        <NuxtLink
          v-if="$prismic.isFilled.contentRelationship(page.data.artist)"
          :to="`/artists/${page.data.artist.uid}`"
          class="artist-link-link"
        >
          {{ page.data.artist.data?.name }}
          <LucideChevronRight class="chevron-right" />
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
        :class="['button played-button', { checked: marked }]"
        :disabled="marked"
      >
        {{ marked ? '✔' : '+' }} Played today
      </button>

      <h3 class="detail-heading" v-if="isFilled.richText(page.data.notes)">
        Notes
      </h3>
      <div class="detail" v-if="isFilled.richText(page.data.notes)">
        <PrismicRichText :field="page.data.notes" />
      </div>

      <hr class="closer" />
    </div>
  </main>
</template>

<style lang="stylus">
@import '../../stylus/_variables.styl'

.record {
  .cover-wrapper {
    mgn(0, -1)
  }

  .cover {
    width 100%
  }

  .record-title {
    mgn(2, 0, 1)
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
    &:focus,
    &:active {
      color $white

      .chevron-right {
        opacity .75
      }
    }

    &-link {
      align-items center
      display flex
    }

    .chevron-right {
      mgn(0, 1, 0)
      margin-left auto
      opacity .2
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

  .closer {
    border-width 0
    border-bottom 1px solid rgba($white, .2)
    pad(0, 0, 3)
  }
}
</style>
