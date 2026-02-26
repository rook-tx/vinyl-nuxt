<script setup lang="ts">
import Fuse from 'fuse.js'
import type { ArtistDocument, RecordDocument } from '~~/prismicio-types'
import ArtistList from './ArtistList.vue'

const props = defineProps({
  placeholder: {
    type: String,
    default: 'Search by record title…',
  },
  records: {
    type: Array as () => RecordDocument<string>[],
  },
  artists: {
    type: Array as () => ArtistDocument<string>[],
  },
})

const searchTerm = ref('')
const filteredRecords = ref<RecordDocument<string>[]>([])
const filteredArtists = ref<ArtistDocument<string>[]>([])

const fuse = props.records
  ? new Fuse(props.records, {
      keys: ['data.title'],
    })
  : null
const fuseArtists = props.artists
  ? new Fuse(props.artists, {
      keys: ['data.name'],
    })
  : null

function searchAllData() {
  if (!searchTerm.value) {
    filteredRecords.value = []
    filteredArtists.value = []
    return
  }

  if (fuse) {
    const results = fuse.search(searchTerm.value).map((result) => result.item)
    filteredRecords.value = results.splice(0, 5) // Limit to top 5 results
  }
  if (fuseArtists) {
    const results = fuseArtists
      .search(searchTerm.value)
      .map((result) => result.item)
    filteredArtists.value = results.splice(0, 5) // Limit to top 5 results
  }
}
</script>

<template>
  <section class="search-section">
    <div class="search-section__input-wrapper">
      <input
        type="text"
        class="input"
        :placeholder="placeholder"
        v-model="searchTerm"
        @input="searchAllData"
      />
    </div>

    <RecordList :records="filteredRecords" v-if="filteredRecords.length > 0" />
    <ArtistList :artists="filteredArtists" v-if="filteredArtists.length > 0" />
  </section>
</template>

<style lang="stylus">
@import '../stylus/_variables'

.search-section {
  border-bottom 1px solid rgba($white, .5)
  pad(0, 0, 2)
  mgn(0, 0, 2)
}
</style>
