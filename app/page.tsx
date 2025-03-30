import { Navigation } from "@/components/navigation"
import { HeroSection } from "@/components/hero-section"
import { SearchSection } from "@/components/search-section"
import { StatsSection } from "@/components/stats-section"
import { FeaturesSection } from "@/components/features-section"
import { PropertyListings } from "@/components/property-listings"
import { TestimonialsSection } from "@/components/testimonials-section"
import { NewsletterSection } from "@/components/newsletter-section"
import { Footer } from "@/components/footer"

export default function Home() {
  return (
    <>
      <Navigation />
      <HeroSection />
      <StatsSection />
      <SearchSection />
      <FeaturesSection />
      <PropertyListings />
      <TestimonialsSection />
      <NewsletterSection />
      <Footer />
    </>
  )
}

