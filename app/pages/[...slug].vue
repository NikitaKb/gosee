<script setup lang="ts">
const route = useRoute()

/** Совпадает с путями в коллекции Content (`/`, `/about`, без лишнего `/` в конце). */
function contentPath(path: string) {
  if (path.length > 1 && path.endsWith('/')) {
    return path.replace(/\/+$/, '') || '/'
  }
  return path || '/'
}

const { data: page } = await useAsyncData(
  'page-' + route.path,
  () => {
    return queryCollection('content').path(contentPath(route.path)).first()
  },
)

if (!page.value) {
  throw createError({ statusCode: 404, statusMessage: 'Page not found', fatal: true })
}
</script>

<template>
  <ContentRenderer
    v-if="page"
    :value="page"
  />
</template>
