<script setup lang="ts">
import { asImageSrc } from "@prismicio/client";

const route = useRoute();
const { client } = usePrismic();
const { data: page } = await useAsyncData(
  `[record-uid-${route.params.uid}]`,
  () => client.getByUID("record", route.params.uid as string),
);

useSeoMeta({
  title: page.value?.data.meta_title,
  ogTitle: page.value?.data.meta_title,
  description: page.value?.data.meta_description,
  ogDescription: page.value?.data.meta_description,
  ogImage: computed(() => asImageSrc(page.value?.data.meta_image)),
});
</script>

<template>
  <main>
    <h1>{{ page?.data.title }}</h1>
    <h2>{{ page?.data.year }}</h2>
  </main>
</template>
