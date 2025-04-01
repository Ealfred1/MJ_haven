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
  const propertyId = typeof id === "string" ? Number.parseInt(id) : id

  // Check if property is in local favorites for unauthenticated users
  useEffect(() => {
    if (!user && !initialIsFavorite) {
      const isLocalFavorite = propertiesService.isPropertyFavorited(propertyId)
      setIsFavorite(isLocalFavorite)
    } else {
      setIsFavorite(initialIsFavorite)
    }
  }, [initialIsFavorite, propertyId, user])

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

    if (isToggling) return
    setIsToggling(true)

    try {
      const result = await propertiesService.toggleFavorite(propertyId)

      // Determine if the property is now favorited based on the response
      const newFavoriteState = result.id !== undefined || result.action === "added"
      setIsFavorite(newFavoriteState)

      // if (onFavoriteToggle) {
      //   onFavoriteToggle(propertyId, newFavoriteState)
      // }

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
    <div
      className="bg-white rounded-lg overflow-hidden border-[1.5px] border-[#F0EFFB]"
      style={{ width: "360px", height: "auto", maxWidth: "360px", maxHeight: "424px" }}
    >
      <div className="relative">
        <Link href={`/properties/${id}`}>
          <img
            src={imageUrl || "/placeholder.svg?height=300&width=400"}
            alt={title}
            className="object-cover"
            style={{
              width: "352px",
              height: "200px",
              marginLeft: "8px",
              marginTop: "8px",
              borderTopLeftRadius: "8px",
              borderTopRightRadius: "8px",
            }}
          />
        </Link>

        {popular && (
          <div className="absolute top-4 left-4 bg-primary text-white text-xs px-2 py-1 rounded flex items-center">
            <span className="mr-1">•</span>
            <span className="uppercase font-medium">Popular</span>
          </div>
        )}
      </div>

      <div className="p-4">
        <div className="flex justify-between items-start">
          <div>
            <p className="text-lg font-bold text-primary">
              {formattedPrice} <span className="text-sm font-normal text-gray-500">/per day</span>
            </p>
          </div>
          <button
            className={`p-1.5 rounded-full ${
              isFavorite ? "bg-red-50 text-red-500" : "bg-gray-50 text-gray-500"
            } ${isToggling ? "opacity-50" : ""}`}
            onClick={handleFavoriteToggle}
            disabled={isToggling}
            aria-label={isFavorite ? "Remove from favorites" : "Add to favorites"}
            style={{ width: "40px", height: "40px" }}
          >
            <Heart className="h-5 w-5 mx-auto" fill={isFavorite ? "currentColor" : "none"} />
          </button>
        </div>

        <Link href={`/properties/${id}`}>
          <h3 className="text-xl font-bold mt-2 hover:text-primary transition-colors">{title}</h3>
        </Link>

        <p className="text-gray-500 text-sm mt-1 mb-4">
          {address}, {area}, {city}
        </p>

        <div className="border-t pt-4 mt-2">
          <div className="flex items-center justify-between text-gray-700 text-sm">
            <div className="flex items-center">
              <Bed className="h-5 w-5 mr-2 text-gray-500" />
              <span>
                {beds} {beds === 1 ? "Bed" : "Beds"}
              </span>
            </div>

            <div className="flex items-center">
              <Bath className="h-5 w-5 mr-2 text-gray-500" />
              <span>
                {baths} {baths === 1 ? "Bathroom" : "Bathrooms"}
              </span>
            </div>

            <div className="flex items-center">
              <Square className="h-5 w-5 mr-2 text-gray-500" />
              <span>{size}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

