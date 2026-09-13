import { createContext, useContext, useEffect, useState, useMemo } from 'react'

const GeoDataContext = createContext(null)

export function GeoDataProvider({ children }) {
  const [statesGeo, setStatesGeo] = useState(null)
  const [districtsGeo, setDistrictsGeo] = useState(null)
  const [error, setError] = useState(null)

  useEffect(() => {
    let alive = true
    async function load() {
      try {
        const [sf, df] = await Promise.all([
          fetch(`${import.meta.env.BASE_URL}data/india-states.geojson`).then((r) => r.json()),
          fetch(`${import.meta.env.BASE_URL}data/india-districts.geojson`).then((r) => r.json()),
        ])
        if (!alive) return
        setStatesGeo(sf)
        setDistrictsGeo(df)
      } catch (e) {
        if (alive) setError('GeoJSON failed to load: ' + e.message)
      }
    }
    load()
    return () => {
      alive = false
    }
  }, [])

  const value = useMemo(() => {
    const stateByName = {}
    const districtsByState = {}
    const districtList = []

    if (statesGeo) {
      for (const f of statesGeo.features) {
        stateByName[f.properties.NAME_1] = f
      }
    }
    if (districtsGeo) {
      for (const f of districtsGeo.features) {
        const st = f.properties.NAME_1
        const dn = f.properties.NAME_2
        ;(districtsByState[st] = districtsByState[st] || []).push(dn)
        districtList.push({ name: dn, state: st, feature: f })
      }
    }

    return {
      statesGeo,
      districtsGeo,
      stateByName,
      districtsByState,
      districtList,
      error,
      loading: !statesGeo || !districtsGeo,
    }
  }, [statesGeo, districtsGeo, error])

  return <GeoDataContext.Provider value={value}>{children}</GeoDataContext.Provider>
}

export function useGeoData() {
  return useContext(GeoDataContext)
}