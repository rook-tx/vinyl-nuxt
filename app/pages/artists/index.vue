<script setup lang="ts">
const { client } = usePrismic()
const { data: pages } = await useAsyncData(`[artist-index]`, () =>
  client.getAllByType('artist', {
    orderings: {
      field: 'my.artist.name',
      direction: 'asc',
    },
  })
)
</script>

<template>
  <main class="artists">
    <h1>Artists</h1>
    <ul>
      <li v-for="page in pages" :key="page.id" class="list-item">
        <NuxtLink :to="`/artists/${page.uid}`" class="list-link">
          {{ page.data.name }}
        </NuxtLink>
      </li>
    </ul>
  </main>
</template>

<style lang="stylus">
@import '../../stylus/_variables.styl'

.artists {
  pad(2, 0, 2, 1)

  .list-item {
    border-bottom 1px solid rgba($white, 0.1)
  }

  .list-link {
    display block
    pad(1, 0)
  }
}
</style>
