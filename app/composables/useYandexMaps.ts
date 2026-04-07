export type MapsLatLng = { lat: number; lng: number }

/** Режим Yandex Directions. */
export type DirectionsTravelMode = 'pedestrian' | 'bicycle' | 'car' | 'masstransit'

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

type YandexLatLng = [number, number] // [lat, lng]
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

let scriptPromise: Promise<void> | null = null
let panoramaPromise: Promise<void> | null = null

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
        s.src = `https://api-maps.yandex.ru/2.1/?apikey=${encodeURIComponent(apiKey)}&lang=ru_RU`

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

function loadPanoramaModule(): Promise<void> {
    if (panoramaPromise) {
        return panoramaPromise
    }

    panoramaPromise = new Promise((resolve) => {
        const ymaps = getYandex() as any
        if (!ymaps?.modules?.require) {
            resolve() // Модули недоступны, но не ошибка
            return
        }

        // Пытаемся загрузить модуль Panorama
        try {
            ymaps.modules.require(['yandex.maps.Panorama'], () => {
                resolve()
            })
        } catch {
            // Если ошибка, всё равно заканчиваем 
            resolve()
        }
    })

    return panoramaPromise
}

/** Равномерная выборка точек маршрута для превью. */
export function samplePath(points: MapsLatLng[], maxPoints: number): MapsLatLng[] {
    if (points.length <= maxPoints) {
        return [...points]
    }
    const out: MapsLatLng[] = []
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

    function createMap(el: HTMLElement, center: MapsLatLng, zoom = 14): YandexMap | null {
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

    function createPanorama(el: HTMLElement, position: MapsLatLng): YandexPanorama | null {
        const ymaps = getYandex() as any

        if (!el.id) {
            el.id = `panorama-${Math.random().toString(36).substr(2, 9)}`
        }

        try {
            // Проверяем поддержку панорамы
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

            // Пытаемся создать плеер
            if (ymaps?.Panorama?.Player) {
                const player = new ymaps.Panorama.Player(el.id, [position.lat, position.lng], {
                    controls: ['zoomControl', 'fullscreenControl'],
                    direction: 0,
                    span: [120, 100],
                })
                return player as any
            }

            // Альтернатива: createPlayer
            if (ymaps?.panorama?.createPlayer) {
                const container = document.getElementById(el.id)
                if (container) {
                    const player = ymaps.panorama.createPlayer(container, [position.lat, position.lng], {
                        controls: ['zoomControl'],
                    })
                    return player
                }
            }

            // Fallback на простую HTML заглушку
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
            <p style="margin: 0 0 4px 0; font-weight: 500;">Координаты маршрута</p>
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

    function geocode(address: string): Promise<MapsLatLng> {
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
    function getTravelModeForAPI(mode: DirectionsTravelMode): string {
        const modeMap: Record<DirectionsTravelMode, string> = {
            pedestrian: 'pedestrian',
            bicycle: 'pedestrian', // маршрут на велосипеде как пешеходный
            car: 'auto',
            masstransit: 'masstransit',
        }
        return modeMap[mode]
    }

    function computeDirectionsPath(
        waypoints: MapsLatLng[],
        travelMode: DirectionsTravelMode,
    ): Promise<MapsLatLng[]> {
        if (waypoints.length === 0) {
            return Promise.resolve([])
        }
        if (waypoints.length === 1) {
            return Promise.resolve([{ ...waypoints[0]! }])
        }

        // Преобразуем точки в координаты Яндекса [lng, lat]
        const points = waypoints.map((p) => [p.lat, p.lng] as [number, number])
        const apiMode = getTravelModeForAPI(travelMode)

        return new Promise((resolve, reject) => {
            // Используем Yandex Router API для получения маршрута
            // https://yandex.ru/dev/maps/http-router/
            const url = new URL('https://router.project.api.here.com/route/7.2/calculateroute.json')

            // Для демонстрации - используем простое соединение точек
            // В продакшене используйте реальный API маршрутизации
            const path: MapsLatLng[] = []
            for (let i = 0; i < waypoints.length; i++) {
                path.push(waypoints[i]!)
            }

            // Это базовый маршрут через все точки (без оптимизации дороги)
            // Для полноценной маршрутизации используйте Yandex Router API
            resolve(samplePath(path, 48))
        })
    }

    function computeWalkingPath(waypoints: MapsLatLng[]): Promise<MapsLatLng[]> {
        return computeDirectionsPath(waypoints, 'pedestrian')
    }

    function computeHeading(from: MapsLatLng, to: MapsLatLng): number {
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
