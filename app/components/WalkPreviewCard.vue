<template>
  <article class="walk-card">
    <div class="walk-card__visual">
      <div class="walk-card__carousel">
        <img
          :src="currentImage"
          alt=""
          class="walk-card__img"
          width="280"
          height="200"
          loading="lazy"
          decoding="async"
        >
        <div
          v-if="imageList.length > 1"
          class="walk-card__dots"
          role="tablist"
          aria-label="Фотографии маршрута"
        >
          <button
            v-for="(_, index) in imageList"
            :key="index"
            type="button"
            role="tab"
            class="walk-card__dot"
            :class="{ 'walk-card__dot--active': index === activeSlide }"
            :aria-selected="index === activeSlide"
            :aria-label="`Фото ${index + 1} из ${imageList.length}`"
            @click="activeSlide = index"
          />
        </div>
      </div>
    </div>
    <div class="walk-card__main">
      <h3 class="walk-card__title">
        {{ demo.title }}
      </h3>
      <p class="walk-card__type">
        {{ demo.typeLabel }}
      </p>
      <div class="walk-card__stats">
        <span class="walk-card__stat">
          <svg
            class="walk-card__stat-icon"
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
            aria-hidden="true"
          >
            <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
          </svg>
          {{ demo.rating }}
        </span>
        <span class="walk-card__stat">
          <svg
            class="walk-card__stat-icon"
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
            aria-hidden="true"
          >
            <circle
              cx="12"
              cy="4"
              r="2"
            />
            <path d="M10 22V12M14 22V12" />
            <path d="M8 12h8l-1 6H9l-1-6z" />
          </svg>
          {{ demo.distance }}
        </span>
        <span class="walk-card__stat">
          <svg
            class="walk-card__stat-icon"
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
            aria-hidden="true"
          >
            <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
            <circle
              cx="12"
              cy="10"
              r="3"
            />
          </svg>
          {{ demo.place }}
        </span>
      </div>
      <p class="walk-card__desc">
        {{ demo.description }}
      </p>
      <div class="walk-card__actions">
        <button
          type="button"
          class="walk-card__more"
        >
          Подробнее
        </button>
        <button
          type="button"
          class="walk-card__heart"
          :aria-label="variant === 'favorite' ? 'В избранном' : 'В избранное'"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="currentColor"
            stroke="currentColor"
            stroke-width="1.5"
            aria-hidden="true"
          >
            <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
          </svg>
        </button>
      </div>
    </div>
  </article>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue'

const props = defineProps<{
  variant: 'walk' | 'favorite'
  demo: {
    title: string
    typeLabel: string
    rating: string
    distance: string
    place: string
    description: string
    image: string
    images?: readonly string[]
  }
}>()

const activeSlide = ref(0)

const imageList = computed(() => {
  const extra = props.demo.images
  if (extra?.length) {
    return [...extra]
  }
  return [props.demo.image]
})

const currentImage = computed(
  () => imageList.value[activeSlide.value] ?? imageList.value[0]!,
)

watch(imageList, (list) => {
  if (activeSlide.value >= list.length) {
    activeSlide.value = 0
  }
})
</script>

<style scoped>
.walk-card {
  display: flex;
  flex-wrap: wrap;
  gap: 1.15rem 1.25rem;
  padding: 1.1rem 1.15rem;
  border-radius: 18px;
  background: #fff;
  border: 1px solid #e8ecf2;
  box-shadow: 0 6px 24px rgba(15, 30, 60, 0.06);
}

.walk-card__visual {
  flex-shrink: 0;
  width: 100%;
  max-width: 260px;
}

.walk-card__carousel {
  position: relative;
  border-radius: 14px;
  overflow: hidden;
}

.walk-card__img {
  display: block;
  width: 100%;
  height: auto;
  aspect-ratio: 280 / 200;
  object-fit: cover;
  vertical-align: middle;
}

.walk-card__dots {
  position: absolute;
  left: 0;
  right: 0;
  bottom: 0.65rem;
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: center;
  gap: 0.4rem;
  padding: 0 0.5rem;
}

.walk-card__dot {
  width: 8px;
  height: 8px;
  padding: 0;
  border: none;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.55);
  box-shadow: 0 0 0 1px rgba(0, 0, 0, 0.12);
  cursor: pointer;
  transition:
    transform 0.15s ease,
    background-color 0.15s ease,
    box-shadow 0.15s ease;
}

.walk-card__dot:hover {
  transform: scale(1.15);
  background: rgba(255, 255, 255, 0.85);
}

.walk-card__dot--active {
  background: #fff;
  box-shadow: 0 0 0 2px rgba(43, 101, 255, 0.9);
  transform: scale(1.2);
}

.walk-card__dot:focus-visible {
  outline: none;
  box-shadow: 0 0 0 2px #fff, 0 0 0 4px #2b65ff;
}

.walk-card__main {
  flex: 1;
  min-width: min(100%, 220px);
}

.walk-card__title {
  margin: 0 0 0.25rem;
  font-size: 1.2rem;
  font-weight: 700;
  color: #1a1a1a;
}

.walk-card__type {
  margin: 0 0 0.65rem;
  font-size: 0.9rem;
  color: #8e8e8e;
}

.walk-card__stats {
  display: flex;
  flex-wrap: wrap;
  gap: 0.65rem 1.1rem;
  margin-bottom: 0.65rem;
  font-size: 0.875rem;
  color: #5a6578;
}

.walk-card__stat {
  display: inline-flex;
  align-items: center;
  gap: 0.3rem;
}

.walk-card__stat-icon {
  width: 16px;
  height: 16px;
  flex-shrink: 0;
  color: #2b65ff;
}

.walk-card__desc {
  margin: 0 0 1rem;
  font-size: 0.9rem;
  line-height: 1.5;
  color: #8e8e8e;
  max-width: 52ch;
}

.walk-card__actions {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 0.65rem;
}

.walk-card__more {
  flex: 1;
  min-width: 160px;
  min-height: 46px;
  padding: 0 1.25rem;
  border: none;
  border-radius: 14px;
  background: #2b65ff;
  color: #fff;
  font: inherit;
  font-size: 15px;
  font-weight: 600;
  cursor: pointer;
  transition: background-color 0.15s ease;
}

.walk-card__more:hover {
  background: #1f52e6;
}

.walk-card__heart {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 48px;
  height: 48px;
  padding: 0;
  border: none;
  border-radius: 14px;
  background: #e8f0ff;
  color: #2b65ff;
  cursor: pointer;
  transition: background-color 0.15s ease;
}

.walk-card__heart:hover {
  background: #d8e4ff;
}

@media (max-width: 640px) {
  .walk-card__visual {
    max-width: none;
  }
}
</style>
