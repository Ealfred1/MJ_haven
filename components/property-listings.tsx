"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { PropertyCard } from "./property-card"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { propertiesService, type Property, type PropertyFilters } from "@/services/properties"
import { useToast } from "@/hooks/use-toast"

interface PropertyListingsProps {
  initialFilters?: PropertyFilters
  showTitle?: boolean
  showViewMore?: boolean
}

export function PropertyListings({
  initialFilters = {},
  showTitle = true,
  showViewMore = true,
}: PropertyListingsProps) {
  const [properties, setProperties] = useState<Property[]>([])
  const [favorites, setFavorites] = useState<number[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [filters, setFilters] = useState<PropertyFilters>(initialFilters)
  const { toast } = useToast()

  useEffect(() => {
    fetchProperties()
    fetchFavorites()
  }, [currentPage, filters])

  const fetchProperties = async () => {
    setIsLoading(true)
    setError(null)

    try {
      const response = await propertiesService.getProperties({
        ...filters,
        page: currentPage,
        page_size: 6,
      })

      setProperties(response.results)
      setTotalPages(Math.ceil(response.count / 6))
    } catch (err) {
      console.error("Failed to fetch properties:", err)
      setError("Failed to load properties")
      toast({
        title: "Error",
        description: "Failed to load properties. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const fetchFavorites = async () => {
    try {
      const favoritesData = await propertiesService.getFavorites()
      const favoriteIds = favoritesData.map((fav) => fav.property.id)
      setFavorites(favoriteIds)
    } catch (err) {
      console.error("Failed to fetch favorites:", err)
    }
  }

  // Change page
  const paginate = (pageNumber: number) => {
    setCurrentPage(pageNumber)
    window.scrollTo({ top: 0, behavior: "smooth" })
  }

  // Handle favorite toggle
  const handleFavoriteToggle = (propertyId: number, isFavorite: boolean) => {
    if (isFavorite) {
      setFavorites((prev) => [...prev, propertyId])
    } else {
      setFavorites((prev) => prev.filter((id) => id !== propertyId))
    }
  }

  // Map API properties to PropertyCard props
  const mapPropertyToCardProps = (property: Property) => ({
    id: property.id,
    title: property.title,
    price: Number.parseFloat(property.price),
    address: property.location.split(",")[0] || property.location,
    area: property.location.split(",")[1] || "",
    city: property.location.split(",")[2] || "",
    beds: property.bedrooms,
    baths: property.bathrooms,
    size: `${property.area} m²`,
    imageUrl: property.main_image_url || "/placeholder.svg?height=300&width=400",
    isFavorite: favorites.includes(property.id),
  })

  return (
    <section className="py-16">
      <div className="container mx-auto px-4">
        {showTitle && (
          <div className="flex justify-between items-center mb-8">
            <div>
              <h2 className="text-[40px] tracking-tight text-[#000929] font-bold mb-2">Based on your location</h2>
              <p className="text-[#000929] font-medium text-[18px]">Some of our picked properties near you location.</p>
            </div>

            {showViewMore && (
              <Link
                href="/properties"
                className="bg-primary w-[239px] h-[56px] items-center justify-center hover:bg-primary-600 text-white px-4 py-2 rounded-[8px] text-sm font-medium transition-colors hidden md:flex"
              >
                Browse more Properties
              </Link>
            )}
          </div>
        )}

        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, index) => (
              <div key={index} className="bg-white rounded-lg overflow-hidden shadow-md h-80 animate-pulse">
                <div className="w-full h-48 bg-gray-200"></div>
                <div className="p-4">
                  <div className="h-4 bg-gray-200 rounded w-1/2 mb-2"></div>
                  <div className="h-4 bg-gray-200 rounded w-3/4 mb-4"></div>
                  <div className="h-4 bg-gray-200 rounded w-full"></div>
                </div>
              </div>
            ))}
          </div>
        ) : error ? (
          <div className="text-center py-12 bg-white rounded-lg shadow-md">
            <p className="text-red-500">{error}</p>
            <button onClick={fetchProperties} className="mt-4 text-primary hover:text-primary-600">
              Try again
            </button>
          </div>
        ) : properties.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-lg shadow-md">
            <p className="text-lg text-gray-500">No properties found.</p>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {properties.map((property) => (
                <PropertyCard
                  key={property.id}
                  {...mapPropertyToCardProps(property)}
                  onFavoriteToggle={handleFavoriteToggle}
                />
              ))}
            </div>

            {totalPages > 1 && (
              <div className="flex justify-center mt-8">
                <nav className="flex items-center space-x-1">
                  <button
                    onClick={() => paginate(Math.max(1, currentPage - 1))}
                    disabled={currentPage === 1}
                    className="p-2 rounded-md border border-gray-300 text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </button>

                  {Array.from({ length: totalPages }, (_, i) => i + 1).map((number) => (
                    <button
                      key={number}
                      onClick={() => paginate(number)}
                      className={`px-3 py-1 rounded-md ${
                        currentPage === number
                          ? "bg-primary text-white"
                          : "border border-gray-300 text-gray-500 hover:bg-gray-50"
                      }`}
                    >
                      {number}
                    </button>
                  ))}

                  <button
                    onClick={() => paginate(Math.min(totalPages, currentPage + 1))}
                    disabled={currentPage === totalPages}
                    className="p-2 rounded-md border border-gray-300 text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <ChevronRight className="h-4 w-4" />
                  </button>
                </nav>
              </div>
            )}
          </>
        )}

        {showViewMore && (
          <div className="mt-8 text-center md:hidden">
            <Link
              href="/properties"
              className="bg-primary hover:bg-primary-600 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors inline-block"
            >
              Browse more Properties
            </Link>
          </div>
        )}
      </div>
    </section>
  )
}

