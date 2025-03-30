"use client"

import { useState, useEffect } from "react"
import { Navigation } from "@/components/navigation"
import { Footer } from "@/components/footer"
import { useAuth } from "@/contexts/auth-context"
import { useRouter } from "next/navigation"
import { useToast } from "@/hooks/use-toast"
import { PropertyCard } from "@/components/property-card"
import { Pencil, Phone } from "lucide-react"

// Sample saved properties data
const savedProperties = [
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
    popular: false,
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
    popular: false,
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
    popular: false,
  },
]

// Sample transaction history
const transactions = [
  {
    id: "tx1",
    date: "2023-05-15",
    property: "2 Bedroom Room",
    amount: 200095,
    status: "Completed",
  },
  {
    id: "tx2",
    date: "2023-04-22",
    property: "1 Bedroom Apartment",
    amount: 150000,
    status: "Completed",
  },
  {
    id: "tx3",
    date: "2023-03-10",
    property: "3 Bedroom Flat",
    amount: 300000,
    status: "Canceled",
  },
]

export default function ProfilePage() {
  const { user, isLoading, updateProfile } = useAuth()
  const router = useRouter()
  const { toast } = useToast()
  const [activeTab, setActiveTab] = useState("saved")
  const [isEditMode, setIsEditMode] = useState(false)
  const [name, setName] = useState("")
  const [phone, setPhone] = useState("")
  const [email, setEmail] = useState("")
  const [isUpdating, setIsUpdating] = useState(false)

  useEffect(() => {
    // Redirect if not logged in
    if (!isLoading && !user) {
      router.push("/")
    } else if (user) {
      setName(user.name)
      setEmail(user.email)
      setPhone(user.phone || "")
    }
  }, [user, isLoading, router])

  const handleUpdateProfile = async () => {
    if (!name || !email) {
      toast({
        title: "Error",
        description: "Name and email are required",
        variant: "destructive",
      })
      return
    }

    setIsUpdating(true)
    const success = await updateProfile({ name, email, phone })
    setIsUpdating(false)

    if (success) {
      setIsEditMode(false)
      toast({
        title: "Success",
        description: "Your profile has been updated",
      })
    } else {
      toast({
        title: "Error",
        description: "Failed to update profile",
        variant: "destructive",
      })
    }
  }

  if (isLoading || !user) {
    return (
      <>
        <Navigation />
        <div className="container mx-auto px-4 py-16 text-center">Loading...</div>
        <Footer />
      </>
    )
  }

  return (
    <>
      <Navigation />

      <main className="py-8">
        <div className="container mx-auto px-4">
          <div className="bg-white rounded-lg shadow-md overflow-hidden mb-8">
            <div className="p-6">
              <div className="flex flex-col md:flex-row items-center md:items-start gap-6">
                <div className="w-24 h-24 rounded-full bg-primary text-white flex items-center justify-center text-3xl font-bold">
                  {user.profileImage ? (
                    <img
                      src={user.profileImage || "/placeholder.svg"}
                      alt={user.name}
                      className="w-full h-full object-cover rounded-full"
                    />
                  ) : (
                    user.name.charAt(0)
                  )}
                </div>

                <div className="flex-1">
                  {isEditMode ? (
                    <div className="space-y-4">
                      <div>
                        <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                          Full Name
                        </label>
                        <input
                          id="name"
                          type="text"
                          value={name}
                          onChange={(e) => setName(e.target.value)}
                          className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                        />
                      </div>

                      <div>
                        <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                          Email
                        </label>
                        <input
                          id="email"
                          type="email"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                        />
                      </div>

                      <div>
                        <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">
                          Phone Number
                        </label>
                        <input
                          id="phone"
                          type="tel"
                          value={phone}
                          onChange={(e) => setPhone(e.target.value)}
                          className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                        />
                      </div>

                      <div className="flex gap-2">
                        <button
                          onClick={handleUpdateProfile}
                          disabled={isUpdating}
                          className="px-4 py-2 bg-primary text-white rounded-md"
                        >
                          {isUpdating ? "Saving..." : "Save Changes"}
                        </button>
                        <button
                          onClick={() => {
                            setIsEditMode(false)
                            setName(user.name)
                            setEmail(user.email)
                            setPhone(user.phone || "")
                          }}
                          className="px-4 py-2 border border-gray-300 rounded-md"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  ) : (
                    <>
                      <div className="flex justify-between items-start">
                        <div>
                          <h1 className="text-2xl font-bold">{user.name}</h1>
                          <div className="flex items-center text-gray-500 mt-1">
                            <Phone className="h-4 w-4 mr-1" />
                            <span>{user.phone || "+234 7087654234"}</span>
                          </div>
                        </div>
                        <button
                          onClick={() => setIsEditMode(true)}
                          className="px-3 py-1 border border-gray-300 rounded-md text-sm flex items-center gap-1"
                        >
                          <Pencil className="h-3 w-3" />
                          Edit Profile
                        </button>
                      </div>
                    </>
                  )}
                </div>
              </div>
            </div>

            <div className="border-t">
              <div className="flex overflow-x-auto">
                <button
                  onClick={() => setActiveTab("saved")}
                  className={`px-6 py-3 font-medium text-sm whitespace-nowrap ${
                    activeTab === "saved"
                      ? "border-b-2 border-primary text-primary"
                      : "text-gray-500 hover:text-gray-700"
                  }`}
                >
                  Saved Properties
                </button>
                <button
                  onClick={() => setActiveTab("transactions")}
                  className={`px-6 py-3 font-medium text-sm whitespace-nowrap ${
                    activeTab === "transactions"
                      ? "border-b-2 border-primary text-primary"
                      : "text-gray-500 hover:text-gray-700"
                  }`}
                >
                  Transaction History
                </button>
                <button
                  onClick={() => setActiveTab("activities")}
                  className={`px-6 py-3 font-medium text-sm whitespace-nowrap ${
                    activeTab === "activities"
                      ? "border-b-2 border-primary text-primary"
                      : "text-gray-500 hover:text-gray-700"
                  }`}
                >
                  Activities
                </button>
              </div>
            </div>
          </div>

          <div>
            {activeTab === "saved" && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {savedProperties.map((property) => (
                  <PropertyCard key={property.id} {...property} />
                ))}
              </div>
            )}

            {activeTab === "transactions" && (
              <div className="bg-white rounded-lg shadow-md overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Date
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Property
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Amount
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Status
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {transactions.map((transaction) => (
                        <tr key={transaction.id}>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {new Date(transaction.date).toLocaleDateString()}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                            {transaction.property}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {new Intl.NumberFormat("en-NG", {
                              style: "currency",
                              currency: "NGN",
                              maximumFractionDigits: 0,
                            })
                              .format(transaction.amount)
                              .replace("NGN", "₦")}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm">
                            <span
                              className={`px-2 py-1 rounded-full text-xs ${
                                transaction.status === "Completed"
                                  ? "bg-green-100 text-green-800"
                                  : transaction.status === "Canceled"
                                    ? "bg-red-100 text-red-800"
                                    : "bg-yellow-100 text-yellow-800"
                              }`}
                            >
                              {transaction.status}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {activeTab === "activities" && (
              <div className="bg-white rounded-lg shadow-md p-6">
                <div className="space-y-4">
                  <div className="flex items-start gap-3 p-4 border rounded-lg">
                    <div className="w-2 h-2 rounded-full bg-green-500 mt-2"></div>
                    <div>
                      <p className="font-medium">Booking Confirmed</p>
                      <p className="text-sm text-gray-500">
                        Your booking for 2 Bedroom Room has been confirmed. Check-in date: May 15, 2023
                      </p>
                      <p className="text-xs text-gray-400 mt-1">2 days ago</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3 p-4 border rounded-lg">
                    <div className="w-2 h-2 rounded-full bg-blue-500 mt-2"></div>
                    <div>
                      <p className="font-medium">Payment Successful</p>
                      <p className="text-sm text-gray-500">
                        Your payment of ₦200,095 for 2 Bedroom Room has been processed successfully.
                      </p>
                      <p className="text-xs text-gray-400 mt-1">2 days ago</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3 p-4 border rounded-lg">
                    <div className="w-2 h-2 rounded-full bg-yellow-500 mt-2"></div>
                    <div>
                      <p className="font-medium">Property Viewed</p>
                      <p className="text-sm text-gray-500">You viewed 3 Bedroom Flat property details.</p>
                      <p className="text-xs text-gray-400 mt-1">5 days ago</p>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>

      <Footer />
    </>
  )
}

