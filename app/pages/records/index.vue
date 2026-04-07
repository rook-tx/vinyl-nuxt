<script setup lang="ts">
const { client } = usePrismic()
const { data: records } = await useAsyncData(`[record-index]`, () =>
  client.getAllByType('record', {
    orderings: {
      field: 'my.record.title',
      direction: 'asc',
    },
  })
)
</script>

<template>
  <main class="page records">
    <div class="content">
      <div class="title-badge">
        <h1>Records</h1>
        <div class="title-count">
          <LucideLibrary />
          <span>{{ records?.length }}</span>
        </div>
      </div>
      <RecordList :records="records" v-if="records" />
    </div>
  </main>
</template>

<style lang="stylus">
@import '../../stylus/_variables.styl'

.records {
  .content {
    padding-right 0
  }

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
  
  .title-badge {
    display flex
    align-items bottom 
    justify-content space-between
    gap gut(1)
  }
  
  .title-count {
    display flex
    align-items center
    gap gut(.5)
  }
}
</style>
