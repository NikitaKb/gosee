export type YandexMapsLatLng = { lat: number; lng: number }

/** Режим Yandex Directions. */
export type YandexDirectionsTravelMode = 'pedestrian' | 'bicycle' | 'car' | 'masstransit'

type YandexMapsNamespace = {
    Map: new (el: HTMLElement | string, opts: Record<string, unknown>) => YandexMap
    Placemark: new (coords: [number, number], opts?: Record<string, unknown>) => YandexMarker
    Polyline: new (points: [number, number][], opts?: Record<string, unknown>) => YandexPolyline
    geocode: (query: string) => Promise<YandexGeocodeResult>
    Panorama?: {
        Player: new (el: HTMLElement | string, coords: [number, number], opts?: Record<string, unknown>) => YandexPanorama
    }
    panorama?: {
        isSupported: () => boolean
    }
}

type YandexPanorama = {
    destroy: () => void
    moveTo: (coords: [number, number]) => Promise<void>
}

/** Пара координат для API Яндекса 2.1: [широта, долгота] */
type YandexLatLng = [number, number]
type YandexMap = {
    setCenter: (coords: YandexLatLng, zoom?: number, opts?: Record<string, unknown>) => void
    getCenter: () => YandexLatLng
    setZoom: (z: number) => void
    getZoom: () => number
    getBounds: () => [[number, number], [number, number]]
    geoObjects: { add: (obj: unknown) => void; remove: (obj: unknown) => void; removeAll: () => void }
    events: { add: (ev: string, fn: (e: { get: (key: string) => unknown } | null) => void) => unknown }
}
type YandexMarker = { geometry: { setCoordinates: (c: YandexLatLng) => void; getCoordinates: () => YandexLatLng } }
type YandexPolyline = { geometry: { setCoordinates: (c: YandexLatLng[]) => void; getCoordinates: () => YandexLatLng[] } }
type YandexGeocodeResult = {
    GeoObjectCollection: {
        featureMember: Array<{
            GeoObject: {
                Point: { pos: string }
            }
        }>
    }
}

function getYandex(): YandexMapsNamespace | null {
    if (typeof window === 'undefined') {
        return null
    }
    const ymaps = (window as unknown as { ymaps?: YandexMapsNamespace }).ymaps
    return ymaps ?? null
}

/** JSAPI 2.1: vow.Promise — сначала .done (корректные success/error), затем .then. */
function awaitYmapsPromise<T>(p: unknown): Promise<T | null> {
    if (p == null) {
        return Promise.resolve(null)
    }
    const v = p as {
        done?: (onOk: (x: T) => void, onFail?: (e: unknown) => void) => void
        then?: (onOk: (x: T) => void, onFail?: (e: unknown) => void) => unknown
    }
    return new Promise((resolve) => {
        if (typeof v.done === 'function') {
            v.done(
                (x: T) => resolve(x == null ? null : x),
                () => resolve(null),
            )
            return
        }
        if (typeof v.then === 'function') {
            v.then!(
                (x: T) => resolve(x == null ? null : x),
                () => resolve(null),
            )
            return
        }
        resolve(p as T)
    })
}

let scriptPromise: Promise<void> | null = null

function loadMapsScript(apiKey: string): Promise<void> {
    if (typeof document === 'undefined') {
        return Promise.resolve()
    }
    const ymaps = getYandex()
    if (ymaps?.Map) {
        return Promise.resolve()
    }
    if (scriptPromise) {
        return scriptPromise
    }
    scriptPromise = new Promise((resolve, reject) => {
        const existing = document.querySelector<HTMLScriptElement>('script[data-ymaps-loader]')
        if (existing) {
            // Скрипт уже загружается, ждём ready
            const checkReady = () => {
                const y = getYandex() as any
                if (y?.ready) {
                    y.ready(() => {
                        resolve()
                    })
                } else {
                    setTimeout(checkReady, 50)
                }
            }
            checkReady()
            return
        }
        const s = document.createElement('script')
        s.dataset.ymapsLoader = '1'
        s.async = true
        // package.full — панорамы и прочие модули (без этого createPlayer часто «пустой»).
        s.src = `https://api-maps.yandex.ru/2.1/?apikey=${encodeURIComponent(apiKey)}&lang=ru_RU&load=package.full`

        s.onload = () => {
            const ymaps = getYandex() as any
            if (!ymaps) {
                reject(new Error('Yandex Maps API not loaded'))
                return
            }
            // Используем ymaps.ready() для гарантии инициализации
            ymaps.ready(() => {
                resolve()
            })
        }
        s.onerror = () => reject(new Error('Failed to load Yandex Maps script'))
        document.head.appendChild(s)
    })
    return scriptPromise
}

