"use client"

import { useState, useEffect, useRef } from "react"
import { X, ChevronLeft, ChevronRight, Play, Pause, Volume2, VolumeX } from "lucide-react"

interface MediaItem {
  type: "image" | "video"
  url: string
}

interface ImageGalleryProps {
  media?: MediaItem[]
  images?: string[]
  isOpen: boolean
  initialIndex?: number
  onClose: () => void
}

export function ImageGallery({ media, images, isOpen, initialIndex = 0, onClose }: ImageGalleryProps) {
  const [currentIndex, setCurrentIndex] = useState(initialIndex)
  const [isPlaying, setIsPlaying] = useState(false)
  const [isMuted, setIsMuted] = useState(false)
  const videoRef = useRef<HTMLVideoElement>(null)

  // Convert legacy images prop to media format if provided
  const mediaItems: MediaItem[] = media || images?.map((url) => ({ type: "image", url })) || []

  // Reset current index when gallery opens
  useEffect(() => {
    if (isOpen) {
      setCurrentIndex(initialIndex)
    }
  }, [isOpen, initialIndex])

  // Handle video playback when current item changes
  useEffect(() => {
    if (videoRef.current) {
      if (mediaItems[currentIndex]?.type === "video") {
        videoRef.current.load()
        if (isPlaying) {
          videoRef.current.play().catch((err) => console.error("Video play error:", err))
        }
      }
    }
  }, [currentIndex, mediaItems, isPlaying])

  // Close on escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose()
      } else if (e.key === "ArrowLeft") {
        handlePrevious()
      } else if (e.key === "ArrowRight") {
        handleNext()
      } else if (e.key === " " && mediaItems[currentIndex]?.type === "video") {
        // Space bar toggles video play/pause
        e.preventDefault()
        togglePlayPause()
      }
    }

    if (isOpen) {
      window.addEventListener("keydown", handleKeyDown)
    }

    return () => {
      window.removeEventListener("keydown", handleKeyDown)
    }
  }, [isOpen, onClose, currentIndex, mediaItems])

  if (!isOpen) return null

  const handlePrevious = () => {
    setCurrentIndex((prev) => (prev === 0 ? mediaItems.length - 1 : prev - 1))
  }

  const handleNext = () => {
    setCurrentIndex((prev) => (prev === mediaItems.length - 1 ? 0 : prev + 1))
  }

  const togglePlayPause = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause()
      } else {
        videoRef.current.play().catch((err) => console.error("Video play error:", err))
      }
      setIsPlaying(!isPlaying)
    }
  }

  const toggleMute = () => {
    if (videoRef.current) {
      videoRef.current.muted = !videoRef.current.muted
      setIsMuted(!isMuted)
    }
  }

  const currentItem = mediaItems[currentIndex]
  const isVideo = currentItem?.type === "video"

  return (
    <div className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center">
      <div className="relative w-full h-full flex flex-col">
        <div className="flex justify-between items-center p-4 text-white">
          <div className="text-sm">
            {currentIndex + 1} / {mediaItems.length}
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-full hover:bg-white/10 transition-colors"
            aria-label="Close gallery"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        <div className="flex-1 flex items-center justify-center overflow-hidden">
          <button
            onClick={handlePrevious}
            className="absolute left-4 p-2 rounded-full bg-black/50 text-white hover:bg-black/70 transition-colors z-10"
            aria-label="Previous image"
          >
            <ChevronLeft className="h-8 w-8" />
          </button>

          <div className="w-full h-full flex items-center justify-center p-4">
            {isVideo ? (
              <div className="relative max-w-full max-h-full">
                <video
                  ref={videoRef}
                  src={currentItem.url}
                  className="max-w-full max-h-[calc(100vh-120px)] object-contain"
                  controls={false}
                  muted={isMuted}
                  playsInline
                  onPlay={() => setIsPlaying(true)}
                  onPause={() => setIsPlaying(false)}
                  onEnded={() => setIsPlaying(false)}
                />
                <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex items-center gap-4 bg-black/50 rounded-full px-4 py-2">
                  <button
                    onClick={togglePlayPause}
                    className="text-white hover:text-gray-200 transition-colors"
                    aria-label={isPlaying ? "Pause video" : "Play video"}
                  >
                    {isPlaying ? <Pause className="h-6 w-6" /> : <Play className="h-6 w-6" />}
                  </button>
                  <button
                    onClick={toggleMute}
                    className="text-white hover:text-gray-200 transition-colors"
                    aria-label={isMuted ? "Unmute video" : "Mute video"}
                  >
                    {isMuted ? <VolumeX className="h-6 w-6" /> : <Volume2 className="h-6 w-6" />}
                  </button>
                </div>
              </div>
            ) : (
              <img
                src={currentItem?.url || "/placeholder.svg"}
                alt={`Gallery item ${currentIndex + 1}`}
                className="max-w-full max-h-[calc(100vh-120px)] object-contain"
              />
            )}
          </div>

          <button
            onClick={handleNext}
            className="absolute right-4 p-2 rounded-full bg-black/50 text-white hover:bg-black/70 transition-colors z-10"
            aria-label="Next image"
          >
            <ChevronRight className="h-8 w-8" />
          </button>
        </div>
      </div>
    </div>
  )
}

