"use client"

import { useState, useEffect } from "react"
import { Navigation } from "@/components/navigation"
import { Footer } from "@/components/footer"
import { useNotifications } from "@/contexts/notifications-context"
import { useAuth } from "@/contexts/auth-context"
import { useRouter } from "next/navigation"
import { LoginModal } from "@/components/login-modal"
import { SignupModal } from "@/components/signup-modal"
import { X, Bell, CheckCircle } from "lucide-react"
import { format, formatDistanceToNow } from "date-fns"

export default function NotificationsPage() {
  const { notifications, isLoading, error, markAsRead, markAllAsRead, refreshNotifications } = useNotifications()
  const { user } = useAuth()
  const router = useRouter()
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false)
  const [isSignupModalOpen, setIsSignupModalOpen] = useState(false)

  useEffect(() => {
    // Redirect if not logged in
    if (!user && !isLoading) {
      setIsLoginModalOpen(true)
    } else {
      // Refresh notifications when the page loads
      refreshNotifications()
    }
  }, [user, isLoading, refreshNotifications])

  const handleDismiss = async (id: number) => {
    await markAsRead(id)
  }

  const handleMarkAllAsRead = async () => {
    await markAllAsRead()
  }

  // Format date for display
  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()

    // If it's today, show relative time (e.g., "2 hours ago")
    if (date.toDateString() === now.toDateString()) {
      return formatDistanceToNow(date, { addSuffix: true })
    }

    // If it's within the last week, show day of week
    const oneWeekAgo = new Date()
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7)
    if (date > oneWeekAgo) {
      return format(date, "EEEE")
    }

    // Otherwise, show full date
    return format(date, "MMMM d, yyyy")
  }

  return (
    <>
      <Navigation />

      <main className="py-8">
        <div className="container mx-auto px-4">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-3xl font-bold">Notifications</h1>

            {notifications.length > 0 && (
              <button onClick={handleMarkAllAsRead} className="text-primary hover:text-primary-600 text-sm font-medium">
                Mark all as read
              </button>
            )}
          </div>

          {isLoading ? (
            <div className="bg-white rounded-lg shadow-md p-8 text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
              <p className="mt-4 text-gray-500">Loading notifications...</p>
            </div>
          ) : error ? (
            <div className="bg-white rounded-lg shadow-md p-8 text-center">
              <p className="text-red-500">{error}</p>
              <button onClick={refreshNotifications} className="mt-4 text-primary hover:text-primary-600">
                Try again
              </button>
            </div>
          ) : notifications.length === 0 ? (
            <div className="bg-white rounded-lg shadow-md p-8 text-center">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Bell className="h-8 w-8 text-gray-400" />
              </div>
              <h2 className="text-xl font-semibold mb-2">No notifications yet</h2>
              <p className="text-gray-500">We'll notify you when there are updates on your bookings or account.</p>
            </div>
          ) : (
            <div className="bg-white rounded-lg shadow-md overflow-hidden">
              <ul className="divide-y">
                {notifications.map((notification) => (
                  <li
                    key={notification.id}
                    className={`p-4 relative ${notification.is_read ? "bg-white" : "bg-primary-100"}`}
                  >
                    <div className="flex items-start gap-4">
                      <div className="flex-shrink-0">
                        <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center text-white">
                          <Bell className="h-5 w-5" />
                        </div>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium">{notification.title}</p>
                        <p className="text-gray-600 mt-1">{notification.message}</p>
                        <p className="text-gray-400 text-sm mt-2">{formatDate(notification.created_at)}</p>
                      </div>
                      <button
                        onClick={() => handleDismiss(notification.id)}
                        className="text-gray-400 hover:text-gray-600"
                        aria-label="Dismiss notification"
                      >
                        {notification.is_read ? (
                          <CheckCircle className="h-5 w-5 text-green-500" />
                        ) : (
                          <X className="h-5 w-5" />
                        )}
                      </button>
                    </div>
                  </li>
                ))}
              </ul>
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

