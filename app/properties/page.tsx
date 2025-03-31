"use client"

import { useState, useEffect } from "react"
import { Navigation } from "@/components/navigation"
import { Footer } from "@/components/footer"
import { PropertyCard } from "@/components/property-card"
import { Search, Filter, ChevronLeft, ChevronRight, Home } from "lucide-react"
import { useSearchParams } from "next/navigation"
import { propertiesService, type Property, type PropertyFilters } from "@/services/properties"
import { useToast } from "@/hooks/use-toast"
import { EmptyState } from "@/components/empty-state"

export default function PropertiesPage() {
  const searchParams = useSearchParams()
  const [searchTerm, setSearchTerm] = useState("")
  const [isFilterOpen, setIsFilterOpen] = useState(false)
  const [location, setLocation] = useState("Lagos, Nigeria")
  const [moveInDate, setMoveInDate] = useState("")
  const [priceRange, setPriceRange] = useState("₦200-₦500")
  const [propertyType, setPropertyType] = useState("House")
  const [currentPage, setCurrentPage] = useState(1)
  const [allProperties, setAllProperties] = useState<Property[]>([])
  const [displayedProperties, setDisplayedProperties] = useState<Property[]>([])
  const [favorites, setFavorites] = useState<number[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [totalPages, setTotalPages] = useState(1)
  const { toast } = useToast()

  const ITEMS_PER_PAGE = 6
  const MAX_PAGES = 10

  // Initialize filters from URL params if available
  useEffect(() => {
    const locationParam = searchParams.get("location")
    const typeParam = searchParams.get("type")
    const priceParam = searchParams.get("price")
    const searchParam = searchParams.get("search")

    if (locationParam) setLocation(locationParam)
    if (typeParam) setPropertyType(typeParam)
    if (priceParam) setPriceRange(priceParam)
    if (searchParam) setSearchTerm(searchParam)

    fetchProperties()
    fetchFavorites()
  }, [searchParams])

  // Update displayed properties when page changes or all properties change
  useEffect(() => {
    updateDisplayedProperties()
  }, [currentPage, allProperties])

  const updateDisplayedProperties = () => {
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE
    const endIndex = startIndex + ITEMS_PER_PAGE
    setDisplayedProperties(allProperties.slice(startIndex, endIndex))
  }

  const fetchProperties = async () => {
    setIsLoading(true)
    setError(null)

    try {
      // Parse price range
      let minPrice, maxPrice
      if (priceRange === "₦200-₦500") {
        minPrice = 200000
        maxPrice = 500000
      } else if (priceRange === "₦500-₦1000") {
        minPrice = 500000
        maxPrice = 1000000
      } else if (priceRange === "₦1000-₦2000") {
        minPrice = 1000000
        maxPrice = 2000000
      } else if (priceRange === "₦2000+") {
        minPrice = 2000000
      }

      // Create filters without pagination parameters
      const filters: PropertyFilters = {}

      if (searchTerm) filters.search = searchTerm
      if (location !== "Lagos, Nigeria") filters.location = location
      if (propertyType !== "House") filters.property_type = propertyType.toLowerCase()
      if (minPrice) filters.min_price = minPrice
      if (maxPrice) filters.max_price = maxPrice

      const response = await propertiesService.getProperties(filters)

      // Store all properties
      setAllProperties(response.results)

      // Calculate total pages based on the total count
      const calculatedTotalPages = Math.ceil(response.results.length / ITEMS_PER_PAGE)
      setTotalPages(Math.min(calculatedTotalPages, MAX_PAGES))

      // Reset to page 1 when filters change
      setCurrentPage(1)
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

  const handleSearch = () => {
    fetchProperties()
  }

  const handleFilterChange = () => {
    fetchProperties()
  }

  const clearFilters = () => {
    setSearchTerm("")
    setLocation("Lagos, Nigeria")
    setMoveInDate("")
    setPriceRange("₦200-₦500")
    setPropertyType("House")
    setCurrentPage(1)
    fetchProperties()
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
    size: property.area ? `${property.area} m²` : "N/A",
    imageUrl: property.main_image_url || "/house.jpeg",
    isFavorite: favorites.includes(property.id),
  })

  return (
    <>
      <Navigation />

      <main className="py-8">
        <div className="container mx-auto px-4">
          <h1 className="text-3xl font-bold mb-8">Search for Shortlist near you</h1>

          <div className="flex flex-col md:flex-row gap-4 mb-8">
            <div className="relative flex-1">
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search for properties"
                className="w-full px-4 py-3 pl-10 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
              />
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            </div>

            <button
              onClick={() => setIsFilterOpen(!isFilterOpen)}
              className="flex items-center justify-center gap-2 px-4 py-3 border border-gray-300 rounded-md hover:bg-gray-50"
            >
              <Filter size={18} />
              <span>Filters</span>
            </button>

            <button
              onClick={handleSearch}
              className="bg-primary hover:bg-primary-600 text-white px-4 py-3 rounded-md transition-colors"
            >
              Search
            </button>
          </div>

          {isFilterOpen && (
            <div className="bg-white p-6 rounded-lg shadow-md border mb-8">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Location</label>
                  <input
                    type="text"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">When</label>
                  <input
                    type="date"
                    value={moveInDate}
                    onChange={(e) => setMoveInDate(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Price Range</label>
                  <select
                    value={priceRange}
                    onChange={(e) => setPriceRange(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                  >
                    <option value="₦200-₦500">₦200-₦500</option>
                    <option value="₦500-₦1000">₦500-₦1000</option>
                    <option value="₦1000-₦2000">₦1000-₦2000</option>
                    <option value="₦2000+">₦2000+</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Property Type</label>
                  <select
                    value={propertyType}
                    onChange={(e) => setPropertyType(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                  >
                    <option value="House">House</option>
                    <option value="Apartment">Apartment</option>
                    <option value="Room">Room</option>
                    <option value="Flat">Flat</option>
                    <option value="Suite">Suite</option>
                    <option value="Penthouse">Penthouse</option>
                  </select>
                </div>
              </div>

              <div className="flex justify-between mt-4">
                <button
                  onClick={handleFilterChange}
                  className="bg-primary hover:bg-primary-600 text-white px-4 py-2 rounded-md transition-colors"
                >
                  Apply Filters
                </button>

                <button className="text-primary font-medium" onClick={clearFilters}>
                  Clear All
                </button>
              </div>
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
          ) : allProperties.length === 0 ? (
            <EmptyState
              icon={<Home className="h-8 w-8 text-gray-400" />}
              title="No properties found"
              description="Try adjusting your search filters to find what you're looking for."
              action={
                <button onClick={clearFilters} className="text-primary hover:text-primary-600 font-medium">
                  Clear all filters
                </button>
              }
            />
          ) : (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {displayedProperties.map((property) => (
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
        </div>
      </main>

      <Footer />
    </>
  )
}