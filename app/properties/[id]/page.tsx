"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { Navigation } from "@/components/navigation"
import { Footer } from "@/components/footer"
import { ArrowLeft, Bed, Bath, Square, Heart, Share2, Zap, Calendar, MapPin } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { LoginModal } from "@/components/login-modal"
import { SignupModal } from "@/components/signup-modal"
import { useAuth } from "@/contexts/auth-context"
import { PropertyCard } from "@/components/property-card"
import { format } from "date-fns"
import { Calendar as CalendarComponent } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { propertiesService, type Property } from "@/services/properties"

export default function PropertyDetailPage() {
  const params = useParams()
  const router = useRouter()
  const { toast } = useToast()
  const { user } = useAuth()
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false)
  const [isSignupModalOpen, setIsSignupModalOpen] = useState(false)
  const [property, setProperty] = useState<Property | null>(null)
  const [isFavorite, setIsFavorite] = useState(false)
  const [selectedImageIndex, setSelectedImageIndex] = useState(0)
  const [checkInDate, setCheckInDate] = useState<Date>()
  const [checkOutDate, setCheckOutDate] = useState<Date>()
  const [nights, setNights] = useState(1)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [similarProperties, setSimilarProperties] = useState<Property[]>([])

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
        setIsFavorite(propertyData.is_favorited || false)

        // Fetch similar properties
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
  }, [params.id, router, toast])

  useEffect(() => {
    if (checkInDate && checkOutDate) {
      const diffTime = Math.abs(checkOutDate.getTime() - checkInDate.getTime())
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
      setNights(diffDays)
    }
  }, [checkInDate, checkOutDate])

  const handleToggleFavorite = async () => {
    if (!user) {
      setIsLoginModalOpen(true)
      return
    }

    if (!property) return

    try {
      const result = await propertiesService.toggleFavorite(property.id)
      setIsFavorite(result.action === "added")
      toast({
        title: result.action === "added" ? "Added to favorites" : "Removed from favorites",
        description:
          result.action === "added"
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

    if (!checkInDate || !checkOutDate) {
      toast({
        title: "Select dates",
        description: "Please select check-in and check-out dates",
        variant: "destructive",
      })
      return
    }

    if (!property) return

    router.push(`/bookings/confirm?propertyId=${property.id}&nights=${nights}`)
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

  // Get all images, ensuring the main image is first
  const allImages = property.images || []
  const mainImageUrl =
    property.main_image_url || (allImages.length > 0 ? allImages[0].image_url : "/placeholder.svg?height=600&width=800")

  return (
    <>
      <Navigation />

      <main className="py-8">
        <div className="container mx-auto px-4">
          <button onClick={() => router.back()} className="flex items-center text-gray-600 hover:text-primary mb-4">
            <ArrowLeft className="h-4 w-4 mr-1" />
            <span>Back</span>
          </button>

          <div className="mb-6">
            <h1 className="text-3xl font-bold mb-2">{property.title}</h1>
            <p className="text-gray-500 flex items-center">
              <MapPin className="h-4 w-4 mr-1" />
              {property.address || property.location}
            </p>
          </div>

          <div className="flex justify-end mb-4 gap-2">
            <button
              className="flex items-center gap-1 px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50"
              onClick={() => {
                navigator.clipboard.writeText(window.location.href)
                toast({
                  title: "Link Copied",
                  description: "Property link copied to clipboard",
                })
              }}
            >
              <Share2 className="h-4 w-4" />
              <span>Share</span>
            </button>

            <button
              className={`flex items-center gap-1 px-4 py-2 border rounded-md ${
                isFavorite ? "bg-red-500 text-white border-red-500" : "border-gray-300 hover:bg-gray-50"
              }`}
              onClick={handleToggleFavorite}
            >
              <Heart className="h-4 w-4" fill={isFavorite ? "currentColor" : "none"} />
              <span>{isFavorite ? "Favorited" : "Favorite"}</span>
            </button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
            <div className="lg:col-span-2">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="md:col-span-4">
                  <img
                    src={
                      selectedImageIndex === 0
                        ? mainImageUrl
                        : allImages[selectedImageIndex - 1]?.image_url || mainImageUrl
                    }
                    alt={property.title}
                    className="w-full h-80 object-cover rounded-lg"
                  />
                </div>

                <div className="grid grid-cols-3 md:col-span-4 gap-4">
                  {/* Main image thumbnail */}
                  <div
                    className={`cursor-pointer border-2 rounded-lg overflow-hidden ${
                      selectedImageIndex === 0 ? "border-primary" : "border-transparent"
                    }`}
                    onClick={() => setSelectedImageIndex(0)}
                  >
                    <img
                      src={mainImageUrl || "/placeholder.svg"}
                      alt={`${property.title} main`}
                      className="w-full h-24 object-cover"
                    />
                  </div>

                  {/* Other image thumbnails */}
                  {allImages
                    .filter((img) => !img.is_main)
                    .slice(0, 2)
                    .map((image, index) => (
                      <div
                        key={image.id}
                        className={`cursor-pointer border-2 rounded-lg overflow-hidden ${
                          selectedImageIndex === index + 1 ? "border-primary" : "border-transparent"
                        }`}
                        onClick={() => setSelectedImageIndex(index + 1)}
                      >
                        <img
                          src={image.image_url || "/placeholder.svg"}
                          alt={`${property.title} ${index + 1}`}
                          className="w-full h-24 object-cover"
                        />
                      </div>
                    ))}
                </div>
              </div>

              {allImages.length > 3 && (
                <button
                  className="mt-4 text-primary font-medium flex items-center"
                  onClick={() => {
                    toast({
                      title: "Gallery",
                      description: "View all photos feature coming soon!",
                    })
                  }}
                >
                  View all photos
                </button>
              )}

              <div className="mt-8">
                <h2 className="text-2xl font-bold mb-4">About Shortlet</h2>
                <p className="text-gray-700 mb-6">{property.description || "No description available."}</p>

                <div className="grid grid-cols-3 gap-4 mb-8">
                  <div className="flex flex-col items-center p-4 bg-gray-50 rounded-lg">
                    <Bed className="h-6 w-6 text-primary mb-2" />
                    <span className="text-lg font-bold">{property.bedrooms}</span>
                    <span className="text-gray-500 text-sm">Bedrooms</span>
                  </div>

                  <div className="flex flex-col items-center p-4 bg-gray-50 rounded-lg">
                    <Bath className="h-6 w-6 text-primary mb-2" />
                    <span className="text-lg font-bold">{property.bathrooms}</span>
                    <span className="text-gray-500 text-sm">Bathrooms</span>
                  </div>

                  <div className="flex flex-col items-center p-4 bg-gray-50 rounded-lg">
                    <Square className="h-6 w-6 text-primary mb-2" />
                    <span className="text-lg font-bold">{property.area ? `${property.area} m²` : "N/A"}</span>
                    <span className="text-gray-500 text-sm">Area</span>
                  </div>
                </div>

                {property.features && property.features.length > 0 && (
                  <>
                    <h2 className="text-2xl font-bold mb-4">Key Features and Amenities</h2>
                    <div className="space-y-4 mb-8">
                      {property.features.map((feature) => (
                        <div key={feature.id} className="flex items-start gap-3">
                          <div className="mt-1">
                            <Zap className="h-5 w-5 text-primary" />
                          </div>
                          <div>
                            <p className="font-medium">{feature.name}</p>
                            {feature.description && <p className="text-gray-600 text-sm">{feature.description}</p>}
                          </div>
                        </div>
                      ))}
                    </div>
                  </>
                )}
              </div>
            </div>

            <div>
              <div className="bg-white p-6 rounded-lg shadow-md border sticky top-8">
                <div className="flex justify-between items-center mb-4">
                  <div>
                    <p className="text-2xl font-bold text-primary">{formatPrice(property.price)}</p>
                    <p className="text-gray-500">{property.duration_display.toLowerCase()}</p>
                  </div>

                  {property.is_available ? (
                    <span className="px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs">Available</span>
                  ) : (
                    <span className="px-2 py-1 bg-red-100 text-red-800 rounded-full text-xs">Unavailable</span>
                  )}
                </div>

                <div className="space-y-4 mb-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Check In</label>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          className={cn(
                            "w-full justify-start text-left font-normal",
                            !checkInDate && "text-muted-foreground",
                          )}
                        >
                          <Calendar className="mr-2 h-4 w-4" />
                          {checkInDate ? format(checkInDate, "PPP") : "Select date"}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0">
                        <CalendarComponent
                          mode="single"
                          selected={checkInDate}
                          onSelect={setCheckInDate}
                          initialFocus
                          disabled={(date) => date < new Date()}
                        />
                      </PopoverContent>
                    </Popover>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Check Out</label>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          className={cn(
                            "w-full justify-start text-left font-normal",
                            !checkOutDate && "text-muted-foreground",
                          )}
                        >
                          <Calendar className="mr-2 h-4 w-4" />
                          {checkOutDate ? format(checkOutDate, "PPP") : "Select date"}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0">
                        <CalendarComponent
                          mode="single"
                          selected={checkOutDate}
                          onSelect={setCheckOutDate}
                          initialFocus
                          disabled={(date) => !checkInDate || date <= checkInDate}
                        />
                      </PopoverContent>
                    </Popover>
                  </div>
                </div>

                <div className="border-t border-b py-4 mb-4">
                  <div className="flex justify-between mb-2">
                    <span>
                      {formatPrice(property.price)} x {nights} {nights === 1 ? "night" : "nights"}
                    </span>
                    <span>{formatPrice(Number.parseFloat(property.price) * nights)}</span>
                  </div>
                  <div className="flex justify-between font-bold">
                    <span>Total</span>
                    <span>{formatPrice(Number.parseFloat(property.price) * nights)}</span>
                  </div>
                </div>

                <button
                  onClick={handleBookNow}
                  disabled={!property.is_available}
                  className={`w-full py-3 px-4 rounded-md transition-colors ${
                    property.is_available
                      ? "bg-primary hover:bg-primary-600 text-white"
                      : "bg-gray-300 text-gray-500 cursor-not-allowed"
                  }`}
                >
                  {property.is_available ? "Book Now" : "Not Available"}
                </button>

                <div className="mt-6">
                  <h3 className="font-medium mb-2">You want to talk to us?</h3>
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-10 h-10 rounded-full bg-gray-200 overflow-hidden">
                      <img
                        src="/placeholder.svg?height=40&width=40"
                        alt="Staff"
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div>
                      <p className="font-medium">Damilola David</p>
                      <p className="text-sm text-gray-500">Staff at MJ's Haven</p>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      className="px-3 py-2 bg-gray-100 hover:bg-gray-200 rounded-md text-sm"
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
                      className="px-3 py-2 bg-gray-100 hover:bg-gray-200 rounded-md text-sm"
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
          </div>

          {similarProperties.length > 0 && (
            <div className="mt-12">
              <h2 className="text-2xl font-bold mb-6">Similar Properties</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {similarProperties.map((similarProperty) => (
                  <PropertyCard
                    key={similarProperty.id}
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
                ))}
              </div>
            </div>
          )}
        </div>
      </main>

      <Footer />

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

