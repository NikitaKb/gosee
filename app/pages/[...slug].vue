<script setup lang="ts">
const route = useRoute()

/** Совпадает с путями в коллекции Content (`/`, `/about`, без лишнего `/` в конце). */
function contentPath(path: string) {
  if (!path || path === '/') {
    return '/index'
  }
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

useHead(() => ({
  title: page.value?.title ? `${page.value.title} — GoSee` : 'GoSee',
}))
</script>

<template>
  <main class="content-page">
    <div class="content-page__inner">
      <ContentRenderer
        v-if="page"
        :value="page"
      />
    </div>
  </main>
</template>

<style scoped>
.content-page {
  box-sizing: border-box;
  min-height: 60vh;
  padding: clamp(2.5rem, 7vw, 5rem) 1rem;
  background:
    radial-gradient(circle at 12% 12%, rgba(219, 238, 255, 0.8), transparent 28%),
    #f6f8fc;
}

.content-page__inner {
  box-sizing: border-box;
  width: min(100%, 780px);
  margin: 0 auto;
  padding: clamp(1.4rem, 4vw, 2.5rem);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-lg);
  background: var(--color-surface);
  box-shadow: var(--shadow-card);
}

.content-page__inner :deep(h1) {
  margin: 0 0 1rem;
  color: #172033;
  font-size: clamp(2rem, 6vw, 3rem);
  letter-spacing: -0.045em;
}

.content-page__inner :deep(h2) {
  margin: 2rem 0 0.75rem;
  color: #172033;
}

.content-page__inner :deep(p) {
  color: #526174;
  line-height: 1.75;
}

.content-page__inner :deep(a) {
  font-weight: 600;
  text-decoration-thickness: 1px;
  text-underline-offset: 3px;
}
</style>
