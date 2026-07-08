<script setup lang="ts">
definePageMeta({
  middleware: 'auth-gate',
})

type RecordData = {
  title?: string
  artist_names?: string
  cover_url?: string
  record_id?: string
  year?: number
  original_year?: number
  discs?: number
  label?: string
  notes?: string
}

const submitted = ref(false)
const errorMessage = ref('')
const route = useRoute()

function addRecord(payload: SubmitEvent) {
  const form = payload.target as HTMLFormElement
  const formData = new FormData(form)

  function getString(key: keyof RecordData) {
    const value = formData.get(key)
    return typeof value === 'string' && value.length > 0 ? value : undefined
  }

  function getNumber(key: 'year' | 'original_year' | 'discs') {
    const value = formData.get(key)
    if (typeof value !== 'string' || value.length === 0) return undefined
    const parsed = Number(value)
    return Number.isNaN(parsed) ? undefined : parsed
  }

  const data = {
    title: getString('title'),
    artist_names: (getString('artist_names') || '')
      .split(',')
      .map((name) => name.trim())
      .filter(Boolean),
    cover_url: getString('cover_url'),
    record_id: getString('record_id'),
    year: getNumber('year'),
    original_year: getNumber('original_year'),
    discs: getNumber('discs'),
    label: getString('label'),
    notes: getString('notes'),
  }

  console.log('Submitting record data:', data)

  $fetch('/api/addRecord', {
    method: 'POST',
    body: JSON.stringify(data),
  })
    .then(() => {
      submitted.value = true
      errorMessage.value = ''
    })
    .catch((error) => {
      console.error('Error adding record:', error)

      const statusCode =
        typeof error === 'object' &&
        error !== null &&
        'statusCode' in error &&
        typeof (error as { statusCode?: unknown }).statusCode === 'number'
          ? (error as { statusCode: number }).statusCode
          : null

      if (statusCode === 401) {
        navigateTo(`/login?redirect=${encodeURIComponent(route.fullPath)}`)
        return
      }

      errorMessage.value = 'Failed to add record. Please try again.'
    })

  // console.log('Response from server:', res)
}
</script>

<template>
  <main class="page record-new">
    <div class="content">
      <h1>Add record</h1>

      <form class="record-form" @submit.prevent="addRecord">
        <div class="form-detail">
          <input
            type="text"
            name="title"
            placeholder="Album Title"
            class="input record-title"
            required
          />
          <label for="title" class="label">Album Title</label>
        </div>

        <div class="form-detail">
          <input
            type="text"
            name="artist_names"
            placeholder="Artist 1, Artist 2"
            class="input record-artist"
          />
          <label for="artist_names" class="label"
            >Artists (comma-separated)</label
          >
        </div>

        <div class="form-detail">
          <input
            type="url"
            name="cover_url"
            placeholder="https://..."
            class="input record-cover-url"
          />
          <label for="cover_url" class="label">Cover URL</label>
        </div>

        <div class="form-detail">
          <input
            type="text"
            name="record_id"
            placeholder="Record ID"
            class="input record-id"
          />
          <label for="record_id" class="label">Record ID</label>
        </div>

        <div class="form-detail">
          <input
            type="number"
            name="year"
            placeholder="1980"
            min="1948"
            class="input record-year"
          />
          <label for="year" class="label">Year</label>
        </div>

        <div class="form-detail">
          <input
            type="number"
            name="original_year"
            placeholder="1979"
            min="1948"
            class="input record-og-year"
          />
          <label for="original_year" class="label">Original Year</label>
        </div>

        <div class="form-detail">
          <input
            type="number"
            name="discs"
            min="1"
            value="1"
            placeholder="1"
            class="input record-discs"
          />
          <label for="discs" class="label">Discs</label>
        </div>

        <div class="form-detail">
          <input
            type="text"
            name="label"
            placeholder="Label"
            class="input record-label"
          />
          <label for="label" class="label">Label</label>
        </div>

        <div class="form-detail">
          <input
            type="text"
            name="notes"
            placeholder="Notes"
            class="input record-notes"
          />
          <label for="notes" class="label">Notes</label>
        </div>

        <div>
          <button
            type="submit"
            :class="['button add-record', { checked: submitted }]"
            :disabled="submitted"
          >
            {{ submitted ? '✔' : '+' }} Add Record
          </button>
          <div>
            {{ errorMessage }}
          </div>
        </div>
      </form>
    </div>
  </main>
</template>

<style lang="stylus">
@import '../../stylus/_variables.styl'

.record-new {
  pad(3, 1, 2)
}
</style>
