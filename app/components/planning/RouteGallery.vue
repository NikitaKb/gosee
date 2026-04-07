<template>
  <section
    class="route-gallery"
    aria-label="Сохранённые маршруты"
  >
    <h2 class="route-gallery__title">
      Сохранённые маршруты
    </h2>
    <p
      v-if="routes.length === 0"
      class="route-gallery__empty"
    >
      Пока нет сохранённых маршрутов. Задайте точки на карте и нажмите «Сохранить маршрут».
    </p>
    <ul
      v-else
      class="route-gallery__list"
    >
      <li
        v-for="r in routes"
        :key="r.id"
      >
        <button
          type="button"
          class="route-gallery__item"
          @click="$emit('select', r)"
        >
          <span class="route-gallery__name">{{ r.name }}</span>
          <span class="route-gallery__meta">{{ r.city }} · {{ r.coordinates.length }} точек</span>
          <span
            v-if="routeExtra(r)"
            class="route-gallery__sub"
          >{{ routeExtra(r) }}</span>
        </button>
      </li>
    </ul>
  </section>
</template>

<script setup lang="ts">
import type { MapsLatLng } from '~/composables/useYandexMaps'

type SavedRouteItem = {
  id: string
  name: string
  city: string
  coordinates: MapsLatLng[]
  savedAt: string
  theme?: string
  pace?: string
  travelModeId?: string
  timeStart?: string
  timeEnd?: string
}

defineProps<{
  routes: SavedRouteItem[]
}>()

defineEmits<{
  select: [route: SavedRouteItem]
}>()

function routeExtra(r: SavedRouteItem): string {
  const parts = [r.theme, r.pace].filter(Boolean) as string[]
  return parts.join(' · ')
}
</script>

<style scoped>
.route-gallery {
  padding: 1rem 1.1rem;
  border-radius: 14px;
  background: #fff;
  border: 1px solid #e8ecf3;
  box-shadow: 0 4px 18px rgba(15, 30, 60, 0.05);
}

.route-gallery__title {
  margin: 0 0 0.65rem;
  font-size: 1rem;
  font-weight: 700;
  color: #111;
}

.route-gallery__empty {
  margin: 0;
  font-size: 0.875rem;
  line-height: 1.45;
  color: #666;
}

.route-gallery__list {
  margin: 0;
  padding: 0;
  list-style: none;
  display: flex;
  flex-direction: column;
  gap: 0.45rem;
}

.route-gallery__item {
  width: 100%;
  text-align: left;
  padding: 0.65rem 0.75rem;
  border-radius: 10px;
  border: 1px solid #e4e9f2;
  background: #f9fafc;
  cursor: pointer;
  font: inherit;
  transition:
    background 0.15s ease,
    border-color 0.15s ease;
}

.route-gallery__item:hover {
  background: #eef3ff;
  border-color: #c5d4f5;
}

.route-gallery__name {
  display: block;
  font-size: 0.9rem;
  font-weight: 600;
  color: #1a1a1a;
}

.route-gallery__meta {
  display: block;
  margin-top: 0.2rem;
  font-size: 0.78rem;
  color: #777;
}

.route-gallery__sub {
  display: block;
  margin-top: 0.15rem;
  font-size: 0.72rem;
  color: #999;
}
</style>
