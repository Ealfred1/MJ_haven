"use client"

import { useState, useEffect } from "react"
import { Navigation } from "@/components/navigation"
import { Footer } from "@/components/footer"
import { useSearchParams, useRouter } from "next/navigation"
import { useAuth } from "@/contexts/auth-context"
import { LoginModal } from "@/components/login-modal"
import { SignupModal } from "@/components/signup-modal"
import { useToast } from "@/hooks/use-toast"
import { Calendar, Info, ArrowLeft, Check } from "lucide-react"
import Link from "next/link"
import { propertiesService, type Property } from "@/services/properties"
import { bookingsService } from "@/services/bookings"
import { motion, AnimatePresence } from "framer-motion"
import { differenceInDays } from "date-fns"

export default function BookingConfirmationPage() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const { user } = useAuth()
  const { toast } = useToast()
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false)
  const [isSignupModalOpen, setIsSignupModalOpen] = useState(false)
  const [property, setProperty] = useState<Property | null>(null)
  const [nights, setNights] = useState(3)
  const [checkInDate, setCheckInDate] = useState("")
  const [checkOutDate, setCheckOutDate] = useState("")
  const [fullName, setFullName] = useState("")
  const [email, setEmail] = useState("")
  const [phone, setPhone] = useState("")
  const [paymentMethod, setPaymentMethod] = useState("flutterwave")
  const [isLoading, setIsLoading] = useState(false)
  const [isPropertyLoading, setIsPropertyLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [bookingSuccess, setBookingSuccess] = useState(false)
  const [bookingError, setBookingError] = useState<string | null>(null)

  useEffect(() => {
    // Check if user is logged in
    if (!user) {
      setIsLoginModalOpen(true)
      return
    } else {
      setFullName(user.name)
      setEmail(user.email)
      setPhone(user.phone || "")
    }

    // Get property ID from URL
    const propertyId = searchParams.get("propertyId")
    if (!propertyId) {
      router.push("/properties")
      return
    }

    // Get check-in and check-out dates from URL if available
    const checkInParam = searchParams.get("checkIn")
    const checkOutParam = searchParams.get("checkOut")

    if (checkInParam) setCheckInDate(checkInParam)
    if (checkOutParam) {
      setCheckOutDate(checkOutParam)

      // Calculate nights if both dates are provided
      if (checkInParam) {
        const days = differenceInDays(new Date(checkOutParam), new Date(checkInParam))
        if (days > 0) setNights(days)
      }
    }

    // Fetch property details
    fetchPropertyDetails(propertyId)
  }, [searchParams, router, user])

  const fetchPropertyDetails = async (propertyId: string) => {
    setIsPropertyLoading(true)
    try {
      const propertyData = await propertiesService.getProperty(propertyId)
      setProperty(propertyData)
    } catch (error) {
      console.error("Failed to fetch property:", error)
      toast({
        title: "Error",
        description: "Failed to load property details. Please try again.",
        variant: "destructive",
      })
      router.push("/properties")
    } finally {
      setIsPropertyLoading(false)
    }
  }

  // Update nights when dates change
  useEffect(() => {
    if (checkInDate && checkOutDate) {
      const start = new Date(checkInDate)
      const end = new Date(checkOutDate)

      if (end > start) {
        const days = differenceInDays(end, start)
        setNights(days)
      } else if (end < start) {
        // If check-out is before check-in, reset check-out
        toast({
          title: "Invalid dates",
          description: "Check-out date must be after check-in date",
          variant: "destructive",
        })
        setCheckOutDate("")
      }
    }
  }, [checkInDate, checkOutDate, toast])

  const handlePayNow = async () => {
    if (!checkInDate || !checkOutDate || !fullName || !email || !phone) {
      toast({
        title: "Error",
        description: "Please fill in all required fields",
        variant: "destructive",
      })
      return
    }

    if (!property) {
      toast({
        title: "Error",
        description: "Property details not available",
        variant: "destructive",
      })
      return
    }

    setIsSubmitting(true)
    setBookingError(null)

    try {
      // Create booking
      const bookingData = {
        property: property.id,
        check_in_date: checkInDate,
        check_out_date: checkOutDate,
        guests: 2, // Default to 2 guests
        payment_method: paymentMethod,
        notes: `Booking for ${nights} nights`,
      }

      const booking = await bookingsService.createBooking(bookingData)

      // Process payment
      console.log(booking.id, "id")
      const paymentResponse = await bookingsService.processPayment(booking.id)

      // Redirect to payment page
      if (paymentResponse.payment_link) {
        window.location.href = paymentResponse.payment_link
      } else {
        throw new Error("Payment link not received")
      }

      setBookingSuccess(true)
    } catch (error) {
      console.error("Booking failed:", error)
      setBookingError(typeof error === "string" ? error : "Failed to create booking. Please try again.")
      toast({
        title: "Booking Failed",
        description: "There was an error processing your booking. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  // Calculate total price
  const calculatePrice = () => {
    if (!property) return { basePrice: 0, tax: 0, total: 0 }

    // Convert property price to number
    const pricePerDay = Number(property.price)

    // Calculate base price based on nights
    const basePrice = pricePerDay * nights

    // Calculate tax (20% of base price)
    const tax = basePrice * 0.2

    // Calculate total
    const total = basePrice + tax

    return { basePrice, tax, total }
  }

  const { basePrice, tax, total } = calculatePrice()

  // Format price
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("en-NG", {
      style: "currency",
      currency: "NGN",
      maximumFractionDigits: 0,
    })
      .format(price)
      .replace("NGN", "₦")
  }

  if (isPropertyLoading) {
    return (
      <>
        <Navigation />
        <div className="container mx-auto px-4 py-16 flex items-center justify-center">
          <div className="flex flex-col items-center">
            <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
            <p className="mt-4 text-gray-500">Loading booking details...</p>
          </div>
        </div>
        <Footer />
      </>
    )
  }

  return (
    <>
      <Navigation />

      <main className="py-8 bg-gray-50">
        <div className="container mx-auto px-4 max-w-6xl">
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="mb-6">
            <div className="flex items-center text-sm text-gray-500 mb-4">
              <Link href="/properties" className="hover:text-primary">
                Properties Details
              </Link>
              <span className="mx-2">/</span>
              <span>Bookings</span>
            </div>
            <div className="flex items-center justify-between">
              <h1 className="text-3xl font-bold">Confirm your bookings</h1>
              <button
                onClick={() => router.back()}
                className="flex items-center text-gray-600 hover:text-primary transition-colors"
              >
                <ArrowLeft className="h-4 w-4 mr-1" />
                <span>Back</span>
              </button>
            </div>
          </motion.div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Left Column - User Details */}
            <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.1 }}>
              <div className="bg-white p-6 rounded-xl shadow-md border mb-6">
                <h2 className="text-xl font-bold mb-4">Your Details</h2>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <div>
                    <label htmlFor="check-in" className="block text-sm font-medium text-gray-700 mb-1">
                      Check In date*
                    </label>
                    <div className="relative">
                      <input
                        id="check-in"
                        type="date"
                        value={checkInDate}
                        onChange={(e) => setCheckInDate(e.target.value)}
                        className="w-full px-4 py-3 pl-10 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all duration-200"
                        required
                      />
                      <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                    </div>
                  </div>

                  <div>
                    <label htmlFor="check-out" className="block text-sm font-medium text-gray-700 mb-1">
                      Check Out date*
                    </label>
                    <div className="relative">
                      <input
                        id="check-out"
                        type="date"
                        value={checkOutDate}
                        onChange={(e) => setCheckOutDate(e.target.value)}
                        className="w-full px-4 py-3 pl-10 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all duration-200"
                        required
                      />
                      <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                    </div>
                  </div>
                </div>

                <div className="mb-4">
                  <label htmlFor="full-name" className="block text-sm font-medium text-gray-700 mb-1">
                    Full Name *
                  </label>
                  <input
                    id="full-name"
                    type="text"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all duration-200"
                    placeholder="Enter your Full Name"
                    required
                  />
                </div>

                <div className="mb-4">
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                    Email*
                  </label>
                  <input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all duration-200"
                    placeholder="Enter your Email"
                    required
                  />
                </div>

                <div>
                  <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">
                    Phone Number*
                  </label>
                  <input
                    id="phone"
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all duration-200"
                    placeholder="Enter your Phone Number"
                    required
                  />
                </div>
              </div>

              <div className="bg-white p-6 rounded-xl shadow-md border">
                <h2 className="text-xl font-bold mb-4">Payment Method</h2>

                <div className="space-y-3">
                  <label
                    className={`flex items-center justify-between p-4 border rounded-lg cursor-pointer transition-all duration-200 ${paymentMethod === "flutterwave" ? "border-primary bg-primary-50" : "border-gray-300 hover:bg-gray-50"}`}
                  >
                    <div className="flex items-center">
                      <input
                        type="radio"
                        name="payment"
                        value="flutterwave"
                        checked={paymentMethod === "flutterwave"}
                        onChange={() => setPaymentMethod("flutterwave")}
                        className="h-4 w-4 text-primary focus:ring-primary border-gray-300"
                      />
                      <div className="ml-3">
                        <span className="block text-sm font-medium">Flutterwave</span>
                        <span className="text-xs text-gray-500">Pay securely with credit/debit card</span>
                      </div>
                    </div>
                    <img src="/placeholder.svg?height=30&width=80" alt="Flutterwave" className="h-8" />
                  </label>
                </div>
              </div>
            </motion.div>

            {/* Right Column - Booking Details */}
            <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.2 }}>
              <div className="bg-white p-6 rounded-xl shadow-md border sticky top-24">
                <h2 className="text-xl font-bold mb-4">Booking Details</h2>

                {property && (
                  <>
                    <div className="mb-4 overflow-hidden rounded-lg">
                      <img
                        src={property.main_image_url || "/placeholder.svg?height=300&width=400"}
                        alt={property.title}
                        className="w-full h-48 object-cover hover:scale-105 transition-transform duration-500"
                      />
                    </div>

                    <h3 className="text-lg font-bold">{property.title}</h3>
                    <p className="text-gray-500 mb-6">{property.address || property.location}</p>

                    <div className="border-t pt-4">
                      <h4 className="font-bold mb-2">Price</h4>
                      <div className="flex justify-between mb-2">
                        <span>
                          {formatPrice(Number(property.price))} x {nights} Night
                          {nights > 1 ? "s" : ""}
                        </span>
                        <span>{formatPrice(basePrice)}</span>
                      </div>
                      <div className="flex justify-between mb-4">
                        <span>Tax (20%)</span>
                        <span>{formatPrice(tax)}</span>
                      </div>
                      <div className="flex justify-between font-bold border-t pt-2">
                        <span>Total</span>
                        <span>{formatPrice(total)}</span>
                      </div>
                    </div>

                    <AnimatePresence>
                      {bookingSuccess ? (
                        <motion.div
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          className="mt-6 p-4 bg-green-50 border border-green-200 rounded-lg flex items-start gap-3"
                        >
                          <Check className="h-5 w-5 text-green-500 mt-0.5" />
                          <div>
                            <p className="font-medium text-green-800">Booking Successful!</p>
                            <p className="text-sm text-green-700">Redirecting to payment page...</p>
                          </div>
                        </motion.div>
                      ) : bookingError ? (
                        <motion.div
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          className="mt-6 p-4 bg-red-50 border border-red-200 rounded-lg"
                        >
                          <p className="text-red-700">{bookingError}</p>
                        </motion.div>
                      ) : (
                        <motion.button
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                          onClick={handlePayNow}
                          disabled={isSubmitting || !checkInDate || !checkOutDate}
                          className="w-full bg-primary hover:bg-primary-600 text-white py-3 px-4 rounded-lg font-medium transition-all duration-300 mt-6 disabled:opacity-70 disabled:cursor-not-allowed"
                        >
                          {isSubmitting ? (
                            <div className="flex items-center justify-center">
                              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                              Processing...
                            </div>
                          ) : (
                            "Pay Now"
                          )}
                        </motion.button>
                      )}
                    </AnimatePresence>

                    <div className="mt-6 flex items-start gap-2 text-sm text-gray-600">
                      <Info className="h-5 w-5 text-amber-500 flex-shrink-0 mt-0.5" />
                      <p>
                        <span className="font-medium">Cancellation Policy:</span> Free cancellation before 1:00 PM on
                        the day of check-in for a partial refund.
                      </p>
                    </div>
                  </>
                )}
              </div>
            </motion.div>
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

