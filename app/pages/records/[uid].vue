<script setup lang="ts">
import type { RecordItem } from '~~/shared/types/catalog'

const route = useRoute()
const { data: page } = await useAsyncData<RecordItem>(
  `[record-uid-${route.params.uid}]`,
  () => $fetch(`/api/records/${route.params.uid as string}`)
)

const marked = ref(false)

useSeoMeta({
  title: page.value?.data.meta_title,
  ogTitle: page.value?.data.meta_title,
  description: page.value?.data.meta_description,
  ogDescription: page.value?.data.meta_description,
  ogImage: computed(() => page.value?.data.meta_image?.url),
})

async function addDate() {
  if (!page.value) return
  marked.value = true

  try {
    const data = await $fetch(`/api/records/${page.value.uid}/played`, {
      method: 'POST',
    })

    page.value = data

    console.log('Response from server:', data)
  } catch (error: unknown) {
    marked.value = false

    const statusCode =
      typeof error === 'object' &&
      error !== null &&
      'statusCode' in error &&
      typeof (error as { statusCode?: unknown }).statusCode === 'number'
        ? (error as { statusCode: number }).statusCode
        : null

    if (statusCode === 401) {
      await navigateTo(`/login?redirect=${encodeURIComponent(route.fullPath)}`)
      return
    }

    throw error
  }
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
      <h2 class="artist-link" v-if="page.data.artists.length > 0">
        <NuxtLink
          v-for="artist in page.data.artists"
          :key="artist.id"
          :to="`/artists/${artist.uid}`"
          class="artist-link-link"
        >
          {{ artist.data?.name }}
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
            new Date(
              page.data.played[page.data.played.length - 1]?.date as string
            ).toLocaleDateString(undefined, {
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

      <h3 class="detail-heading" v-if="page.data.notes">Notes</h3>
      <div class="detail" v-if="page.data.notes">
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
    color rgba($white, .5)
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
    border-bottom 1px solid rgba($white, .18)
    pad(0, 0, 3)
  }
}
</style>
