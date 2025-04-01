"use client"

import { useState, useEffect } from "react"
import { Navigation } from "@/components/navigation"
import { Footer } from "@/components/footer"
import { useAuth } from "@/contexts/auth-context"
import { useRouter } from "next/navigation"
import { LoginModal } from "@/components/login-modal"
import { SignupModal } from "@/components/signup-modal"
import { Calendar, MapPin, Clock, AlertCircle } from "lucide-react"
import Link from "next/link"
import { bookingsService, type Booking } from "@/services/bookings"
import { motion } from "framer-motion"

export default function BookingsPage() {
  const { user, isLoading: isAuthLoading } = useAuth()
  const router = useRouter()
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false)
  const [isSignupModalOpen, setIsSignupModalOpen] = useState(false)
  const [activeFilter, setActiveFilter] = useState("all")
  const [bookings, setBookings] = useState<Booking[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    // Redirect if not logged in
    if (!isAuthLoading && !user) {
      setIsLoginModalOpen(true)
      return
    }

    if (user) {
      fetchBookings()
    }
  }, [user, isAuthLoading])

  const fetchBookings = async () => {
    setIsLoading(true)
    setError(null)
    try {
      const data = await bookingsService.getBookings()
      setBookings(data)
    } catch (err) {
      console.error("Failed to fetch bookings:", err)
      setError("Failed to load bookings. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  // Filter bookings based on active filter
  const filteredBookings = bookings.filter((booking) => {
    if (activeFilter === "all") return true
    return booking.status.toLowerCase() === activeFilter.toLowerCase()
  })

  // Format date
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    })
  }

  // Calculate nights between dates
  const calculateNights = (checkIn: string, checkOut: string) => {
    const start = new Date(checkIn)
    const end = new Date(checkOut)
    const diffTime = Math.abs(end.getTime() - start.getTime())
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    return diffDays
  }

  // Format price
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

  const handleCancelBooking = async (bookingId: number) => {
    try {
      await bookingsService.cancelBooking(bookingId)
      fetchBookings() // Refresh bookings after cancellation
    } catch (err) {
      console.error("Failed to cancel booking:", err)
    }
  }

  return (
    <>
      <Navigation />

      <main className="py-8 bg-gray-50">
        <div className="container mx-auto px-4 max-w-6xl">
          <motion.h1
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-3xl font-bold mb-8"
          >
            My Bookings
          </motion.h1>

          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white rounded-xl shadow-md overflow-hidden mb-8"
          >
            <div className="flex overflow-x-auto">
              <button
                onClick={() => setActiveFilter("all")}
                className={`px-6 py-3 font-medium text-sm whitespace-nowrap transition-colors ${
                  activeFilter === "all"
                    ? "border-b-2 border-primary text-primary"
                    : "text-gray-500 hover:text-gray-700"
                }`}
              >
                All
              </button>
              <button
                onClick={() => setActiveFilter("confirmed")}
                className={`px-6 py-3 font-medium text-sm whitespace-nowrap transition-colors ${
                  activeFilter === "confirmed"
                    ? "border-b-2 border-primary text-primary"
                    : "text-gray-500 hover:text-gray-700"
                }`}
              >
                Upcoming
              </button>
              <button
                onClick={() => setActiveFilter("completed")}
                className={`px-6 py-3 font-medium text-sm whitespace-nowrap transition-colors ${
                  activeFilter === "completed"
                    ? "border-b-2 border-primary text-primary"
                    : "text-gray-500 hover:text-gray-700"
                }`}
              >
                Completed
              </button>
              <button
                onClick={() => setActiveFilter("cancelled")}
                className={`px-6 py-3 font-medium text-sm whitespace-nowrap transition-colors ${
                  activeFilter === "cancelled" || activeFilter === "canceled"
                    ? "border-b-2 border-primary text-primary"
                    : "text-gray-500 hover:text-gray-700"
                }`}
              >
                Canceled
              </button>
            </div>
          </motion.div>

          {isLoading ? (
            <div className="flex justify-center py-12">
              <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
              <p className="ml-4 text-gray-500">Loading your bookings...</p>
            </div>
          ) : error ? (
            <div className="bg-white rounded-xl shadow-md p-8 text-center">
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <AlertCircle className="h-8 w-8 text-red-500" />
              </div>
              <p className="text-red-500 mb-4">{error}</p>
              <button
                onClick={fetchBookings}
                className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-600 transition-colors"
              >
                Try Again
              </button>
            </div>
          ) : filteredBookings.length === 0 ? (
            <div className="text-center py-12 bg-white rounded-xl shadow-md">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Calendar className="h-8 w-8 text-gray-400" />
              </div>
              <h2 className="text-xl font-semibold mb-2">No bookings found</h2>
              <p className="text-gray-500 mb-6">
                You don't have any {activeFilter !== "all" ? activeFilter : ""} bookings yet.
              </p>
              <Link
                href="/properties"
                className="px-5 py-2 bg-primary text-white rounded-lg font-medium hover:bg-primary-600 transition-colors inline-block"
              >
                Browse Properties
              </Link>
            </div>
          ) : (
            <div className="space-y-6">
              {filteredBookings.map((booking, index) => (
                <motion.div
                  key={booking.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-lg transition-shadow"
                >
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="md:col-span-1">
                      <img
                        src={booking.property_detail?.main_image_url || "/placeholder.svg?height=300&width=400"}
                        alt={booking.property_detail?.title || "Property"}
                        className="w-full h-48 object-cover"
                      />
                    </div>
                    <div className="p-6 md:col-span-2">
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <h2 className="text-xl font-bold">{booking.property_detail?.title || "Unknown Property"}</h2>
                          <div className="flex items-center text-gray-500 text-sm mt-1">
                            <MapPin className="h-4 w-4 mr-1" />
                            <span>{booking.property_detail?.location || "Unknown Location"}</span>
                          </div>
                        </div>
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-medium ${
                            booking.status === "completed"
                              ? "bg-green-100 text-green-800"
                              : booking.status === "cancelled" || booking.status === "canceled"
                                ? "bg-red-100 text-red-800"
                                : booking.status === "confirmed"
                                  ? "bg-blue-100 text-blue-800"
                                  : "bg-yellow-100 text-yellow-800"
                          }`}
                        >
                          {booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}
                        </span>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                        <div>
                          <div className="flex items-center mb-2">
                            <Calendar className="h-4 w-4 text-primary mr-2" />
                            <span className="text-sm font-medium">Check In</span>
                          </div>
                          <p>{formatDate(booking.check_in_date)}</p>
                        </div>
                        <div>
                          <div className="flex items-center mb-2">
                            <Calendar className="h-4 w-4 text-primary mr-2" />
                            <span className="text-sm font-medium">Check Out</span>
                          </div>
                          <p>{formatDate(booking.check_out_date)}</p>
                        </div>
                      </div>

                      <div className="flex items-center mt-4">
                        <Clock className="h-4 w-4 text-primary mr-2" />
                        <span className="text-sm font-medium">
                          {calculateNights(booking.check_in_date, booking.check_out_date)} Nights
                        </span>
                      </div>

                      <div className="flex justify-between items-center mt-6 pt-4 border-t">
                        <div>
                          <p className="text-sm text-gray-500">Total Price</p>
                          <p className="text-xl font-bold text-primary">{formatPrice(booking.total_price)}</p>
                        </div>
                        <div className="space-x-2">
                          <Link
                            href={`/properties/${booking.property}`}
                            className="px-4 py-2 border border-primary text-primary rounded-lg text-sm font-medium hover:bg-primary-50 transition-colors"
                          >
                            View Property
                          </Link>
                          {(booking.status === "pending" || booking.status === "confirmed") && (
                            <button
                              onClick={() => handleCancelBooking(booking.id)}
                              className="px-4 py-2 bg-red-500 text-white rounded-lg text-sm font-medium hover:bg-red-600 transition-colors"
                            >
                              Cancel Booking
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
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
