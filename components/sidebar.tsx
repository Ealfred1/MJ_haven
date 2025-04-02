"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { useAuth } from "@/contexts/auth-context"
import { useNotifications } from "@/contexts/notifications-context"
import { Home, Building, Bell, Calendar, Heart, Settings, LogOut, User, ChevronRight, Menu, X } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

export function Sidebar() {
  const { user, logout } = useAuth()
  const { unreadCount } = useNotifications()
  const pathname = usePathname()
  const { toast } = useToast()
  const [isOpen, setIsOpen] = useState(true) // Set to true by default
  const [isMobile, setIsMobile] = useState(false)

  // Check if mobile on mount and on resize
  useEffect(() => {
    const checkIfMobile = () => {
      setIsMobile(window.innerWidth < 1024)
      // Close sidebar by default on mobile
      if (window.innerWidth < 1024) {
        setIsOpen(false)
      } else {
        setIsOpen(true) // Always open on desktop
      }
    }

    checkIfMobile()
    window.addEventListener("resize", checkIfMobile)

    return () => {
      window.removeEventListener("resize", checkIfMobile)
    }
  }, [])

  // Handle logout
  const handleLogout = () => {
    logout()
    toast({
      title: "Logged out",
      description: "You have been successfully logged out",
    })
    setIsOpen(false)
  }

  // If no user, don't render sidebar
  if (!user) return null

  const navItems = [
    { name: "Home", icon: Home, href: "/" },
    { name: "Properties", icon: Building, href: "/properties" },
    {
      name: "Notifications",
      icon: Bell,
      href: "/notifications",
      badge: unreadCount > 0 ? unreadCount : undefined,
    },
    { name: "Bookings", icon: Calendar, href: "/bookings" },
    { name: "Favorites", icon: Heart, href: "/profile?tab=saved" },
    { name: "Profile", icon: User, href: "/profile" },
    { name: "Settings", icon: Settings, href: "/settings" },
  ]

  return (
    <>
      {/* Backdrop for mobile */}
      {isOpen && isMobile && <div className="fixed inset-0 bg-black/50 z-40" onClick={() => setIsOpen(false)} />}

      {/* Sidebar */}
      <div
        className={`fixed top-0 left-0 h-full w-[280px] bg-white/90 backdrop-blur-lg border-r border-gray-200 z-50 flex flex-col transition-transform duration-300 ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        {/* Toggle button */}
        <button
          className="absolute right-[1] top-4 bg-white rounded-full p-2 shadow-md lg:hidden"
          onClick={() => setIsOpen(!isOpen)}
        >
          {isOpen ? <X className="h-5 w-5 text-gray-600" /> : <ChevronRight className="h-5 w-5 text-gray-600" />}
        </button>

        {/* User profile */}
        <div className="p-6 border-b border-gray-100">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center overflow-hidden">
              {user.profileImage ? (
                <img
                  src={user.profileImage || "/placeholder.svg"}
                  alt={user.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <span className="text-primary text-lg font-semibold">{user.name.charAt(0)}</span>
              )}
            </div>
            <div>
              <h3 className="font-semibold text-gray-900">{user.name}</h3>
              <p className="text-sm text-gray-500">{user.email}</p>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 py-6 px-3 overflow-y-auto">
          <ul className="space-y-1">
            {navItems.map((item) => {
              const isActive = pathname === item.href || (item.href !== "/" && pathname?.startsWith(item.href))

              return (
                <li key={item.name}>
                  <Link
                    href={item.href}
                    className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 group ${
                      isActive ? "bg-primary text-white" : "text-gray-700 hover:bg-gray-100"
                    }`}
                    onClick={() => isMobile && setIsOpen(false)}
                  >
                    <item.icon
                      className={`h-5 w-5 ${isActive ? "text-white" : "text-gray-500 group-hover:text-primary"}`}
                    />
                    <span>{item.name}</span>

                    {item.badge !== undefined && (
                      <span
                        className={`ml-auto px-2 py-0.5 text-xs rounded-full ${
                          isActive ? "bg-white text-primary" : "bg-red-500 text-white"
                        }`}
                      >
                        {item.badge > 9 ? "9+" : item.badge}
                      </span>
                    )}
                  </Link>
                </li>
              )
            })}
          </ul>
        </nav>

        {/* Logout button */}
        <div className="p-4 border-t border-gray-100">
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 px-4 py-3 w-full rounded-lg text-red-600 hover:bg-red-50 transition-colors"
          >
            <LogOut className="h-5 w-5" />
            <span>Logout</span>
          </button>
        </div>
      </div>

      {/* Mobile toggle button when sidebar is closed */}
      {!isOpen && isMobile && (
        <button
          className="fixed bottom-6 left-6 z-40 bg-primary hidden text-white p-3 rounded-full shadow-lg"
          onClick={() => setIsOpen(true)}
        >
          <Menu className="h-6 w-6" />
        </button>
      )}
    </>
  )
}

