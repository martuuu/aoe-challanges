'use client'

import { useAuth } from '@/hooks/useAuth'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  ArrowLeft,
  Info,
  Trophy,
  Target,
  Users,
  Clock,
  Star,
  Award,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

export default function InfoPage() {
  const { user } = useAuth()
  const router = useRouter()
  const [currentSlide, setCurrentSlide] = useState(0)

  // Redirect if not logged in
  useEffect(() => {
    if (!user) {
      router.push('/')
    }
  }, [user, router])

  if (!user) return null

  // Definir las slides del carrusel
  const slides = [
    {
      id: 'pyramid',
      title: 'Sistema de Pirámide',
      icon: Target,
      borderColor: 'border-green-200',
      titleColor: 'text-green-700',
      content: (
        <div className="space-y-4">
          <div className="grid md:grid-cols-2 gap-6">
            <div className="space-y-3">
              <h3 className="font-semibold text-gray-800 flex items-center gap-2">
                <Trophy className="w-4 h-4 text-green-600" />
                Reglas de Ascenso
              </h3>
              <ul className="space-y-2 text-sm text-gray-700">
                <li className="flex items-start gap-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full mt-1.5 flex-shrink-0"></div>
                  <span>Si ganas contra alguien de nivel inferior, intercambias posiciones</span>
                </li>
                <li className="flex items-start gap-2">
                  <div className="w-2 h-2 bg-blue-500 rounded-full mt-1.5 flex-shrink-0"></div>
                  <span>
                    Si ganas 2 veces consecutivas contra alguien de tu mismo nivel, subes un nivel
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <div className="w-2 h-2 bg-purple-500 rounded-full mt-1.5 flex-shrink-0"></div>
                  <span>Los desafíos expiran en 48 horas si no son aceptados</span>
                </li>
              </ul>
            </div>
            <div className="space-y-3">
              <h3 className="font-semibold text-gray-800 flex items-center gap-2">
                <Clock className="w-4 h-4 text-blue-600" />
                Proceso de Desafío
              </h3>
              <ol className="space-y-2 text-sm text-gray-700">
                <li className="flex items-start gap-2">
                  <div className="w-5 h-5 bg-green-100 text-green-600 rounded-full flex items-center justify-center text-xs font-semibold flex-shrink-0">
                    1
                  </div>
                  <span>Crear desafío desde la pirámide o sección de acciones</span>
                </li>
                <li className="flex items-start gap-2">
                  <div className="w-5 h-5 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-xs font-semibold flex-shrink-0">
                    2
                  </div>
                  <span>El oponente tiene 48 horas para aceptar o rechazar</span>
                </li>
                <li className="flex items-start gap-2">
                  <div className="w-5 h-5 bg-purple-100 text-purple-600 rounded-full flex items-center justify-center text-xs font-semibold flex-shrink-0">
                    3
                  </div>
                  <span>Una vez aceptado, tienen 1 semana para jugar y declarar el ganador</span>
                </li>
                <li className="flex items-start gap-2">
                  <div className="w-5 h-5 bg-orange-100 text-orange-600 rounded-full flex items-center justify-center text-xs font-semibold flex-shrink-0">
                    4
                  </div>
                  <span>El sistema actualiza automáticamente posiciones y estadísticas</span>
                </li>
              </ol>
            </div>
          </div>
        </div>
      ),
    },
    {
      id: 'stars',
      title: 'Sistema de Estrellas',
      icon: Star,
      borderColor: 'border-yellow-200',
      titleColor: 'text-yellow-700',
      content: (
        <div>
          <div className="grid md:grid-cols-4 gap-4">
            <div className="text-center p-4 bg-amber-50 rounded-lg border border-amber-200">
              <div className="w-8 h-8 mx-auto mb-2 text-amber-600">
                <svg viewBox="0 0 24 24" fill="currentColor" className="w-full h-full">
                  <polygon points="12,2 15.09,8.26 22,9.27 17,14.14 18.18,21.02 12,17.77 5.82,21.02 7,14.14 2,9.27 8.91,8.26" />
                </svg>
              </div>
              <h3 className="font-semibold text-amber-700">Bronce</h3>
              <p className="text-xs text-amber-600 mt-1">Primera estrella</p>
              <p className="text-xs text-gray-600">Nivel 3</p>
            </div>
            <div className="text-center p-4 bg-gray-50 rounded-lg border border-gray-200">
              <div className="w-8 h-8 mx-auto mb-2 text-gray-400">
                <svg viewBox="0 0 24 24" fill="currentColor" className="w-full h-full">
                  <polygon points="12,2 15.09,8.26 22,9.27 17,14.14 18.18,21.02 12,17.77 5.82,21.02 7,14.14 2,9.27 8.91,8.26" />
                </svg>
              </div>
              <h3 className="font-semibold text-gray-600">Plata</h3>
              <p className="text-xs text-gray-500 mt-1">Segunda estrella</p>
              <p className="text-xs text-gray-600">Nivel 2</p>
            </div>
            <div className="text-center p-4 bg-yellow-50 rounded-lg border border-yellow-200">
              <div className="w-8 h-8 mx-auto mb-2 text-yellow-500">
                <svg viewBox="0 0 24 24" fill="currentColor" className="w-full h-full">
                  <polygon points="12,2 15.09,8.26 22,9.27 17,14.14 18.18,21.02 12,17.77 5.82,21.02 7,14.14 2,9.27 8.91,8.26" />
                </svg>
              </div>
              <h3 className="font-semibold text-yellow-600">Oro</h3>
              <p className="text-xs text-yellow-500 mt-1">Tercera estrella</p>
              <p className="text-xs text-gray-600">Nivel 1</p>
            </div>
            <div className="text-center p-4 bg-cyan-50 rounded-lg border border-cyan-200">
              <div className="w-8 h-8 mx-auto mb-2 text-cyan-400">
                <svg viewBox="0 0 24 24" fill="currentColor" className="w-full h-full">
                  <polygon points="12,2 15.09,8.26 22,9.27 17,14.14 18.18,21.02 12,17.77 5.82,21.02 7,14.14 2,9.27 8.91,8.26" />
                </svg>
              </div>
              <h3 className="font-semibold text-cyan-600">Diamante</h3>
              <p className="text-xs text-cyan-500 mt-1">Cuarta estrella</p>
              <p className="text-xs text-gray-600">Nivel 0 (Máximo)</p>
            </div>
          </div>
          <div className="mt-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
            <p className="text-sm text-blue-700">
              <Info className="w-4 h-4 inline mr-1" />
              Las estrellas se ganan progresivamente al subir de nivel. La estrella de diamante solo
              se muestra al alcanzar el nivel máximo.
            </p>
          </div>
        </div>
      ),
    },
    {
      id: 'matches',
      title: 'Tipos de Partidas',
      icon: Users,
      borderColor: 'border-blue-200',
      titleColor: 'text-blue-700',
      content: (
        <div className="grid md:grid-cols-3 gap-4">
          <div className="p-4 bg-green-50 rounded-lg border border-green-200">
            <div className="flex items-center gap-2 mb-2">
              <Target className="w-5 h-5 text-green-600" />
              <h3 className="font-semibold text-green-700">Desafío Individual</h3>
            </div>
            <p className="text-sm text-green-600 mb-2">Desafía directamente a otro jugador</p>
            <ul className="text-xs text-gray-600 space-y-1">
              <li>• Afecta posiciones en la pirámide</li>
              <li>• Actualiza ELO y estadísticas</li>
              <li>• Requiere aceptación del oponente</li>
            </ul>
          </div>
          <div className="p-4 bg-orange-50 rounded-lg border border-orange-200">
            <div className="flex items-center gap-2 mb-2">
              <Trophy className="w-5 h-5 text-orange-600" />
              <h3 className="font-semibold text-orange-700">Sugerencia</h3>
            </div>
            <p className="text-sm text-orange-600 mb-2">
              Sugiere un enfrentamiento entre otros jugadores
            </p>
            <ul className="text-xs text-gray-600 space-y-1">
              <li>• Ambos jugadores deben aceptar</li>
              <li>• Mismo efecto que desafío directo</li>
              <li>• Útil para dinamizar la pirámide</li>
            </ul>
          </div>
          <div className="p-4 bg-purple-50 rounded-lg border border-purple-200">
            <div className="flex items-center gap-2 mb-2">
              <Users className="w-5 h-5 text-purple-600" />
              <h3 className="font-semibold text-purple-700">Partida Grupal</h3>
            </div>
            <p className="text-sm text-purple-600 mb-2">
              Carga resultados de partidas 2v2 o mayores
            </p>
            <ul className="text-xs text-gray-600 space-y-1">
              <li>• Actualiza estadísticas generales</li>
              <li>• No afecta posiciones en pirámide</li>
              <li>• Registro de partidas casuales</li>
            </ul>
          </div>
        </div>
      ),
    },
    {
      id: 'elo',
      title: 'Sistema de ELO y Estadísticas',
      icon: Award,
      borderColor: 'border-purple-200',
      titleColor: 'text-purple-700',
      content: (
        <div className="grid md:grid-cols-2 gap-6">
          <div className="space-y-3">
            <h3 className="font-semibold text-gray-800">Cálculo de ELO</h3>
            <div className="text-sm text-gray-700 space-y-2">
              <p>
                • <strong>ELO inicial:</strong> 1200 puntos para todos los jugadores
              </p>
              <p>
                • <strong>Victoria:</strong> Ganas puntos basado en la diferencia de ELO
              </p>
              <p>
                • <strong>Derrota:</strong> Pierdes puntos de manera proporcional
              </p>
              <p>
                • <strong>Factor K:</strong> 32 para cambios dinámicos
              </p>
            </div>
          </div>
          <div className="space-y-3">
            <h3 className="font-semibold text-gray-800">Estadísticas Rastreadas</h3>
            <div className="text-sm text-gray-700 space-y-2">
              <p>
                • <strong>Victorias/Derrotas:</strong> Contador de partidas ganadas y perdidas
              </p>
              <p>
                • <strong>Win Rate:</strong> Porcentaje de victorias sobre total de partidas
              </p>
              <p>
                • <strong>Racha actual:</strong> Victorias o derrotas consecutivas
              </p>
              <p>
                • <strong>Historial:</strong> Registro completo de todas las partidas
              </p>
            </div>
          </div>
        </div>
      ),
    },
    {
      id: 'user',
      title: 'Tu Estado Actual',
      icon: Info,
      borderColor: 'border-green-200',
      titleColor: 'text-green-700',
      content: (
        <div className="grid md:grid-cols-3 gap-4">
          <div className="text-center p-3 bg-white rounded-lg border">
            <div className="text-xl font-bold text-green-600">{user.level}</div>
            <div className="text-sm text-gray-600">Nivel en Pirámide</div>
          </div>
          <div className="text-center p-3 bg-white rounded-lg border">
            <div className="flex justify-center gap-1 mb-1">
              {Array.from({ length: 4 }, (_, index) => {
                const earnedStars = Math.max(0, 4 - user.level)
                const isEarned = index < earnedStars
                const isHiddenStar = index === 3

                if (isHiddenStar && !isEarned) return null

                const getStarColor = () => {
                  switch (index) {
                    case 0:
                      return 'text-amber-600'
                    case 1:
                      return 'text-gray-400'
                    case 2:
                      return 'text-yellow-500'
                    case 3:
                      return 'text-cyan-400'
                    default:
                      return 'text-gray-300'
                  }
                }

                return (
                  <div
                    key={index}
                    className={`w-4 h-4 ${isEarned ? getStarColor() : 'text-gray-300'}`}
                  >
                    <svg
                      viewBox="0 0 24 24"
                      fill={isEarned ? 'currentColor' : 'white'}
                      stroke="currentColor"
                      strokeWidth="2"
                      className="w-full h-full"
                    >
                      <polygon points="12,2 15.09,8.26 22,9.27 17,14.14 18.18,21.02 12,17.77 5.82,21.02 7,14.14 2,9.27 8.91,8.26" />
                    </svg>
                  </div>
                )
              })}
            </div>
            <div className="text-sm text-gray-600">Estrellas Ganadas</div>
          </div>
          <div className="text-center p-3 bg-white rounded-lg border">
            <div className="text-xl font-bold text-blue-600">{user.alias}</div>
            <div className="text-sm text-gray-600">Tu Alias</div>
          </div>
        </div>
      ),
    },
  ]

  const nextSlide = () => {
    setCurrentSlide(prev => (prev + 1) % slides.length)
  }

  const prevSlide = () => {
    setCurrentSlide(prev => (prev - 1 + slides.length) % slides.length)
  }

  const currentSlideData = slides[currentSlide]

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-blue-50 to-green-50 p-4">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center gap-4 mb-6">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => router.back()}
            className="text-green-700 hover:bg-green-100"
          >
            <ArrowLeft className="w-5 h-5 mr-2" />
            Volver
          </Button>
          <h1 className="text-2xl font-bold text-green-800">Información del Sistema</h1>
        </div>

        {/* Slider Container */}
        <div className="relative">
          {/* Navigation Buttons */}
          <button
            onClick={prevSlide}
            className="absolute left-4 top-1/2 -translate-y-1/2 z-10 bg-white/90 hover:bg-white border border-green-200 rounded-full p-2 shadow-lg transition-all duration-200 hover:shadow-xl"
          >
            <ChevronLeft className="w-5 h-5 text-green-700" />
          </button>

          <button
            onClick={nextSlide}
            className="absolute right-4 top-1/2 -translate-y-1/2 z-10 bg-white/90 hover:bg-white border border-green-200 rounded-full p-2 shadow-lg transition-all duration-200 hover:shadow-xl"
          >
            <ChevronRight className="w-5 h-5 text-green-700" />
          </button>

          {/* Slide Container */}
          <div className="h-[600px] overflow-hidden">
            <AnimatePresence mode="wait">
              <motion.div
                key={currentSlide}
                initial={{ opacity: 0, x: 100 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -100 }}
                transition={{ duration: 0.3, ease: 'easeInOut' }}
                className="h-full"
              >
                <Card
                  className={`${currentSlideData.borderColor} bg-white/80 backdrop-blur-sm h-full flex flex-col`}
                >
                  <CardHeader>
                    <CardTitle className={`${currentSlideData.titleColor} flex items-center gap-2`}>
                      <currentSlideData.icon className="w-5 h-5" />
                      {currentSlideData.title}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="flex-1 overflow-y-auto">
                    {currentSlideData.content}
                  </CardContent>
                </Card>
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Slide Indicators */}
          <div className="flex justify-center gap-2 mt-4">
            {slides.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentSlide(index)}
                className={`w-3 h-3 rounded-full transition-all duration-200 ${
                  index === currentSlide
                    ? 'bg-green-700 scale-110'
                    : 'bg-green-200 hover:bg-green-400'
                }`}
              />
            ))}
          </div>

          {/* Slide Counter */}
          <div className="text-center mt-2">
            <span className="text-sm text-gray-600">
              {currentSlide + 1} de {slides.length}
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}