/** Дожидаемся ready и при необходимости догружаем пакет (без кэша «пустого» resolve). */
function loadPanoramaModule(): Promise<void> {
    const ymaps = getYandex() as any
    if (!ymaps) {
        return Promise.resolve()
    }
    return new Promise((resolve) => {
        const done = () => resolve()
        ymaps.ready(() => {
            if (typeof ymaps.modules?.require !== 'function') {
                done()
                return
            }
            try {
                ymaps.modules.require(
                    ['package.full'],
                    () => done(),
                    () => done(),
                )
            } catch {
                done()
            }
        })
    })
}

/** Равномерная выборка точек маршрута для превью. */
export function yandexSamplePath(points: YandexMapsLatLng[], maxPoints: number): YandexMapsLatLng[] {
    if (points.length <= maxPoints) {
        return [...points]
    }
    const out: YandexMapsLatLng[] = []
    const last = points.length - 1
    for (let i = 0; i < maxPoints; i++) {
        const idx = Math.round((i / (maxPoints - 1)) * last)
        const p = points[idx]!
        out.push({ lat: p.lat, lng: p.lng })
    }
    return out
}

export function useYandexMaps() {
    const config = useRuntimeConfig()
    const apiKey = computed(() => (config.public.yandexMapsApiKey as string) || '')

    const isReady = ref(false)
    const loadError = ref<string | null>(null)

    async function load(): Promise<boolean> {
        if (import.meta.server) {
            return false
        }
        const key = apiKey.value.trim()
        if (!key) {
            loadError.value = 'Не задан ключ API (NUXT_PUBLIC_YANDEX_MAPS_API_KEY)'
            return false
        }
        loadError.value = null
        try {
            await loadMapsScript(key)
            // Загружаем панораму модуль асинхронно в фоне
            loadPanoramaModule().catch(() => {
                // ignore panorama load errors
            })
            isReady.value = !!getYandex()?.Map
            return isReady.value
        } catch (e) {
            loadError.value = e instanceof Error ? e.message : 'Ошибка загрузки карт'
            return false
        }
    }

    function createMap(el: HTMLElement, center: YandexMapsLatLng, zoom = 14): YandexMap | null {
        const ymaps = getYandex() as any
        if (!ymaps?.Map) {
            console.error('ymaps.Map not available')
            return null
        }
        try {
            // Присваиваем id если его нет
            if (!el.id) {
                el.id = `map-${Math.random().toString(36).substr(2, 9)}`
            }

            const mapInstance = new ymaps.Map(el.id, {
                center: [center.lat, center.lng],
                zoom,
                controls: ['zoomControl', 'fullscreenControl'],
            })
            return mapInstance as YandexMap
        } catch (error) {
            console.error('Failed to create map:', error)
            return null
        }
    }

    async function createPanorama(el: HTMLElement, position: YandexMapsLatLng): Promise<YandexPanorama | null> {
        const ymaps = getYandex() as any

        if (!el.id) {
            el.id = `panorama-${Math.random().toString(36).substr(2, 9)}`
        }

        const playerOpts = {
            controls: ['zoomControl', 'fullscreenControl'],
            direction: 'auto' as const,
            span: [120, 100],
        }

        try {
            const isSupported = ymaps?.panorama?.isSupported?.()

            if (!isSupported) {
                el.innerHTML = `
          <div style="
            display: flex;
            align-items: center;
            justify-content: center;
            width: 100%;
            height: 100%;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            font-family: system-ui, -apple-system, sans-serif;
            font-size: 14px;
            text-align: center;
            padding: 20px;
            box-sizing: border-box;
          ">
            <div>
              <p style="margin: 0 0 8px 0; font-size: 28px;">🌍</p>
              <p style="margin: 0 0 4px 0; font-weight: 500;">Панорама улиц</p>
              <p style="margin: 0; font-size: 12px; opacity: 0.9;">Недоступна в этой локации</p>
            </div>
          </div>
        `
                return null
            }

            const point = [position.lat, position.lng] as [number, number]

            // Документированный API: ищет панораму рядом с точкой и возвращает Promise на плеер.
            if (typeof ymaps.panorama?.createPlayer === 'function') {
                try {
                    const vowP = ymaps.panorama.createPlayer(el, point, playerOpts)
                    const player = await awaitYmapsPromise<YandexPanorama>(vowP)
                    if (player) {
                        const p = player as { fitToViewport?: () => void }
                        try {
                            p.fitToViewport?.()
                        } catch {
                            // ignore
                        }
                        return player
                    }
                } catch {
                    // пробуем locate + Player
                }
            }

            // locate + panorama.Player (второй аргумент — объект панорамы, не координаты)
            if (typeof ymaps.panorama?.locate === 'function' && typeof ymaps.panorama?.Player === 'function') {
                try {
                    const panoramas = await awaitYmapsPromise<unknown[]>(ymaps.panorama.locate(point))
                    if (panoramas?.length) {
                        const player = new ymaps.panorama.Player(el, panoramas[0], playerOpts) as YandexPanorama
                        try {
                            ;(player as { fitToViewport?: () => void }).fitToViewport?.()
                        } catch {
                            // ignore
                        }
                        return player
                    }
                } catch {
                    // ниже — заглушка
                }
            }

            el.innerHTML = `
        <div style="
          display: flex;
          align-items: center;
          justify-content: center;
          width: 100%;
          height: 100%;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
          font-family: system-ui, -apple-system, sans-serif;
          font-size: 14px;
          text-align: center;
          padding: 20px;
          box-sizing: border-box;
        ">
          <div>
            <p style="margin: 0 0 8px 0; font-size: 28px;">📍</p>
            <p style="margin: 0 0 4px 0; font-weight: 500;">Панорамы рядом нет</p>
            <p style="margin: 0; font-size: 12px; opacity: 0.9;">${position.lat.toFixed(4)}°, ${position.lng.toFixed(4)}°</p>
          </div>
        </div>
      `
            return null
        } catch (error) {
            console.error('Panorama creation error:', error)
            el.innerHTML = `
        <div style="
          display: flex;
          align-items: center;
          justify-content: center;
          width: 100%;
          height: 100%;
          background: linear-gradient(135deg, #ed64a6 0%, #f687b3 100%);
          color: white;
          font-family: system-ui, -apple-system, sans-serif;
          padding: 20px;
          box-sizing: border-box;
          text-align: center;
        ">
          <div>
            <p style="margin: 0 0 8px 0; font-size: 28px;">⚠️</p>
            <p style="margin: 0; font-size: 12px;">Ошибка загрузки панорамы</p>
          </div>
        </div>
      `
            return null
        }
    }

    function geocode(address: string): Promise<YandexMapsLatLng> {
        const key = apiKey.value.trim()
        if (!key) {
            return Promise.reject(new Error('API key not set'))
        }

        // Используем HTTP API Yandex Geocoder напрямую (более надёжно)
        const url = new URL('https://geocode-maps.yandex.ru/1.x/')
        url.searchParams.set('apikey', key)
        url.searchParams.set('geocode', address)
        url.searchParams.set('lang', 'ru_RU')
        url.searchParams.set('format', 'json')

        return fetch(url.toString())
            .then(res => {
                if (!res.ok) {
                    throw new Error(`HTTP ${res.status}`)
                }
                return res.json()
            })
            .then((data: any) => {
                const geoCollection = data?.response?.GeoObjectCollection
                if (!geoCollection) {
                    console.error('No GeoObjectCollection in response')
                    throw new Error(`Geocode: Invalid response structure`)
                }

                const members = geoCollection.featureMember
                if (!members || members.length === 0) {
                    console.warn(`No results found for "${address}"`)
                    throw new Error(`Geocode: город не найден (${address})`)
                }

                // Берём первый результат
                const geoObject = members[0]?.GeoObject
                if (!geoObject) {
                    console.error('No GeoObject in featureMember:', members[0])
                    throw new Error(`Geocode: объект не найден`)
                }

                // Приоритет: используем Point если есть, иначе вычисляем из Envelope
                let centerLng: number
                let centerLat: number

                // Вариант 1: Point (самый точный)
                if (geoObject.Point?.pos) {
                    const [lng, lat] = geoObject.Point.pos.split(' ').map(Number)
                    if (Number.isFinite(lng) && Number.isFinite(lat)) {
                        centerLng = lng
                        centerLat = lat
                    } else {
                        throw new Error('Не удалось парсить Point координаты')
                    }
                }
                // Вариант 2: Envelope (границы)
                else if (geoObject.boundedBy?.Envelope?.lowerCorner && geoObject.boundedBy?.Envelope?.upperCorner) {
                    const [lowerLng, lowerLat] = geoObject.boundedBy.Envelope.lowerCorner.split(' ').map(Number)
                    const [upperLng, upperLat] = geoObject.boundedBy.Envelope.upperCorner.split(' ').map(Number)

                    if (!Number.isFinite(lowerLng) || !Number.isFinite(lowerLat) ||
                        !Number.isFinite(upperLng) || !Number.isFinite(upperLat)) {
                        throw new Error('Не удалось парсить Envelope координаты')
                    }

                    centerLng = (lowerLng + upperLng) / 2
                    centerLat = (lowerLat + upperLat) / 2
                }
                else {
                    console.error('No Point or Envelope in GeoObject:', geoObject)
                    throw new Error(`Geocode: координаты не найдены`)
                }

                return { lat: centerLat, lng: centerLng }
            })
            .catch((error: any) => {
                console.error('Geocode error:', error)
                throw error instanceof Error ? error : new Error(String(error))
            })
    }

    /** Преобразование режима для API Яндекса */
    function getTravelModeForAPI(mode: YandexDirectionsTravelMode): string {
        const modeMap: Record<YandexDirectionsTravelMode, string> = {
            pedestrian: 'pedestrian',
            bicycle: 'pedestrian', // маршрут на велосипеде как пешеходный
            car: 'auto',
            masstransit: 'masstransit',
        }
        return modeMap[mode]
    }

    function computeDirectionsPath(
        waypoints: YandexMapsLatLng[],
        travelMode: YandexDirectionsTravelMode,
    ): Promise<{ path: YandexMapsLatLng[]; distanceKm: number; durationMinutes: number }> {
        if (waypoints.length === 0) {
            return Promise.resolve({ path: [], distanceKm: 0, durationMinutes: 0 })
        }
        if (waypoints.length === 1) {
            return Promise.resolve({ path: [{ ...waypoints[0]! }], distanceKm: 0, durationMinutes: 0 })
        }

        return new Promise((resolve) => {

            // Для демонстрации - используем простое соединение точек
            // В продакшене используйте реальный API маршрутизации
            const path: YandexMapsLatLng[] = []
            for (let i = 0; i < waypoints.length; i++) {
                path.push(waypoints[i]!)
            }

            // Рассчитываем расстояние как сумму расстояний между точками
            let totalDistance = 0
            for (let i = 1; i < waypoints.length; i++) {
                const prev = waypoints[i - 1]!
                const curr = waypoints[i]!
                const dLat = (curr.lat - prev.lat) * Math.PI / 180
                const dLng = (curr.lng - prev.lng) * Math.PI / 180
                const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
                    Math.cos(prev.lat * Math.PI / 180) * Math.cos(curr.lat * Math.PI / 180) *
                    Math.sin(dLng / 2) * Math.sin(dLng / 2)
                const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
                totalDistance += 6371 * c // Радиус Земли в км
            }
            const distanceKm = Math.round(totalDistance * 100) / 100

            // Примерная длительность: 5 км/ч для пешехода, 15 км/ч для велосипеда, 50 км/ч для авто
            let speedKmh = 5
            if (travelMode === 'bicycle') speedKmh = 15
            else if (travelMode === 'car') speedKmh = 50
            else if (travelMode === 'masstransit') speedKmh = 30
            const durationMinutes = Math.round((totalDistance / speedKmh) * 60)

            // Это базовый маршрут через все точки (без оптимизации дороги)
            // Для полноценной маршрутизации используйте Yandex Router API
            resolve({ path: yandexSamplePath(path, 48), distanceKm, durationMinutes })
        })
    }

    function computeWalkingPath(waypoints: YandexMapsLatLng[]): Promise<YandexMapsLatLng[]> {
        return computeDirectionsPath(waypoints, 'pedestrian')
    }

    function computeHeading(from: YandexMapsLatLng, to: YandexMapsLatLng): number {
        const dLng = to.lng - from.lng
        const dLat = to.lat - from.lat
        const heading = Math.atan2(dLng, dLat) * (180 / Math.PI)
        return (heading + 360) % 360
    }

    return {
        apiKey,
        isReady,
        loadError,
        load,
        loadPanoramaModule,
        createMap,
        createPanorama,
        geocode,
        computeWalkingPath,
        computeDirectionsPath,
        computeHeading,
        getYandex,
    }
}
