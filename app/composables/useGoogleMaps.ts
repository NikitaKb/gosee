export type MapsLatLng = { lat: number; lng: number }

/** Режим Google Directions (ролики в UI → BICYCLING как ближайший аналог). */
export type DirectionsTravelMode = 'WALKING' | 'BICYCLING' | 'DRIVING' | 'TRANSIT'

type GoogleMapsNamespace = {
  maps: {
    Map: new (el: HTMLElement, opts: Record<string, unknown>) => GoogleMap
    Marker: new (opts: Record<string, unknown>) => GoogleMarker
    Polyline: new (opts: Record<string, unknown>) => GooglePolyline
    Geocoder: new () => GoogleGeocoder
    DirectionsService: new () => GoogleDirectionsService
    LatLng: new (lat: number, lng: number) => GoogleLatLng
    StreetViewPanorama: new (el: HTMLElement, opts: Record<string, unknown>) => GooglePanorama
    TravelMode: {
      WALKING: unknown
      BICYCLING: unknown
      DRIVING: unknown
      TRANSIT: unknown
    }
    geometry: {
      spherical: {
        computeHeading: (from: GoogleLatLng, to: GoogleLatLng) => number
      }
    }
  }
}

type GoogleLatLng = { lat(): number; lng(): number }
type GoogleMap = {
  setCenter: (p: MapsLatLng | GoogleLatLng) => void
  setZoom: (z: number) => void
  fitBounds: (b: unknown) => void
  addListener: (ev: string, fn: (e: { latLng?: GoogleLatLng }) => void) => unknown
}
type GoogleMarker = { setMap: (m: GoogleMap | null) => void; setPosition: (p: MapsLatLng) => void }
type GooglePolyline = { setMap: (m: GoogleMap | null) => void; setPath: (p: MapsLatLng[]) => void }
type GoogleGeocoder = {
  geocode: (
    req: { address: string },
    cb: (r: Array<{ geometry: { location: GoogleLatLng } }> | null, s: string) => void,
  ) => void
}
type GoogleDirectionsService = {
  route: (
    req: Record<string, unknown>,
    cb: (r: GoogleDirectionsResult | null, s: string) => void,
  ) => void
}
type GoogleDirectionsResult = {
  routes: Array<{ overview_path: GoogleLatLng[] }>
}
type GooglePanorama = {
  setPosition: (p: MapsLatLng) => void
  setPov: (pov: { heading: number; pitch: number }) => void
}

function getGoogle(): GoogleMapsNamespace | null {
  if (typeof window === 'undefined') {
    return null
  }
  return (window as unknown as { google?: GoogleMapsNamespace }).google ?? null
}

let scriptPromise: Promise<void> | null = null

function loadMapsScript(apiKey: string): Promise<void> {
  if (typeof document === 'undefined') {
    return Promise.resolve()
  }
  const g = getGoogle()
  if (g?.maps?.Map) {
    return Promise.resolve()
  }
  if (scriptPromise) {
    return scriptPromise
  }
  scriptPromise = new Promise((resolve, reject) => {
    const existing = document.querySelector<HTMLScriptElement>('script[data-gmaps-loader]')
    if (existing) {
      existing.addEventListener('load', () => resolve())
      existing.addEventListener('error', () => reject(new Error('Google Maps script error')))
      return
    }
    const s = document.createElement('script')
    s.dataset.gmapsLoader = '1'
    s.async = true
    s.defer = true
    s.src = `https://maps.googleapis.com/maps/api/js?key=${encodeURIComponent(apiKey)}&libraries=geometry`
    s.onload = () => resolve()
    s.onerror = () => reject(new Error('Failed to load Google Maps'))
    document.head.appendChild(s)
  })
  return scriptPromise
}

/** Равномерная выборка точек маршрута для превью (не слишком долго шагать). */
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

export function toLiteral(latLng: GoogleLatLng): MapsLatLng {
  return { lat: latLng.lat(), lng: latLng.lng() }
}

