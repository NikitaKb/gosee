<template>
  <section class="planing-main">
    <div class="planing-main__card">
      <h2 class="planing-main__title">
        Планируйте свою прогулку онлайн
      </h2>

      <div class="planing-main__fields">
        <div class="planing-main__field">
          <img
            :src="geoIcon"
            alt=""
            class="planing-main__field-icon"
            width="20"
            height="28"
          >
          <TextField
            v-model="destination"
            placeholder="Куда хотите поехать..."
            embedded
            class="planing-main__field-input"
          />
        </div>
        <div class="planing-main__field">
          <img
            :src="roadIcon"
            alt=""
            class="planing-main__field-icon"
            width="22"
            height="22"
          >
          <TextField
            v-model="travelType"
            placeholder="Тип путешествия"
            embedded
            class="planing-main__field-input"
          />
        </div>
      </div>

      <ButtonBlue
        type="button"
        class="planing-main__submit"
        @click="onSearch"
      >
        <span class="planing-main__submit-inner">
          <img
            :src="searchIcon"
            alt=""
            class="planing-main__submit-icon"
            width="20"
            height="20"
          >
          Найти подходящий маршрут
        </span>
      </ButtonBlue>

      <ul class="planing-main__stats">
        <li
          v-for="row in stats"
          :key="row.id"
          class="planing-main__stat"
        >
          <span class="planing-main__stat-value">{{ row.value }}</span>
          <span class="planing-main__stat-label">{{ row.label }}</span>
        </li>
      </ul>
    </div>
  </section>
</template>

<script setup lang="ts">
import geoIcon from '~/assets/images/icons/geo.svg'
import roadIcon from '~/assets/images/icons/road.svg'
import searchIcon from '~/assets/images/icons/search.svg'

const destination = ref('')
const travelType = ref('')

const stats = [
  { id: 'd', value: '500+', label: 'Направлений' },
  { id: 'u', value: '10000+', label: 'Пользователей' },
  { id: 'c', value: '50+', label: 'Городов России' },
  { id: 'r', value: '4.9', label: 'Рейтинг' },
] as const

const emit = defineEmits<{
  search: [payload: { destination: string, travelType: string }]
}>()

function onSearch() {
  emit('search', {
    destination: destination.value,
    travelType: travelType.value,
  })
}
</script>

<style scoped>
.planing-main {
  width: 100%;
  box-sizing: border-box;
  padding: 2.5rem 1rem 3rem;
  background: linear-gradient(180deg, #e8f1ff 0%, #dceaff 100%);
}

.planing-main__card {
  box-sizing: border-box;
  max-width: 920px;
  margin: 0 auto;
  padding: 2rem 2rem 1.75rem;
  background: #fff;
  border-radius: 16px;
  box-shadow: 0 8px 32px rgba(26, 95, 255, 0.08), 0 2px 12px rgba(0, 0, 0, 0.04);
}

.planing-main__title {
  margin: 0 0 1.75rem;
  text-align: center;
  font-size: clamp(1.25rem, 2.5vw, 1.5rem);
  font-weight: 600;
  line-height: 1.35;
  color: #1a66ff;
}

.planing-main__fields {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;
  margin-bottom: 1rem;
}

@media (max-width: 640px) {
  .planing-main__fields {
    grid-template-columns: 1fr;
  }
}

.planing-main__field {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  min-height: 52px;
  padding: 0 1rem;
  background: #fff;
  border: 1px solid #d8d8d8;
  border-radius: 14px;
  transition: border-color 0.15s ease, box-shadow 0.15s ease;
}

.planing-main__field:focus-within {
  border-color: #1a66ff;
  box-shadow: 0 0 0 2px rgba(26, 102, 255, 0.2);
}

.planing-main__field-icon {
  flex-shrink: 0;
  object-fit: contain;
  filter: brightness(0) saturate(100%) invert(32%) sepia(95%) saturate(2876%)
    hue-rotate(212deg) brightness(98%) contrast(104%);
}

.planing-main__field-input {
  flex: 1;
  min-width: 0;
}

.planing-main__submit {
  width: 100%;
  margin-bottom: 2rem;
}

.planing-main__submit :deep(.btn-blue) {
  width: 100%;
  min-height: 52px;
  border-radius: 14px;
  font-size: 16px;
  font-weight: 600;
}

.planing-main__submit-inner {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 0.6rem;
}

.planing-main__submit-icon {
  flex-shrink: 0;
  filter: brightness(0) invert(1);
}

.planing-main__stats {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 1rem 0.5rem;
  margin: 0;
  padding: 1.25rem 0 0;
  list-style: none;
  border-top: 1px solid #eee;
}

@media (max-width: 640px) {
  .planing-main__stats {
    grid-template-columns: repeat(2, 1fr);
  }
}

.planing-main__stat {
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  gap: 0.35rem;
}

.planing-main__stat-value {
  font-size: clamp(1.25rem, 2.5vw, 1.5rem);
  font-weight: 700;
  color: #1a66ff;
  line-height: 1.2;
}

.planing-main__stat-label {
  font-size: 14px;
  font-weight: 500;
  color: #000;
  line-height: 1.3;
}
</style>
