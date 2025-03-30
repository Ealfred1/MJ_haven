"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { Navigation } from "@/components/navigation"
import { Footer } from "@/components/footer"
import { ArrowLeft, Bed, Bath, Square, Heart, Share2, Zap, Calendar } from "lucide-react"
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

const properties = [
  {
    id: "1",
    title: "2 Bedroom Room",
    price: 200095,
    address: "2699 Lekki Phase 1",
    area: "Lagos Island",
    city: "LG",
    beds: 3,
    baths: 2,
    size: "5×7 m²",
    description:
      "Discover your own piece of paradise with this stunning 2 bedroom apartment. Featuring an open floor plan, breathtaking ocean views from every room, and a pristine sandy beach, this property is the epitome of luxury living.",
    images: [
      "/placeholder.svg?height=600&width=800",
      "/placeholder.svg?height=300&width=400",
      "/placeholder.svg?height=300&width=400",
      "/placeholder.svg?height=300&width=400",
    ],
    amenities: [
      "Expansive oceanfront terrace for outdoor entertaining",
      "Luxurious penthouse suite with panoramic city views",
      "State-of-the-art fitness center with modern equipment",
    ],
    availability: true,
  },
  {
    id: "2",
    title: "1 Bedroom Apartment",
    price: 150000,
    address: "123 Victoria Island",
    area: "Lagos",
    city: "Lagos",
    beds: 1,
    baths: 1,
    size: "4×6 m²",
    description:
      "This cozy 1 bedroom apartment offers the perfect blend of comfort and style. Located in the heart of Victoria Island, you'll be just steps away from restaurants, shopping, and entertainment.",
    images: [
      "/placeholder.svg?height=600&width=800",
      "/placeholder.svg?height=300&width=400",
      "/placeholder.svg?height=300&width=400",
      "/placeholder.svg?height=300&width=400",
    ],
    amenities: [
      "Expansive oceanfront terrace for outdoor entertaining",
      "Luxurious penthouse suite with panoramic city views",
      "State-of-the-art fitness center with modern equipment",
    ],
    availability: false,
  },
  {
    id: "3",
    title: "3 Bedroom Flat",
    price: 300000,
    address: "45 Ikoyi",
    area: "Lagos",
    city: "Lagos",
    beds: 3,
    baths: 3,
    size: "6×8 m²",
    description:
      "Experience luxury living in this spacious 3 bedroom flat in the prestigious Ikoyi neighborhood. With high ceilings, premium finishes, and a private balcony, this property offers the perfect blend of comfort and elegance.",
    images: [
      "/placeholder.svg?height=600&width=800",
      "/placeholder.svg?height=300&width=400",
      "/placeholder.svg?height=300&width=400",
      "/placeholder.svg?height=300&width=400",
    ],
    amenities: [
      "Expansive oceanfront terrace for outdoor entertaining",
      "Luxurious penthouse suite with panoramic city views",
      "State-of-the-art fitness center with modern equipment",
    ],
    availability: true,
  },
  {
    id: "4",
    title: "1 Bedroom Suite",
    price: 150000,
    address: "123 Victoria Island",
    area: "Lagos",
    city: "Lagos",
    beds: 1,
    baths: 1,
    size: "4×5 m²",
    description:
      "This elegant 1 bedroom suite offers a sophisticated retreat in the heart of Victoria Island. With custom furnishings, high-end appliances, and a private balcony, this property is perfect for those seeking luxury and convenience.",
    images: [
      "/placeholder.svg?height=600&width=800",
      "/placeholder.svg?height=300&width=400",
      "/placeholder.svg?height=300&width=400",
      "/placeholder.svg?height=300&width=400",
    ],
    amenities: [
      "Expansive oceanfront terrace for outdoor entertaining",
      "Luxurious penthouse suite with panoramic city views",
      "State-of-the-art fitness center with modern equipment",
    ],
    availability: true,
  },
  {
    id: "5",
    title: "Penthouse Apartment",
    price: 350000,
    address: "45 Admiralty Way",
    area: "Lekki",
    city: "Lagos",
    beds: 4,
    baths: 3,
    size: "10×12 m²",
    description:
      "This stunning penthouse apartment offers unparalleled luxury and breathtaking views of the Lagos skyline. With 4 spacious bedrooms, a gourmet kitchen, and a private rooftop terrace, this property is the epitome of upscale living.",
    images: [
      "/placeholder.svg?height=600&width=800",
      "/placeholder.svg?height=300&width=400",
      "/placeholder.svg?height=300&width=400",
      "/placeholder.svg?height=300&width=400",
    ],
    amenities: [
      "Expansive oceanfront terrace for outdoor entertaining",
      "Luxurious penthouse suite with panoramic city views",
      "State-of-the-art fitness center with modern equipment",
    ],
    availability: true,
  },
]

