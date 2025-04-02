"use client"

import { useState, useRef, useEffect } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { Logo } from "./logo"
import { useAuth } from "@/contexts/auth-context"
import { useNotifications } from "@/contexts/notifications-context"
import { LoginModal } from "./login-modal"
import { SignupModal } from "./signup-modal"
import {
  Menu,
  X,
  Bell,
  ChevronDown,
  LogOut,
  User,
  Home,
  Building,
  Calendar,
  Heart,
  Settings,
  Mail,
  HelpCircle,
} from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { useRouter } from "next/navigation"

export function Navigation() {
  const { user, logout } = useAuth()
  const { unreadCount } = useNotifications()
  const pathname = usePathname()
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false)
  const [isSignupModalOpen, setIsSignupModalOpen] = useState(false)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [isProfileDropdownOpen, setIsProfileDropdownOpen] = useState(false)
  const sidebarRef = useRef<HTMLDivElement>(null)
  const profileDropdownRef = useRef<HTMLDivElement>(null)
  const { toast } = useToast()
  const router = useRouter()
  const [isMobile, setIsMobile] = useState(false)

  // Check if mobile on mount and on resize
  useEffect(() => {
    const checkIfMobile = () => {
      setIsMobile(window.innerWidth < 1024)
    }

    checkIfMobile()
    window.addEventListener("resize", checkIfMobile)

    return () => {
      window.removeEventListener("resize", checkIfMobile)
    }
  }, [])

  // Close sidebar when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (sidebarRef.current && !sidebarRef.current.contains(event.target as Node)) {
        setIsMobileMenuOpen(false)
      }
      if (profileDropdownRef.current && !profileDropdownRef.current.contains(event.target as Node)) {
        setIsProfileDropdownOpen(false)
      }
    }

    document.addEventListener("mousedown", handleClickOutside)
    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
    }
  }, [])

  // Prevent body scroll when sidebar is open
  useEffect(() => {
    if (isMobileMenuOpen) {
      document.body.style.overflow = "hidden"
    } else {
      document.body.style.overflow = "auto"
    }
    return () => {
      document.body.style.overflow = "auto"
    }
  }, [isMobileMenuOpen])

  const handleLogout = () => {
    logout()
    toast({
      title: "Logged out",
      description: "You have been successfully logged out",
    })
    setIsProfileDropdownOpen(false)
    setIsMobileMenuOpen(false)
  }

  // Navigation items for authenticated users
  const navItems = user
    ? [
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
    : []

  return (
    <>
      <header className="bg-white flex h-[96px] sm:h-[96px] border-b border-b-[#F0EFFB] sticky top-0 z-40">
        <div className="container max-w-[1324px] mx-auto px-4 flex items-center justify-between">
          <Logo />

          {/* Desktop Navigation - Only show for non-authenticated users */}
          {!user && (
            <nav className="hidden md:flex items-center space-x-4 lg:space-x-8">
              <Link
                href="/about"
                className="text-[14px] lg:text-[16px] text-[#000929] font-medium hover:text-primary transition-colors"
              >
                About Us
              </Link>
              <Link
                href="/properties"
                className="text-[14px] lg:text-[16px] text-[#000929] font-medium hover:text-primary transition-colors"
              >
                Explore Properties
              </Link>
              <Link
                href="/contact"
                className="text-[14px] lg:text-[16px] text-[#000929] font-medium hover:text-primary transition-colors"
              >
                Contact
              </Link>
              <Link
                href="/faqs"
                className="text-[14px] lg:text-[16px] text-[#000929] font-medium hover:text-primary transition-colors"
              >
                FAQs
              </Link>
            </nav>
          )}

          {/* Desktop Auth Buttons or User Profile */}
          <div className="hidden md:flex items-center space-x-4">
            {user ? (
              <div className="flex items-center gap-4">
                <Link href="/notifications" className="relative">
                  <Bell className="h-5 w-5 text-gray-600" />
                  {unreadCount > 0 && (
                    <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs w-4 h-4 flex items-center justify-center rounded-full">
                      {unreadCount > 9 ? "9+" : unreadCount}
                    </span>
                  )}
                </Link>
                <div className="relative" ref={profileDropdownRef}>
                  <button
                    onClick={() => setIsProfileDropdownOpen(!isProfileDropdownOpen)}
                    className="flex items-center gap-2"
                  >
                    <div className="w-8 h-8 rounded-full bg-primary/10 overflow-hidden flex items-center justify-center text-sm font-medium">
                      {user.profileImage ? (
                        <img
                          src={user.profileImage || "/placeholder.svg"}
                          alt={user.name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <span className="text-primary">{user.name.charAt(0)}</span>
                      )}
                    </div>
                    <ChevronDown className="h-4 w-4" />
                  </button>

                  {isProfileDropdownOpen && (
                    <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-10 border animate-in fade-in-0 zoom-in-95">
                      <Link
                        href="/profile"
                        className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center gap-2"
                        onClick={() => setIsProfileDropdownOpen(false)}
                      >
                        <User className="h-4 w-4" />
                        My Profile
                      </Link>
                      <button
                        onClick={handleLogout}
                        className="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-100 flex items-center gap-2"
                      >
                        <LogOut className="h-4 w-4" />
                        Logout
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <>
                <button
                  onClick={() => setIsLoginModalOpen(true)}
                  className="text-[14px] lg:text-[16px] font-semibold text-[#606D93] hover:text-primary transition-colors"
                >
                  Login
                </button>
                <button
                  onClick={() => setIsSignupModalOpen(true)}
                  className="bg-primary w-[100px] lg:w-[118px] h-[40px] lg:h-[48px] hover:bg-primary-600 text-white px-3 lg:px-4 py-1.5 lg:py-2 rounded-[8px] text-sm font-medium transition-colors"
                >
                  Sign up
                </button>
              </>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button className="md:hidden" onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}>
            {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </header>

      {/* Backdrop for mobile */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 bg-black/50 z-40 md:hidden" onClick={() => setIsMobileMenuOpen(false)} />
      )}

      {/* Mobile Sidebar - New design */}
      <div
        ref={sidebarRef}
        className={`fixed top-0 left-0 h-full w-[280px] bg-white/90 backdrop-blur-lg border-r border-gray-200 z-50 transition-transform duration-300 md:hidden ${
          isMobileMenuOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        {/* Close button */}
        <button
          className="absolute right-4 top-4 bg-white rounded-full p-2 shadow-md"
          onClick={() => setIsMobileMenuOpen(false)}
        >
          <X className="h-5 w-5 text-gray-600" />
        </button>

        {/* User profile */}
        {user && (
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
        )}

        {/* Navigation */}
        <nav className="flex-1 py-6 px-3 overflow-y-auto">
          <ul className="space-y-1">
            {user ? (
              // Navigation for authenticated users
              navItems.map((item) => {
                const isActive = pathname === item.href || (item.href !== "/" && pathname?.startsWith(item.href))

                return (
                  <li key={item.name}>
                    <Link
                      href={item.href}
                      className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 group ${
                        isActive ? "bg-primary text-white" : "text-gray-700 hover:bg-gray-100"
                      }`}
                      onClick={() => setIsMobileMenuOpen(false)}
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
              })
            ) : (
              // Navigation for non-authenticated users
              <>
                <li>
                  <Link
                    href="/about"
                    className="flex items-center gap-3 px-4 py-3 rounded-lg text-gray-700 hover:bg-gray-100 transition-all duration-200"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    <User className="h-5 w-5 text-gray-500" />
                    <span>About Us</span>
                  </Link>
                </li>
                <li>
                  <Link
                    href="/properties"
                    className="flex items-center gap-3 px-4 py-3 rounded-lg text-gray-700 hover:bg-gray-100 transition-all duration-200"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    <Building className="h-5 w-5 text-gray-500" />
                    <span>Explore Properties</span>
                  </Link>
                </li>
                <li>
                  <Link
                    href="/contact"
                    className="flex items-center gap-3 px-4 py-3 rounded-lg text-gray-700 hover:bg-gray-100 transition-all duration-200"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    <Mail className="h-5 w-5 text-gray-500" />
                    <span>Contact</span>
                  </Link>
                </li>
                <li>
                  <Link
                    href="/faqs"
                    className="flex items-center gap-3 px-4 py-3 rounded-lg text-gray-700 hover:bg-gray-100 transition-all duration-200"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    <HelpCircle className="h-5 w-5 text-gray-500" />
                    <span>FAQs</span>
                  </Link>
                </li>
              </>
            )}
          </ul>
        </nav>

        {/* Logout button or Auth buttons */}
        <div className="p-4 border-t border-gray-100">
          {user ? (
            <button
              onClick={handleLogout}
              className="flex items-center gap-3 px-4 py-3 w-full rounded-lg text-red-600 hover:bg-red-50 transition-colors"
            >
              <LogOut className="h-5 w-5" />
              <span>Logout</span>
            </button>
          ) : (
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => {
                  setIsMobileMenuOpen(false)
                  setIsLoginModalOpen(true)
                }}
                className="px-4 py-2 border border-primary text-primary rounded-md text-center"
              >
                Login
              </button>
              <button
                onClick={() => {
                  setIsMobileMenuOpen(false)
                  setIsSignupModalOpen(true)
                }}
                className="px-4 py-2 bg-primary text-white rounded-md text-center"
              >
                Sign up
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Mobile toggle button when sidebar is closed */}
      {!isMobileMenuOpen && user && isMobile && (
        <button
          className="fixed bottom-6 left-6 z-40 bg-primary text-white p-3 rounded-full shadow-lg hidden"
          onClick={() => setIsMobileMenuOpen(true)}
        >
          <Menu className="h-6 w-6" />
        </button>
      )}

      {/* Modals */}
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

