<script setup lang="ts">
const { client } = usePrismic()
const { data: pages } = await useAsyncData(`[record-index]`, () =>
  client.getAllByType('record', {
    orderings: {
      field: 'my.record.title',
      direction: 'asc',
    },
  })
)
</script>

<template>
  <main class="records">
    <h1>Records</h1>
    <ul class="list">
      <li v-for="page in pages">
        <NuxtLink :to="`/records/${page.uid}`">
          <div class="list-item">
            <PrismicImage :field="page.data.cover" width="64" />
            {{ page.data.title }}
          </div>
        </NuxtLink>
      </li>
    </ul>
  </main>
</template>

<style lang="stylus">
@import '../../stylus/_variables.styl'

.records {
  pad(1, 1)

  .list {
    list-style: none
    padding: 0
  }

  .list-item {
    align-items center
    display flex
    gap let(1)
    pad(0.5, 0)
  }
}
</style>
