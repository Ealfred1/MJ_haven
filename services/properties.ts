import api from "./api"

export interface PropertyImage {
  id: number
  image_url: string
  is_main: boolean
}

export interface Property {
  id: number
  title: string
  property_type: string
  price: string
  duration: string
  duration_display: string
  location: string
  bedrooms: number
  bathrooms: number
  area: string
  is_available: boolean
  main_image?: PropertyImage
  main_image_url?: string
  created_at: string
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
  getProperty: async (id: number): Promise<Property> => {
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

