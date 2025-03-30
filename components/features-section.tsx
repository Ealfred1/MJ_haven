import { Shield, DollarSign, Clock } from "lucide-react"

export function FeaturesSection() {
  return (
    <section className="py-16">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold mb-2">What we offer you</h2>
          <p className="text-gray-500">Some of our picked properties near you location.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="flex flex-col items-center text-center">
            <div className="w-16 h-16 rounded-full bg-primary-100 flex items-center justify-center mb-4">
              <Shield className="h-8 w-8 text-primary" />
            </div>
            <h3 className="text-xl font-bold mb-2">Secured Property</h3>
            <p className="text-gray-500">
              We offer our customer property protection of liability coverage and insurance for their better life.
            </p>
          </div>

          <div className="flex flex-col items-center text-center">
            <div className="w-16 h-16 rounded-full bg-primary-100 flex items-center justify-center mb-4">
              <DollarSign className="h-8 w-8 text-primary" />
            </div>
            <h3 className="text-xl font-bold mb-2">Best Price</h3>
            <p className="text-gray-500">
              Not sure what you should be charging for your property? No need to worry, let us do the numbers for you.
            </p>
          </div>

          <div className="flex flex-col items-center text-center">
            <div className="w-16 h-16 rounded-full bg-primary-100 flex items-center justify-center mb-4">
              <Clock className="h-8 w-8 text-primary" />
            </div>
            <h3 className="text-xl font-bold mb-2">Seamless booking</h3>
            <p className="text-gray-500">
              Not sure what you should be charging for your property? No need to worry, let us do the numbers for you.
            </p>
          </div>
        </div>
      </div>
    </section>
  )
}

