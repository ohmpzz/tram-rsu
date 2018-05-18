//// https://tools.ietf.org/html/rfc7946

export interface TramStop {
    id?: string
    type?: string // Feature
    properties?: {
        title?: string,
        description?: string
    },
    geometry?: {
        type?: string, // Point, LineString 
        coordinates?: Array<any>
    },
    nearestStop?: {
        next: {
            id: string
            distance: string
            duration: string
        },
        prev: string
    }
}

export interface Tram {
    id?: string
    name?: string
    photo?: string
    geolocation?: TramGeoMetry
    speed?: number
    onDuty?: boolean
    next?: any
}

export interface TramGeoMetry {
    type?: string // Feature
    properties?: {
        title?: string,
        description?: string
    },
    geometry?: {
        type?: string, // Point, LineString 
        coordinates?: Array<any> // [lng, lat]
    }
}

export type Sort = "all" | "onDuty" | "notOnDuty"

