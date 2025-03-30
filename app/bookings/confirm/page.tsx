"use client"

import { useState, useEffect } from "react"
import { Navigation } from "@/components/navigation"
import { Footer } from "@/components/footer"
import { useSearchParams, useRouter } from "next/navigation"
import { useAuth } from "@/contexts/auth-context"
import { LoginModal } from "@/components/login-modal"
import { SignupModal } from "@/components/signup-modal"
import { useToast } from "@/hooks/use-toast"
import { Calendar, Info } from "lucide-react"
import Link from "next/link"

const properties = [
  {
    id: "1",
    title: "2 Bedroom Room",
    price: 200095,
    address: "2699 Lekki Phase 1",
    area: "Lagos Island",
    city: "LG",
    imageUrl: "/placeholder.svg?height=300&width=400",
  },
  {
    id: "2",
    title: "1 Bedroom Apartment",
    price: 150000,
    address: "123 Victoria Island",
    area: "Lagos",
    city: "Lagos",
    imageUrl: "/placeholder.svg?height=300&width=400",
  },
  {
    id: "3",
    title: "3 Bedroom Flat",
    price: 300000,
    address: "45 Ikoyi",
    area: "Lagos",
    city: "Lagos",
    imageUrl: "/placeholder.svg?height=300&width=400",
  },
]

export default function BookingConfirmationPage() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const { user } = useAuth()
  const { toast } = useToast()
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false)
  const [isSignupModalOpen, setIsSignupModalOpen] = useState(false)
  const [property, setProperty] = useState<any>(null)
  const [nights, setNights] = useState(3)
  const [checkInDate, setCheckInDate] = useState("")
  const [checkOutDate, setCheckOutDate] = useState("")
  const [fullName, setFullName] = useState("")
  const [email, setEmail] = useState("")
  const [phone, setPhone] = useState("")
  const [paymentMethod, setPaymentMethod] = useState("flutterwave")
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    // Check if user is logged in
    if (!user) {
      setIsLoginModalOpen(true)
    } else {
      setFullName(user.name)
      setEmail(user.email)
      setPhone(user.phone || "")
    }

    // Get property ID from URL
    const propertyId = searchParams.get("propertyId")
    if (propertyId) {
      const foundProperty = properties.find((p) => p.id === propertyId)
      if (foundProperty) {
        setProperty(foundProperty)
      } else {
        router.push("/properties")
      }
    } else {
      router.push("/properties")
    }

    // Get nights from URL
    const nightsParam = searchParams.get("nights")
    if (nightsParam) {
      setNights(Number.parseInt(nightsParam))
    }
  }, [searchParams, router, user])

  const handlePayNow = () => {
    if (!checkInDate || !checkOutDate || !fullName || !email || !phone) {
      toast({
        title: "Error",
        description: "Please fill in all required fields",
        variant: "destructive",
      })
      return
    }

    setIsLoading(true)

    // Simulate payment processing
    setTimeout(() => {
      setIsLoading(false)
      toast({
        title: "Success",
        description: "Your booking has been confirmed!",
      })
      router.push("/profile")
    }, 2000)
  }

  // Calculate total price
  const totalPrice = property ? property.price * nights : 0
  const tax = Math.round(totalPrice * 0.02) // 2% tax
  const grandTotal = totalPrice + tax

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

  return (
    <>
      <Navigation />

      <main className="py-8">
        <div className="container mx-auto px-4">
          <div className="mb-6">
            <div className="flex items-center text-sm text-gray-500 mb-4">
              <Link href="/properties" className="hover:text-primary">
                Properties Details
              </Link>
              <span className="mx-2">/</span>
              <span>Bookings</span>
            </div>
            <h1 className="text-3xl font-bold">Confirm your bookings</h1>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Left Column - User Details */}
            <div>
              <div className="bg-white p-6 rounded-lg shadow-md border mb-6">
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
                        className="w-full px-4 py-2 pl-10 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
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
                        className="w-full px-4 py-2 pl-10 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
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
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                    placeholder="Enter your Full Name"
                    required
                  />
                  <p className="text-xs text-gray-500 mt-1">Helper text</p>
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
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                    placeholder="Enter your Email"
                    required
                  />
                  <p className="text-xs text-gray-500 mt-1">Helper text</p>
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
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                    placeholder="Enter your Phone Number"
                    required
                  />
                  <p className="text-xs text-gray-500 mt-1">Helper text</p>
                </div>
              </div>

              <div className="bg-white p-6 rounded-lg shadow-md border">
                <h2 className="text-xl font-bold mb-4">Payment Method</h2>

                <div className="space-y-3">
                  <label className="flex items-center justify-between p-3 border rounded-md cursor-pointer">
                    <div className="flex items-center">
                      <input
                        type="radio"
                        name="payment"
                        value="paystack"
                        checked={paymentMethod === "paystack"}
                        onChange={() => setPaymentMethod("paystack")}
                        className="h-4 w-4 text-primary focus:ring-primary border-gray-300"
                      />
                      <div className="ml-3">
                        <span className="block text-sm font-medium">Paystack</span>
                      </div>
                    </div>
                    <img src="/placeholder.svg?height=30&width=80" alt="Paystack" className="h-8" />
                  </label>

                  <label className="flex items-center justify-between p-3 border rounded-md cursor-pointer">
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
                      </div>
                    </div>
                    <img src="/placeholder.svg?height=30&width=80" alt="Flutterwave" className="h-8" />
                  </label>
                </div>
              </div>
            </div>

            {/* Right Column - Booking Details */}
            <div>
              <div className="bg-white p-6 rounded-lg shadow-md border sticky top-24">
                <h2 className="text-xl font-bold mb-4">Booking Details</h2>

                {property && (
                  <>
                    <div className="mb-4">
                      <img
                        src={property.imageUrl || "/placeholder.svg"}
                        alt={property.title}
                        className="w-full h-48 object-cover rounded-lg"
                      />
                    </div>

                    <h3 className="text-lg font-bold">{property.title}</h3>
                    <p className="text-gray-500 mb-6">
                      {property.address}, {property.area}, {property.city}
                    </p>

                    <div className="border-t pt-4">
                      <h4 className="font-bold mb-2">Price</h4>
                      <div className="flex justify-between mb-2">
                        <span>
                          {formatPrice(property.price)} x {nights} Night
                          {nights > 1 ? "s" : ""}
                        </span>
                        <span>{formatPrice(totalPrice)}</span>
                      </div>
                      <div className="flex justify-between mb-4">
                        <span>Tax(2%)</span>
                        <span>{formatPrice(tax)}</span>
                      </div>
                      <div className="flex justify-between font-bold border-t pt-2">
                        <span>Total</span>
                        <span>{formatPrice(grandTotal)}</span>
                      </div>
                    </div>

                    <button
                      onClick={handlePayNow}
                      disabled={isLoading}
                      className="w-full bg-primary hover:bg-primary-600 text-white py-3 px-4 rounded-md transition-colors mt-6 disabled:opacity-70"
                    >
                      {isLoading ? "Processing..." : "Pay Now"}
                    </button>

                    <div className="mt-6 flex items-start gap-2 text-sm text-gray-600">
                      <Info className="h-5 w-5 text-amber-500 flex-shrink-0 mt-0.5" />
                      <p>
                        <span className="font-medium">Cancellation Policy:</span> Free cancellation before 1:00 PM on
                        the any shortlet for a partial refund.
                      </p>
                    </div>
                  </>
                )}
              </div>
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