export function useGoogleMaps() {
  const config = useRuntimeConfig()
  const apiKey = computed(() => (config.public.googleMapsApiKey as string) || '')

  const isReady = ref(false)
  const loadError = ref<string | null>(null)

  async function load(): Promise<boolean> {
    if (import.meta.server) {
      return false
    }
    const key = apiKey.value.trim()
    if (!key) {
      loadError.value = 'Не задан ключ API (NUXT_PUBLIC_GOOGLE_MAPS_API_KEY)'
      return false
    }
    loadError.value = null
    try {
      await loadMapsScript(key)
      isReady.value = !!getGoogle()?.maps
      return isReady.value
    }
    catch (e) {
      loadError.value = e instanceof Error ? e.message : 'Ошибка загрузки карт'
      return false
    }
  }

  function createMap(el: HTMLElement, center: MapsLatLng, zoom = 14): GoogleMap | null {
    const g = getGoogle()
    if (!g?.maps) {
      return null
    }
    return new g.maps.Map(el, {
      center,
      zoom,
      mapTypeControl: true,
      streetViewControl: false,
      fullscreenControl: true,
    })
  }

  function createPanorama(el: HTMLElement, position: MapsLatLng): GooglePanorama | null {
    const g = getGoogle()
    if (!g?.maps) {
      return null
    }
    return new g.maps.StreetViewPanorama(el, {
      position,
      pov: { heading: 0, pitch: 0 },
      zoom: 1,
      addressControl: false,
      linksControl: true,
      panControl: true,
      enableCloseButton: false,
    })
  }

  function geocode(address: string): Promise<MapsLatLng> {
    const g = getGoogle()
    if (!g?.maps) {
      return Promise.reject(new Error('Maps not loaded'))
    }
    const geocoder = new g.maps.Geocoder()
    return new Promise((resolve, reject) => {
      geocoder.geocode({ address }, (results, status) => {
        if (status === 'OK' && results?.[0]) {
          resolve(toLiteral(results[0].geometry.location))
        }
        else {
          reject(new Error(`Geocode: ${status}`))
        }
      })
    })
  }

  function computeDirectionsPath(
    waypoints: MapsLatLng[],
    travelMode: DirectionsTravelMode,
  ): Promise<MapsLatLng[]> {
    const g = getGoogle()
    if (!g?.maps) {
      return Promise.reject(new Error('Maps not loaded'))
    }
    if (waypoints.length === 0) {
      return Promise.resolve([])
    }
    if (waypoints.length === 1) {
      return Promise.resolve([{ ...waypoints[0]! }])
    }
    const service = new g.maps.DirectionsService()
    const origin = waypoints[0]!
    const destination = waypoints[waypoints.length - 1]!
    const middle = waypoints.slice(1, -1).map((loc) => ({
      location: loc,
      stopover: true,
    }))
    const modeKey = g.maps.TravelMode[travelMode] as unknown
    return new Promise((resolve, reject) => {
      service.route(
        {
          origin,
          destination,
          waypoints: middle,
          travelMode: modeKey,
        },
        (result, status) => {
          if (status !== 'OK' || !result?.routes?.[0]?.overview_path) {
            reject(new Error(`Directions: ${status}`))
            return
          }
          const raw = result.routes[0].overview_path.map((p) => toLiteral(p))
          resolve(samplePath(raw, 48))
        },
      )
    })
  }

  function computeWalkingPath(waypoints: MapsLatLng[]): Promise<MapsLatLng[]> {
    return computeDirectionsPath(waypoints, 'WALKING')
  }

  function computeHeading(from: MapsLatLng, to: MapsLatLng): number {
    const g = getGoogle()
    if (!g?.maps?.geometry) {
      return 0
    }
    const a = new g.maps.LatLng(from.lat, from.lng)
    const b = new g.maps.LatLng(to.lat, to.lng)
    return g.maps.geometry.spherical.computeHeading(a, b)
  }

  return {
    apiKey,
    isReady,
    loadError,
    load,
    createMap,
    createPanorama,
    geocode,
    computeWalkingPath,
    computeDirectionsPath,
    computeHeading,
    getGoogle,
  }
}
