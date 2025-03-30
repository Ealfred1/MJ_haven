"use client"

import { useState, useEffect } from "react"
import { Navigation } from "@/components/navigation"
import { Footer } from "@/components/footer"
import { useAuth } from "@/contexts/auth-context"
import { useRouter } from "next/navigation"
import { LoginModal } from "@/components/login-modal"
import { SignupModal } from "@/components/signup-modal"
import { Calendar, MapPin, Clock } from "lucide-react"
import Link from "next/link"

// Sample bookings data
const bookings = [
  {
    id: "b1",
    propertyId: "1",
    propertyTitle: "2 Bedroom Room",
    propertyAddress: "2699 Lekki Phase 1, Lagos Island, LG",
    propertyImage: "/placeholder.svg?height=300&width=400",
    checkIn: "2023-05-15",
    checkOut: "2023-05-18",
    price: 200095,
    nights: 3,
    status: "Completed",
  },
  {
    id: "b2",
    propertyId: "2",
    propertyTitle: "1 Bedroom Apartment",
    propertyAddress: "123 Victoria Island, Lagos",
    propertyImage: "/placeholder.svg?height=300&width=400",
    checkIn: "2023-06-10",
    checkOut: "2023-06-12",
    price: 150000,
    nights: 2,
    status: "Upcoming",
  },
  {
    id: "b3",
    propertyId: "3",
    propertyTitle: "3 Bedroom Flat",
    propertyAddress: "45 Ikoyi, Lagos",
    propertyImage: "/placeholder.svg?height=300&width=400",
    checkIn: "2023-04-05",
    checkOut: "2023-04-08",
    price: 300000,
    nights: 3,
    status: "Canceled",
  },
]

export default function BookingsPage() {
  const { user, isLoading } = useAuth()
  const router = useRouter()
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false)
  const [isSignupModalOpen, setIsSignupModalOpen] = useState(false)
  const [activeFilter, setActiveFilter] = useState("all")

  useEffect(() => {
    // Redirect if not logged in
    if (!isLoading && !user) {
      setIsLoginModalOpen(true)
    }
  }, [user, isLoading, router])

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

  return (
    <>
      <Navigation />

      <main className="py-8">
        <div className="container mx-auto px-4">
          <h1 className="text-3xl font-bold mb-8">My Bookings</h1>

          <div className="bg-white rounded-lg shadow-md overflow-hidden mb-8">
            <div className="flex overflow-x-auto">
              <button
                onClick={() => setActiveFilter("all")}
                className={`px-6 py-3 font-medium text-sm whitespace-nowrap ${
                  activeFilter === "all"
                    ? "border-b-2 border-primary text-primary"
                    : "text-gray-500 hover:text-gray-700"
                }`}
              >
                All
              </button>
              <button
                onClick={() => setActiveFilter("upcoming")}
                className={`px-6 py-3 font-medium text-sm whitespace-nowrap ${
                  activeFilter === "upcoming"
                    ? "border-b-2 border-primary text-primary"
                    : "text-gray-500 hover:text-gray-700"
                }`}
              >
                Upcoming
              </button>
              <button
                onClick={() => setActiveFilter("completed")}
                className={`px-6 py-3 font-medium text-sm whitespace-nowrap ${
                  activeFilter === "completed"
                    ? "border-b-2 border-primary text-primary"
                    : "text-gray-500 hover:text-gray-700"
                }`}
              >
                Completed
              </button>
              <button
                onClick={() => setActiveFilter("canceled")}
                className={`px-6 py-3 font-medium text-sm whitespace-nowrap ${
                  activeFilter === "canceled"
                    ? "border-b-2 border-primary text-primary"
                    : "text-gray-500 hover:text-gray-700"
                }`}
              >
                Canceled
              </button>
            </div>
          </div>

          {filteredBookings.length === 0 ? (
            <div className="text-center py-12 bg-white rounded-lg shadow-md">
              <p className="text-lg text-gray-500">No bookings found.</p>
              <Link href="/properties" className="text-primary font-medium mt-2 inline-block">
                Browse properties
              </Link>
            </div>
          ) : (
            <div className="space-y-6">
              {filteredBookings.map((booking) => (
                <div key={booking.id} className="bg-white rounded-lg shadow-md overflow-hidden">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="md:col-span-1">
                      <img
                        src={booking.propertyImage || "/placeholder.svg"}
                        alt={booking.propertyTitle}
                        className="w-full h-48 object-cover"
                      />
                    </div>
                    <div className="p-6 md:col-span-2">
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <h2 className="text-xl font-bold">{booking.propertyTitle}</h2>
                          <div className="flex items-center text-gray-500 text-sm mt-1">
                            <MapPin className="h-4 w-4 mr-1" />
                            <span>{booking.propertyAddress}</span>
                          </div>
                        </div>
                        <span
                          className={`px-3 py-1 rounded-full text-xs ${
                            booking.status === "Completed"
                              ? "bg-green-100 text-green-800"
                              : booking.status === "Canceled"
                                ? "bg-red-100 text-red-800"
                                : "bg-blue-100 text-blue-800"
                          }`}
                        >
                          {booking.status}
                        </span>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                        <div>
                          <div className="flex items-center mb-2">
                            <Calendar className="h-4 w-4 text-primary mr-2" />
                            <span className="text-sm font-medium">Check In</span>
                          </div>
                          <p>{formatDate(booking.checkIn)}</p>
                        </div>
                        <div>
                          <div className="flex items-center mb-2">
                            <Calendar className="h-4 w-4 text-primary mr-2" />
                            <span className="text-sm font-medium">Check Out</span>
                          </div>
                          <p>{formatDate(booking.checkOut)}</p>
                        </div>
                      </div>

                      <div className="flex items-center mt-4">
                        <Clock className="h-4 w-4 text-primary mr-2" />
                        <span className="text-sm font-medium">
                          {booking.nights} {booking.nights === 1 ? "Night" : "Nights"}
                        </span>
                      </div>

                      <div className="flex justify-between items-center mt-6 pt-4 border-t">
                        <div>
                          <p className="text-sm text-gray-500">Total Price</p>
                          <p className="text-xl font-bold text-primary">
                            {new Intl.NumberFormat("en-NG", {
                              style: "currency",
                              currency: "NGN",
                              maximumFractionDigits: 0,
                            })
                              .format(booking.price * booking.nights)
                              .replace("NGN", "₦")}
                          </p>
                        </div>
                        <div className="space-x-2">
                          <Link
                            href={`/properties/${booking.propertyId}`}
                            className="px-4 py-2 border border-primary text-primary rounded-md text-sm"
                          >
                            View Property
                          </Link>
                          {booking.status === "Upcoming" && (
                            <button className="px-4 py-2 bg-red-500 text-white rounded-md text-sm">
                              Cancel Booking
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
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

