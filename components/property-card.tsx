"use client"

import type React from "react"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Heart, Bed, Bath, Square } from "lucide-react"
import { propertiesService } from "@/services/properties"
import { useAuth } from "@/contexts/auth-context"
import { useToast } from "@/hooks/use-toast"

interface PropertyCardProps {
  id: string | number
  title: string
  price: number
  address: string
  area: string
  city: string
  beds: number
  baths: number
  size: string
  popular?: boolean
  imageUrl?: string
  isFavorite?: boolean
  onFavoriteToggle?: (id: number, isFavorite: boolean) => void
}

export function PropertyCard({
  id,
  title,
  price,
  address,
  area,
  city,
  beds,
  baths,
  size,
  popular = false,
  imageUrl = "/placeholder.svg?height=300&width=400",
  isFavorite: initialIsFavorite = false,
  onFavoriteToggle,
}: PropertyCardProps) {
  const [isFavorite, setIsFavorite] = useState(initialIsFavorite)
  const [isToggling, setIsToggling] = useState(false)
  const { user } = useAuth()
  const { toast } = useToast()

  // Update local state if prop changes
  useEffect(() => {
    setIsFavorite(initialIsFavorite)
  }, [initialIsFavorite])

  const formattedPrice = new Intl.NumberFormat("en-NG", {
    style: "currency",
    currency: "NGN",
    maximumFractionDigits: 0,
  })
    .format(price)
    .replace("NGN", "₦")

  const handleFavoriteToggle = async (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()

    if (!user) {
      toast({
        title: "Authentication required",
        description: "Please log in to save properties to favorites",
        variant: "destructive",
      })
      return
    }

    if (isToggling) return

    setIsToggling(true)

    try {
      const propertyId = typeof id === "string" ? Number.parseInt(id) : id
      const result = await propertiesService.toggleFavorite(propertyId)

      const newFavoriteState = result.action === "added"
      setIsFavorite(newFavoriteState)

      if (onFavoriteToggle) {
        onFavoriteToggle(propertyId, newFavoriteState)
      }

      toast({
        title: newFavoriteState ? "Added to favorites" : "Removed from favorites",
        description: newFavoriteState
          ? `${title} has been added to your favorites`
          : `${title} has been removed from your favorites`,
      })
    } catch (error) {
      console.error("Failed to toggle favorite:", error)
      toast({
        title: "Error",
        description: "Failed to update favorites. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsToggling(false)
    }
  }

  return (
    <div className="bg-white rounded-lg overflow-hidden shadow-md hover:shadow-lg transition-shadow">
      <div className="relative">
        <Link href={`/properties/${id}`}>
          <img
            src={imageUrl || "/placeholder.svg?height=300&width=400"}
            alt={title}
            className="w-full h-48 object-cover"
          />
        </Link>

        {popular && (
          <div className="absolute top-2 left-2 bg-primary text-white text-xs px-2 py-1 rounded">POPULAR</div>
        )}

        <button
          className={`absolute top-2 right-2 p-1.5 rounded-full ${
            isFavorite ? "bg-red-500 text-white" : "bg-white text-gray-500"
          } ${isToggling ? "opacity-50" : ""}`}
          onClick={handleFavoriteToggle}
          disabled={isToggling}
          aria-label={isFavorite ? "Remove from favorites" : "Add to favorites"}
        >
          <Heart className="h-4 w-4" fill={isFavorite ? "currentColor" : "none"} />
        </button>
      </div>

      <div className="p-4">
        <div className="flex justify-between items-start mb-2">
          <div>
            <p className="text-lg font-bold text-primary">
              {formattedPrice}
              <span className="text-sm font-normal text-gray-500">/per day</span>
            </p>
          </div>
        </div>

        <Link href={`/properties/${id}`}>
          <h3 className="text-lg font-bold mb-1 hover:text-primary transition-colors">{title}</h3>
        </Link>

        <p className="text-gray-500 text-sm mb-4">
          {address}, {area}, {city}
        </p>

        <div className="flex items-center justify-between text-gray-500 text-sm">
          <div className="flex items-center">
            <Bed className="h-4 w-4 mr-1" />
            <span>
              {beds} {beds === 1 ? "Bed" : "Beds"}
            </span>
          </div>

          <div className="flex items-center">
            <Bath className="h-4 w-4 mr-1" />
            <span>
              {baths} {baths === 1 ? "Bathroom" : "Bathrooms"}
            </span>
          </div>

          <div className="flex items-center">
            <Square className="h-4 w-4 mr-1" />
            <span>{size}</span>
          </div>
        </div>
      </div>
    </div>
  )
}

