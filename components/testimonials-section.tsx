"use client"

import { useState } from "react"

const testimonials = [
  {
    id: 1,
    quote:
      "Estatery is the platform I go to on almost a daily basis for 2nd home and vacation condo shopping, or to just look at dream homes in new areas. Thanks for fun home shopping and comparative analyzing, MJ's Haven!",
    name: "Mira Culos",
    role: "Renter",
    avatar: "/placeholder.svg?height=100&width=100",
  },
  {
    id: 2,
    quote:
      "As a property manager, MJ's Haven has simplified my workflow tremendously. The platform is intuitive and the customer service is exceptional.",
    name: "John Smith",
    role: "Property Manager",
    avatar: "/placeholder.svg?height=100&width=100",
  },
  {
    id: 3,
    quote:
      "I've been a landlord for over 10 years and MJ's Haven is by far the best platform I've used. It's helped me find reliable tenants quickly and efficiently.",
    name: "Sarah Johnson",
    role: "Landlord",
    avatar: "/placeholder.svg?height=100&width=100",
  },
]

export function TestimonialsSection() {
  const [activeIndex, setActiveIndex] = useState(0)

  return (
    <section className="py-16 bg-gray-50">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold mb-2">Testimonials</h2>
          <p className="text-gray-500">See what our property managers, landlords, and tenants have to say</p>
        </div>

        <div className="max-w-3xl mx-auto">
          <div className="bg-white p-8 rounded-lg shadow-md">
            <p className="text-lg italic text-gray-700 mb-6">"{testimonials[activeIndex].quote}"</p>

            <div className="flex items-center">
              <img
                src={testimonials[activeIndex].avatar || "/placeholder.svg"}
                alt={testimonials[activeIndex].name}
                className="w-12 h-12 rounded-full object-cover mr-4"
              />
              <div>
                <p className="font-bold">{testimonials[activeIndex].name}</p>
                <p className="text-gray-500">{testimonials[activeIndex].role}</p>
              </div>
            </div>
          </div>

          <div className="flex justify-center mt-8 space-x-2">
            {testimonials.map((_, index) => (
              <button
                key={index}
                onClick={() => setActiveIndex(index)}
                className={`w-12 h-12 rounded-full overflow-hidden border-2 ${
                  activeIndex === index ? "border-primary" : "border-transparent"
                }`}
              >
                <img
                  src={testimonials[index].avatar || "/placeholder.svg"}
                  alt={testimonials[index].name}
                  className="w-full h-full object-cover"
                />
              </button>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}

