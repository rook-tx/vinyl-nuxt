export type ImageField = {
  url: string
  alt?: string | null
}

export type RecordLink = {
  id: string
  uid: string
  data: {
    title: string
    cover: ImageField | null
  }
}

export type ArtistLink = {
  id: string
  uid: string
  data: {
    name: string
  }
}

export type RecordItem = {
  id: string
  uid: string
  data: {
    title: string
    cover: ImageField | null
    artists: ArtistLink[]
    record_id: string | null
    played: Array<{ date: string | null }>
    discs: number | null
    label: string | null
    year: number | null
    original_year: number | null
    notes: string | null
    meta_title: string | null
    meta_description: string | null
    meta_image: ImageField | null
  }
}

export type ArtistItem = {
  id: string
  uid: string
  data: {
    name: string
    records: Array<{ record: RecordLink }>
    meta_title: string | null
    meta_description: string | null
    meta_image: ImageField | null
  }
}
