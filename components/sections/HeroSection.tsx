import { Trophy } from 'lucide-react'

export function HeroSection() {
  return (
    <div className="text-center space-y-3 sm:space-y-4 py-8 sm:py-12">
      <h1 className="text-3xl sm:text-4xl font-bold text-green-700 flex items-center justify-center gap-2">
        <Trophy className="w-6 h-6 sm:w-8 sm:h-8 text-amber-500" />
        Age Panaderos
      </h1>
      <p className="text-green-700 text-base sm:text-lg px-4">
        ¿Quién tiene huevos para un mano a mano?
      </p>
    </div>
  )
}
