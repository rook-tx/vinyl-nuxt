<script setup lang="ts">
function addRecord(payload: SubmitEvent) {
  const form = payload.target as HTMLFormElement
  const formData = new FormData(form)
  const data = Object.fromEntries(formData.entries())

  console.log('Adding record with data:', data)
  const res = $fetch('/api/addRecord', {
    method: 'POST',
    body: JSON.stringify(data),
  })

  console.log('Response from server:', res)
}
</script>

<template>
  <main class="record-new">
    <h1>Add new</h1>

    <form class="record-form" @submit.prevent="addRecord">
      <div class="record-detail">
        <input
          type="text"
          name="title"
          placeholder="New record"
          class="record-input record-title"
        />
        <label for="title">New record</label>
      </div>

      <div class="record-detail">
        <input
          type="text"
          name="record_id"
          placeholder="Record ID"
          class="record-input record-id"
        />
        <label for="record_id">Record ID</label>
      </div>

      <div class="record-detail">
        <input
          type="number"
          name="year"
          placeholder="1980"
          class="record-input record-year"
        />
        <label for="year">Year</label>
      </div>

      <div class="record-detail">
        <input
          type="number"
          name="original_year"
          placeholder="1979"
          class="record-input record-original-year"
        />
        <label for="original_year">Original Year</label>
      </div>

      <div class="record-detail">
        <input
          type="number"
          name="discs"
          value="1"
          placeholder="1"
          class="record-input record-discs"
        />
        <label for="discs">Discs</label>
      </div>

      <div class="record-detail">
        <input
          type="text"
          name="label"
          placeholder="Label"
          class="record-input record-label"
        />
        <label for="label">Label</label>
      </div>

      <button type="submit">Add Record</button>
    </form>
  </main>
</template>

<style lang="stylus">
@import '../../stylus/_variables.styl'

.record-new {
  pad(3, 1, 2)

  .record-input {
    border 1px solid rgba($white, .4)
    border-radius 4px
    font inherit
    color rgba($white, .75)
    pad(.25, .5)
    mgn(.5, 0, 0)
  }
}
</style>
