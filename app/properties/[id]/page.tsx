"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { Navigation } from "@/components/navigation"
import { Footer } from "@/components/footer"
import { ArrowLeft, Bed, Bath, Square, Heart, Share2, Zap, Camera, Play } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { LoginModal } from "@/components/login-modal"
import { SignupModal } from "@/components/signup-modal"
import { useAuth } from "@/contexts/auth-context"
import { PropertyCard } from "@/components/property-card"
import { propertiesService, type Property } from "@/services/properties"
import { ImageGallery } from "@/components/image-gallery"

export default function PropertyDetailPage() {
  const params = useParams()
  const router = useRouter()
  const { toast } = useToast()
  const { user } = useAuth()
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false)
  const [isSignupModalOpen, setIsSignupModalOpen] = useState(false)
  const [property, setProperty] = useState<Property | null>(null)
  const [isFavorite, setIsFavorite] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [similarProperties, setSimilarProperties] = useState<Property[]>([])
  const [isGalleryOpen, setIsGalleryOpen] = useState(false)
  const [galleryInitialIndex, setGalleryInitialIndex] = useState(0)
  const [selectedThumbnailIndex, setSelectedThumbnailIndex] = useState(0)

  useEffect(() => {
    const fetchPropertyData = async () => {
      setIsLoading(true)
      setError(null)
      try {
        const propertyId = params.id
        if (!propertyId) {
          router.push("/properties")
          return
        }

        const propertyData = await propertiesService.getProperty(propertyId)
        setProperty(propertyData)

        if (user) {
          setIsFavorite(propertyData.is_favorited || false)
        } else {
          const isLocalFavorite = propertiesService.isPropertyFavorited(Number(propertyId))
          setIsFavorite(isLocalFavorite)
        }

        const filters: any = {
          property_type: propertyData.property_type,
        }
        const response = await propertiesService.getProperties(filters)
        const filteredProperties = response.results.filter((p) => p.id !== propertyData.id).slice(0, 3)
        setSimilarProperties(filteredProperties)
      } catch (err) {
        console.error("Failed to fetch property:", err)
        setError("Failed to load property details")
        toast({
          title: "Error",
          description: "Failed to load property details. Please try again.",
          variant: "destructive",
        })
      } finally {
        setIsLoading(false)
      }
    }

    fetchPropertyData()
  }, [params.id, router, toast, user])

  // Sync local favorites to server after login
  useEffect(() => {
    if (user) {
      propertiesService.syncLocalFavoritesToServer()
    }
  }, [user])

  const handleToggleFavorite = async () => {
    if (!property) return

    try {
      const result = await propertiesService.toggleFavorite(property.id)

      // Determine if the property is now favorited based on the response
      const newFavoriteState = result.id !== undefined || result.action === "added"
      setIsFavorite(newFavoriteState)

      toast({
        title: newFavoriteState ? "Added to favorites" : "Removed from favorites",
        description: newFavoriteState
          ? `${property.title} has been added to your favorites`
          : `${property.title} has been removed from your favorites`,
      })
    } catch (err) {
      console.error("Failed to toggle favorite:", err)
      toast({
        title: "Error",
        description: "Failed to update favorites. Please try again.",
        variant: "destructive",
      })
    }
  }

  const handleBookNow = () => {
    if (!user) {
      setIsLoginModalOpen(true)
      return
    }

    if (!property) return

    // Get current date for default check-in date (tomorrow)
    const tomorrow = new Date()
    tomorrow.setDate(tomorrow.getDate() + 1)
    const tomorrowStr = tomorrow.toISOString().split("T")[0]

    // Default to 3 days stay
    const checkoutDate = new Date(tomorrow)
    checkoutDate.setDate(checkoutDate.getDate() + 3)
    const checkoutStr = checkoutDate.toISOString().split("T")[0]

    router.push(`/bookings/confirm?propertyId=${property.id}&checkIn=${tomorrowStr}&checkOut=${checkoutStr}`)
  }

  const formatPrice = (price: string | number) => {
    const numericPrice = typeof price === "string" ? Number.parseFloat(price) : price
    return new Intl.NumberFormat("en-NG", {
      style: "currency",
      currency: "NGN",
      maximumFractionDigits: 0,
    })
      .format(numericPrice)
      .replace("NGN", "₦")
  }

  const openGallery = (index: number) => {
    setGalleryInitialIndex(index)
    setIsGalleryOpen(true)
  }

  const handleThumbnailClick = (index: number) => {
    setSelectedThumbnailIndex(index)
  }

  if (isLoading) {
    return (
      <>
        <Navigation />
        <div className="container mx-auto px-4 py-16 text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-gray-500">Loading property details...</p>
        </div>
        <Footer />
      </>
    )
  }

  if (error || !property) {
    return (
      <>
        <Navigation />
        <div className="container mx-auto px-4 py-16 text-center">
          <p className="text-red-500">{error || "Property not found"}</p>
          <button onClick={() => router.push("/properties")} className="mt-4 text-primary hover:text-primary-600">
            Browse other properties
          </button>
        </div>
        <Footer />
      </>
    )
  }

  // Get all images
  const allImages = property.images || []
  const mainImageUrl =
    property.main_image_url || (allImages.length > 0 ? allImages[0].image_url : "/placeholder.svg?height=600&width=800")

  // Create an array of media items (images and videos) for the gallery
  const galleryMedia = [
    { type: "image" as const, url: mainImageUrl },
    ...allImages.filter((img) => !img.is_main).map((img) => ({ type: "image" as const, url: img.image_url })),
  ]

  // Add videos to the gallery media if they exist
  if (property.videos && property.videos.length > 0) {
    property.videos.forEach((video) => {
      galleryMedia.push({ type: "video" as const, url: video.video_url })
    })
  }

  // Legacy format for backward compatibility
  const galleryImages = [mainImageUrl, ...allImages.filter((img) => !img.is_main).map((img) => img.image_url)]

  // Get the currently displayed main image based on selected thumbnail
  const displayedMainImage =
    selectedThumbnailIndex === 0
      ? mainImageUrl
      : allImages.filter((img) => !img.is_main)[selectedThumbnailIndex - 1]?.image_url || mainImageUrl

  // Check if we have videos
  const hasVideos = property.videos && property.videos.length > 0

  return (
    <>
      <Navigation />

      <main className="py-4 sm:py-8 bg-white">
        <div className="container mx-auto px-4 max-w-6xl">
          {/* Header Section */}
          <div className="mb-4 sm:mb-6">
            <button
              onClick={() => router.back()}
              className="flex items-center text-[#374027] hover:text-primary font-semibold text-sm sm:text-[16px] mb-2 sm:mb-4"
            >
              <ArrowLeft className="h-4 w-4 mr-1" />
              <span>Back</span>
            </button>

            <div className="flex flex-col md:flex-row md:items-center md:justify-between">
              <div>
                <h1 className="text-2xl sm:text-3xl md:text-[40px] tracking-tight text-[#1C1B20] font-bold mb-1">
                  {property.title}
                </h1>
                <p className="text-sm sm:text-base md:text-[18px] text-[#000929] font-medium">
                  {property.address || property.location}
                </p>
              </div>

              <div className="flex mt-4 md:mt-0 gap-2">
                <button
                  className="flex items-center gap-1 px-2 sm:px-4 py-2 bg-[#F6F9EA] w-auto sm:w-[125px] h-10 sm:h-[50px] justify-center rounded-[8px] border border-[#D6DDB9] hover:bg-gray-200 transition-colors text-sm"
                  onClick={() => {
                    navigator.clipboard.writeText(window.location.href)
                    toast({
                      title: "Link Copied",
                      description: "Property link copied to clipboard",
                    })
                  }}
                >
                  <Share2 className="h-4 w-4" />
                  <span className="hidden sm:inline">Share</span>
                </button>

                <button
                  className={`flex items-center gap-1 px-2 sm:px-4 py-2 w-auto sm:w-[125px] h-10 sm:h-[50px] justify-center rounded-[8px] transition-colors text-sm ${
                    isFavorite
                      ? "bg-red-500 text-white hover:bg-red-600"
                      : "bg-[#F6F9EA] hover:bg-gray-200 border border-[#D6DDB9]"
                  }`}
                  onClick={handleToggleFavorite}
                >
                  <Heart className="h-4 w-4" fill={isFavorite ? "currentColor" : "none"} />
                  <span className="hidden sm:inline">Favorite</span>
                </button>
              </div>
            </div>
          </div>

          {/* Gallery Section - UPDATED for Mobile */}
          <div className="mb-6 sm:mb-8">
            {/* Desktop View */}
            <div className="hidden md:grid md:grid-cols-3 gap-[10px]">
              {/* Main large image */}
              <div className="col-span-2 relative">
                <div
                  className="cursor-pointer relative w-full h-[400px] rounded-lg overflow-hidden"
                  onClick={() => openGallery(selectedThumbnailIndex)}
                >
                  <img
                    src={displayedMainImage || "/placeholder.svg"}
                    alt={property.title}
                    className="w-full h-full object-cover"
                  />
                </div>
              </div>

              {/* Thumbnails container - Only visible on tablet and desktop */}
              <div className="flex flex-col gap-[10px] h-[400px]">
                {/* Grid to make both thumbnails the same height */}
                <div className="grid grid-rows-2 gap-[10px] h-full">
                  {/* Main image thumbnail */}
                  <div
                    className={`cursor-pointer relative w-full h-full rounded-lg overflow-hidden ${
                      selectedThumbnailIndex === 0 ? "ring-2 ring-primary" : ""
                    }`}
                    onClick={() => handleThumbnailClick(0)}
                  >
                    <img
                      src={mainImageUrl || "/placeholder.svg"}
                      alt={`${property.title} main`}
                      className="w-full h-full object-cover"
                    />
                  </div>

                  {/* Second thumbnail or video */}
                  {hasVideos ? (
                    <div
                      className="cursor-pointer relative w-full h-full rounded-lg overflow-hidden"
                      onClick={() => openGallery(allImages.length)}
                    >
                      <div className="relative w-full h-full">
                        <video src={property.videos[0].video_url} className="w-full h-full object-cover" muted />
                        <div className="absolute inset-0 flex items-center justify-center bg-black/40">
                          <Play className="h-12 w-12 text-white opacity-80" />
                        </div>
                      </div>
                    </div>
                  ) : allImages.filter((img) => !img.is_main)[0] ? (
                    <div
                      className={`cursor-pointer relative w-full h-full rounded-lg overflow-hidden ${
                        selectedThumbnailIndex === 1 ? "ring-2 ring-primary" : ""
                      }`}
                      onClick={() => handleThumbnailClick(1)}
                    >
                      <img
                        src={
                          allImages.filter((img) => !img.is_main)[0]?.image_url ||
                          "/placeholder.svg?height=200&width=300"
                        }
                        alt={`${property.title} 1`}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  ) : (
                    <div className="w-full h-full rounded-lg bg-gray-100 flex items-center justify-center">
                      <span className="text-gray-400 text-sm">No more images</span>
                    </div>
                  )}

                  {/* View all photos button - Positioned relative to the second thumbnail */}
                  {(allImages.length > 2 || hasVideos) && (
                    <div className="absolute bottom-4 right-4">
                      <button
                        className="bg-white/90 backdrop-blur-sm text-gray-800 px-3 py-2 rounded-md text-sm font-medium flex items-center gap-1 hover:bg-white transition-colors"
                        onClick={() => setIsGalleryOpen(true)}
                      >
                        <Camera className="h-4 w-4" />
                        <span>View all media</span>
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Mobile View */}
            <div className="md:hidden space-y-2">
              {/* Main image */}
              <div
                className="cursor-pointer relative w-full h-[250px] sm:h-[350px] rounded-lg overflow-hidden"
                onClick={() => openGallery(0)}
              >
                <img
                  src={mainImageUrl || "/placeholder.svg"}
                  alt={property.title}
                  className="w-full h-full object-cover"
                />

                {/* Mobile view gallery button */}
                <button
                  className="absolute bottom-4 right-4 bg-white/80 backdrop-blur-sm text-gray-800 px-3 py-1.5 rounded-md text-sm font-medium flex items-center gap-1 hover:bg-white transition-colors"
                  onClick={(e) => {
                    e.stopPropagation()
                    setIsGalleryOpen(true)
                  }}
                >
                  <Camera className="h-4 w-4" />
                  <span>View all</span>
                </button>
              </div>

              {/* Additional images and video in a row for mobile */}
              <div className="grid grid-cols-2 gap-2">
                {/* First additional image or video */}
                {hasVideos ? (
                  <div
                    className="cursor-pointer relative w-full h-[150px] rounded-lg overflow-hidden"
                    onClick={() => openGallery(allImages.length)}
                  >
                    <div className="relative w-full h-full">
                      <video src={property.videos[0].video_url} className="w-full h-full object-cover" muted />
                      <div className="absolute inset-0 flex items-center justify-center bg-black/40">
                        <Play className="h-10 w-10 text-white opacity-80" />
                      </div>
                    </div>
                  </div>
                ) : allImages.filter((img) => !img.is_main)[0] ? (
                  <div
                    className="cursor-pointer relative w-full h-[150px] rounded-lg overflow-hidden"
                    onClick={() => openGallery(1)}
                  >
                    <img
                      src={allImages.filter((img) => !img.is_main)[0]?.image_url || "/placeholder.svg"}
                      alt={`${property.title} 1`}
                      className="w-full h-full object-cover"
                    />
                  </div>
                ) : (
                  <div className="w-full h-[150px] rounded-lg bg-gray-100 flex items-center justify-center">
                    <span className="text-gray-400 text-sm">No more images</span>
                  </div>
                )}

                {/* Second additional image or view more */}
                {allImages.filter((img) => !img.is_main)[1] ? (
                  <div
                    className="cursor-pointer relative w-full h-[150px] rounded-lg overflow-hidden"
                    onClick={() => openGallery(2)}
                  >
                    <img
                      src={allImages.filter((img) => !img.is_main)[1]?.image_url || "/placeholder.svg"}
                      alt={`${property.title} 2`}
                      className="w-full h-full object-cover"
                    />

                    {/* View all overlay if more than 3 images total or has videos */}
                    {(allImages.length > 3 || (hasVideos && allImages.length > 2)) && (
                      <div className="absolute inset-0 flex items-center justify-center bg-black/40">
                        <button
                          className="bg-white/90 text-gray-800 px-3 py-1.5 rounded-md text-sm font-medium"
                          onClick={(e) => {
                            e.stopPropagation()
                            setIsGalleryOpen(true)
                          }}
                        >
                          +{allImages.length - 3 + (hasVideos ? property.videos.length : 0)} more
                        </button>
                      </div>
                    )}
                  </div>
                ) : (
                  // Placeholder for second image if not available
                  <div className="w-full h-[150px] rounded-lg bg-gray-100 flex items-center justify-center">
                    <span className="text-gray-400 text-sm">No more media</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Price Section */}
          <div className="border rounded-lg mb-4 sm:mb-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center p-3 sm:p-4">
              <div className="mb-2 sm:mb-0">
                <p className="text-lg sm:text-xl font-bold text-gray-900">
                  {formatPrice(property.price)}{" "}
                  <span className="text-xs sm:text-sm font-normal text-gray-500">/per day</span>
                </p>
              </div>

              <div className="flex items-center gap-2 sm:gap-3 w-full sm:w-auto">
                {property.is_available ? (
                  <span className="flex items-center gap-1 text-green-600 text-xs sm:text-sm">
                    <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                    Available
                  </span>
                ) : (
                  <span className="flex items-center gap-1 text-orange-600 text-xs sm:text-sm">
                    <span className="w-2 h-2 bg-orange-500 rounded-full"></span>
                    Unavailable
                  </span>
                )}
                <button
                  onClick={handleBookNow}
                  disabled={!property.is_available}
                  className={`py-2 px-3 sm:px-4 rounded-md text-white text-xs sm:text-sm font-medium ml-auto sm:ml-0 ${
                    property.is_available ? "bg-[#66773B] hover:bg-[#5c6a35]" : "bg-gray-400 cursor-not-allowed"
                  }`}
                >
                  Book Now
                </button>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6 mb-4 sm:mb-6">
            {/* About Section */}
            <div className="border rounded-lg">
              <div className="p-3 sm:p-4">
                <h2 className="text-lg sm:text-xl font-bold mb-2 sm:mb-4">About Shortlet</h2>
                <p className="text-sm sm:text-base text-gray-700 mb-4 sm:mb-6">
                  {property.description ||
                    "Discover your own piece of paradise with the Seaside Serenity Villa. With an open floor plan, breathtaking ocean views from every room, and direct access to a pristine sandy beach, this property is the epitome of coastal living."}
                </p>

                <div className="flex border-t pt-3 sm:pt-4">
                  <div className="flex-1 flex flex-col items-center">
                    <div className="flex items-center mb-1">
                      <Bed className="h-4 w-4 sm:h-5 sm:w-5 text-gray-500 mr-1 sm:mr-2" />
                      <span className="text-gray-500 text-xs sm:text-sm">Bedrooms</span>
                    </div>
                    <span className="text-base sm:text-lg font-bold">
                      {property.bedrooms.toString().padStart(2, "0")}
                    </span>
                  </div>

                  <div className="flex-1 flex flex-col items-center">
                    <div className="flex items-center mb-1">
                      <Bath className="h-4 w-4 sm:h-5 sm:w-5 text-gray-500 mr-1 sm:mr-2" />
                      <span className="text-gray-500 text-xs sm:text-sm">Bathrooms</span>
                    </div>
                    <span className="text-base sm:text-lg font-bold">
                      {property.bathrooms.toString().padStart(2, "0")}
                    </span>
                  </div>

                  <div className="flex-1 flex flex-col items-center">
                    <div className="flex items-center mb-1">
                      <Square className="h-4 w-4 sm:h-5 sm:w-5 text-gray-500 mr-1 sm:mr-2" />
                      <span className="text-gray-500 text-xs sm:text-sm">Area</span>
                    </div>
                    <span className="text-base sm:text-lg font-bold">
                      {property.area ? `${property.area} m²` : "4 x 5 meter ft"}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Key Features Section */}
            <div className="border rounded-lg">
              <div className="p-3 sm:p-4">
                <h2 className="text-lg sm:text-xl font-bold mb-2 sm:mb-4">Key Features and Amenities</h2>
                <div className="space-y-3 sm:space-y-4">
                  {property.features && property.features.length > 0 ? (
                    property.features.map((feature) => (
                      <div key={feature.id} className="flex items-start gap-2 sm:gap-3">
                        <div className="mt-1 text-[#66773B] flex-shrink-0">
                          <Zap className="h-4 w-4 sm:h-5 sm:w-5" />
                        </div>
                        <div>
                          <p className="font-medium text-sm sm:text-base">{feature.name}</p>
                          {feature.description && (
                            <p className="text-gray-600 text-xs sm:text-sm">{feature.description}</p>
                          )}
                        </div>
                      </div>
                    ))
                  ) : (
                    <>
                      <div className="flex items-start gap-2 sm:gap-3">
                        <div className="mt-1 text-[#66773B] flex-shrink-0">
                          <Zap className="h-4 w-4 sm:h-5 sm:w-5" />
                        </div>
                        <p className="text-sm sm:text-base">Expansive oceanfront terrace for outdoor entertaining</p>
                      </div>
                      <div className="flex items-start gap-2 sm:gap-3">
                        <div className="mt-1 text-[#66773B] flex-shrink-0">
                          <Zap className="h-4 w-4 sm:h-5 sm:w-5" />
                        </div>
                        <p className="text-sm sm:text-base">Luxurious penthouse suite with panoramic city views</p>
                      </div>
                      <div className="flex items-start gap-2 sm:gap-3">
                        <div className="mt-1 text-[#66773B] flex-shrink-0">
                          <Zap className="h-4 w-4 sm:h-5 sm:w-5" />
                        </div>
                        <p className="text-sm sm:text-base">State-of-the-art fitness center with modern equipment</p>
                      </div>
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Contact Section */}
          <div className="border rounded-lg mb-6 sm:mb-8">
            <div className="p-3 sm:p-4">
              <h3 className="font-medium text-sm sm:text-base mb-3 sm:mb-4">You want to talk to us?</h3>
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-0">
                <div className="flex items-center gap-2 sm:gap-3">
                  <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-gray-200 overflow-hidden flex-shrink-0">
                    <img src="/placeholder.svg?height=40&width=40" alt="Staff" className="w-full h-full object-cover" />
                  </div>
                  <div>
                    <p className="font-medium text-sm sm:text-base">Damilola David</p>
                    <p className="text-xs sm:text-sm text-gray-500">Staff at MJ's Haven</p>
                  </div>
                </div>
                <div className="flex gap-2 w-full sm:w-auto">
                  <button
                    className="flex-1 sm:flex-none px-2 sm:px-3 py-1.5 sm:py-2 bg-gray-100 hover:bg-gray-200 rounded-md text-xs sm:text-sm"
                    onClick={() => {
                      toast({
                        title: "Question",
                        description: "Your question has been sent to our staff.",
                      })
                    }}
                  >
                    Ask a question
                  </button>
                  <button
                    className="flex-1 sm:flex-none px-2 sm:px-3 py-1.5 sm:py-2 bg-gray-100 hover:bg-gray-200 rounded-md text-xs sm:text-sm"
                    onClick={() => {
                      toast({
                        title: "Info",
                        description: "More information has been sent to your email.",
                      })
                    }}
                  >
                    Get more info
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Similar Properties Section */}
          {similarProperties.length > 0 && (
            <div className="mt-8 sm:mt-12">
              <h2 className="text-xl sm:text-2xl font-bold mb-4 sm:mb-6">Similar Properties</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 overflow-x-auto pb-4">
                {similarProperties.map((similarProperty) => (
                  <div key={similarProperty.id} className="w-full flex justify-center">
                    <PropertyCard
                      id={similarProperty.id}
                      title={similarProperty.title}
                      price={Number.parseFloat(similarProperty.price)}
                      address={
                        similarProperty.address || similarProperty.location.split(",")[0] || similarProperty.location
                      }
                      area={similarProperty.location.split(",")[1] || ""}
                      city={similarProperty.location.split(",")[2] || ""}
                      beds={similarProperty.bedrooms}
                      baths={similarProperty.bathrooms}
                      size={similarProperty.area ? `${similarProperty.area} m²` : "N/A"}
                      imageUrl={similarProperty.main_image_url}
                      isFavorite={similarProperty.is_favorited}
                    />
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </main>

      <Footer />

      {/* Image Gallery Modal */}
      <ImageGallery
        media={galleryMedia}
        images={galleryImages}
        isOpen={isGalleryOpen}
        initialIndex={galleryInitialIndex}
        onClose={() => setIsGalleryOpen(false)}
      />

      <LoginModal
        isOpen={isLoginModalOpen}
        onClose={() => setIsLoginModalOpen(false)}
        onSignupClick={() => {
          setIsLoginModalOpen(false)
          setIsSignupModalOpen(true)
        }}
      />

      <SignupModal
        isOpen={isSignupModalOpen}
        onClose={() => setIsSignupModalOpen(false)}
        onLoginClick={() => {
          setIsSignupModalOpen(false)
          setIsLoginModalOpen(true)
        }}
      />
    </>
  )
}

