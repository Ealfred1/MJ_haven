import api from "./api"

export interface PropertyImage {
  id: number
  image_url: string
  is_main: boolean
}

export interface PropertyFeature {
  id: number
  name: string
  description: string
}

export interface Property {
  id: number
  title: string
  description?: string
  property_type: string
  property_type_display?: string
  price: string
  duration: string
  duration_display: string
  location: string
  address?: string
  latitude?: number | null
  longitude?: number | null
  bedrooms: number
  bathrooms: number
  area: string | null
  is_available: boolean
  main_image_url?: string
  images?: PropertyImage[]
  features?: PropertyFeature[]
  is_favorited?: boolean
  created_at: string
  updated_at?: string
  owner?: number
}

export interface PropertyFilters {
  location?: string
  min_price?: number
  max_price?: number
  bedrooms?: number
  bathrooms?: number
  property_type?: string
  search?: string
  page?: number
  page_size?: number
}

export interface PaginatedResponse<T> {
  count: number
  next: string | null
  previous: string | null
  results: T[]
}

export const propertiesService = {
  // Get all properties with optional filters
  getProperties: async (filters?: PropertyFilters): Promise<PaginatedResponse<Property>> => {
    const params = new URLSearchParams()

    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== "") {
          params.append(key, value.toString())
        }
      })
    }

    const response = await api.get(`/api/properties/?${params.toString()}`)
    return response.data
  },

  // Get a single property by ID
  getProperty: async (id: number | string): Promise<Property> => {
    const response = await api.get(`/api/properties/${id}/`)
    return response.data
  },

  // Toggle favorite status for a property
  toggleFavorite: async (propertyId: number): Promise<{ action: "added" | "removed" }> => {
    const response = await api.post(`/api/users/favorites/toggle/${propertyId}/`)
    return response.data
  },

  // Get favorite properties
  getFavorites: async (): Promise<{ id: number; property: Property }[]> => {
    const response = await api.get("/api/users/favorites/")
    return response.data
  },
}

