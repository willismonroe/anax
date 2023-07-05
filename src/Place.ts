interface placeFeature {
    id: string | null
    geometry: {
      type: string,
      coordinates: number[]
    },
  
    properties: {
      description: string | null,
      link: string | null,
      location_precision: string | null,
      title: string | null,
    },
  
    title: string,
    type: string
}
  
interface placeData {
    bbox: number[],
    description: string,
    features: placeFeature[],
    id: string,
    names: string[],
    title: string,
    type: string,
}
  
interface place {
    id: string
    title: string
    data: placeData
    changedName: boolean | null
    known: boolean | null
}

export type { place, placeData, placeFeature }