export default function PropertyDetailPage() {
  const params = useParams()
  const router = useRouter()
  const { toast } = useToast()
  const { user } = useAuth()
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false)
  const [isSignupModalOpen, setIsSignupModalOpen] = useState(false)
  const [isFavorite, setIsFavorite] = useState(false)
  const [selectedImageIndex, setSelectedImageIndex] = useState(0)
  const [checkInDate, setCheckInDate] = useState<Date>()
  const [checkOutDate, setCheckOutDate] = useState<Date>()
  const [nights, setNights] = useState(1)

  const property = properties.find((p) => p.id === params.id)

  useEffect(() => {
    if (checkInDate && checkOutDate) {
      const diffTime = Math.abs(checkOutDate.getTime() - checkInDate.getTime())
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
      setNights(diffDays)
    }
  }, [checkInDate, checkOutDate])

  if (!property) {
    return <div>Property not found</div>
  }

  const formattedPrice = new Intl.NumberFormat("en-NG", {
    style: "currency",
    currency: "NGN",
    maximumFractionDigits: 0,
  })
    .format(property.price)
    .replace("NGN", "₦")

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

    router.push(`/bookings/confirm?propertyId=${property.id}&nights=${nights}`)
  }

  // Get similar properties (excluding current property)
  const similarProperties = properties.filter((p) => p.id !== property.id).slice(0, 3)

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
            <p className="text-gray-500">
              {property.address}, {property.area}, {property.city}
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
              onClick={() => setIsFavorite(!isFavorite)}
            >
              <Heart className="h-4 w-4" fill={isFavorite ? "currentColor" : "none"} />
              <span>{isFavorite ? "Favorited" : "Favorite"}</span>
            </button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
            <div className="lg:col-span-2">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="md:col-span-2">
                  <img
                    src={property.images[selectedImageIndex] || "/placeholder.svg?height=600&width=800"}
                    alt={property.title}
                    className="w-full h-80 object-cover rounded-lg"
                  />
                </div>

                <div className="grid grid-cols-3 gap-4">
                  {property.images.slice(0, 3).map((image, index) => (
                    <div
                      key={index}
                      className={`cursor-pointer border-2 rounded-lg overflow-hidden ${
                        selectedImageIndex === index ? "border-primary" : "border-transparent"
                      }`}
                      onClick={() => setSelectedImageIndex(index)}
                    >
                      <img
                        src={image || "/placeholder.svg?height=300&width=400"}
                        alt={`${property.title} ${index + 1}`}
                        className="w-full h-24 object-cover"
                      />
                    </div>
                  ))}
                </div>
              </div>

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

              <div className="mt-8">
                <h2 className="text-2xl font-bold mb-4">About Shortlet</h2>
                <p className="text-gray-700 mb-6">{property.description}</p>

                <div className="grid grid-cols-3 gap-4 mb-8">
                  <div className="flex flex-col items-center p-4 bg-gray-50 rounded-lg">
                    <Bed className="h-6 w-6 text-primary mb-2" />
                    <span className="text-lg font-bold">{property.beds}</span>
                    <span className="text-gray-500 text-sm">Bedrooms</span>
                  </div>

                  <div className="flex flex-col items-center p-4 bg-gray-50 rounded-lg">
                    <Bath className="h-6 w-6 text-primary mb-2" />
                    <span className="text-lg font-bold">{property.baths}</span>
                    <span className="text-gray-500 text-sm">Bathrooms</span>
                  </div>

                  <div className="flex flex-col items-center p-4 bg-gray-50 rounded-lg">
                    <Square className="h-6 w-6 text-primary mb-2" />
                    <span className="text-lg font-bold">{property.size}</span>
                    <span className="text-gray-500 text-sm">Area</span>
                  </div>
                </div>

                <h2 className="text-2xl font-bold mb-4">Key Features and Amenities</h2>
                <div className="space-y-4 mb-8">
                  {property.amenities.map((amenity, index) => (
                    <div key={index} className="flex items-start gap-3">
                      <div className="mt-1">
                        <Zap className="h-5 w-5 text-primary" />
                      </div>
                      <p>{amenity}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div>
              <div className="bg-white p-6 rounded-lg shadow-md border sticky top-8">
                <div className="flex justify-between items-center mb-4">
                  <div>
                    <p className="text-2xl font-bold text-primary">{formattedPrice}</p>
                    <p className="text-gray-500">per day</p>
                  </div>

                  {property.availability ? (
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
                      {formattedPrice} x {nights} {nights === 1 ? "night" : "nights"}
                    </span>
                    <span>
                      {new Intl.NumberFormat("en-NG", {
                        style: "currency",
                        currency: "NGN",
                        maximumFractionDigits: 0,
                      })
                        .format(property.price * nights)
                        .replace("NGN", "₦")}
                    </span>
                  </div>
                  <div className="flex justify-between font-bold">
                    <span>Total</span>
                    <span>
                      {new Intl.NumberFormat("en-NG", {
                        style: "currency",
                        currency: "NGN",
                        maximumFractionDigits: 0,
                      })
                        .format(property.price * nights)
                        .replace("NGN", "₦")}
                    </span>
                  </div>
                </div>

                <button
                  onClick={handleBookNow}
                  disabled={!property.availability}
                  className={`w-full py-3 px-4 rounded-md transition-colors ${
                    property.availability
                      ? "bg-primary hover:bg-primary-600 text-white"
                      : "bg-gray-300 text-gray-500 cursor-not-allowed"
                  }`}
                >
                  {property.availability ? "Book Now" : "Not Available"}
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

          <div className="mt-12">
            <h2 className="text-2xl font-bold mb-6">Similar Properties</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {similarProperties.map((property) => (
                <PropertyCard key={property.id} {...property} />
              ))}
            </div>
          </div>
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

