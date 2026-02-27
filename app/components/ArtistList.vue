<script setup lang="ts">
import type { ArtistDocument } from '~~/prismicio-types'

export type ArtistListData = {
  uid: ArtistDocument['uid']
  data: {
    name: ArtistDocument['data']['name']
  }
}

const props = defineProps({
  artists: {
    type: Array as () => ArtistListData[],
    required: true,
  },
})
</script>

<template>
  <ol class="artist-list">
    <li v-for="artist in artists" class="list-item">
      <NuxtLink :to="`/artists/${artist.uid}`" class="list-link">
        <span>{{ artist.data.name }}</span>
        <LucideChevronRight class="chevron-right" />
      </NuxtLink>
    </li>
  </ol>
</template>

<style lang="stylus">
@import '../stylus/_variables'

.artist-list {
  .list-item {
    border-bottom 1px solid rgba($white, 0.1)
  }

  .list-link {
    display flex
    align-items center
    pad(1, 0)

    &:active {
      .chevron-right {
        opacity .75
      }
    }

    @media (hover: hover) {
      &:hover {
        .chevron-right {
          opacity .5
        }
      }
    }
  }

  .chevron-right {
    mgn(0, 1, 0)
    margin-left auto
    opacity .15
  }
}
</style>
