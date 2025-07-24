'use client'

import { motion } from 'framer-motion'
import { useEffect, useState } from 'react'

interface LoadingScreenProps {
  onLoadingComplete: () => void
  componentsLoading?: {
    pyramid: boolean
    pendingChallenges: boolean
    recentMatches: boolean
    acceptedChallenges: boolean
    users?: boolean
  }
}

export function LoadingScreen({ onLoadingComplete, componentsLoading }: LoadingScreenProps) {
  const [progress, setProgress] = useState(0)
  const [shouldComplete, setShouldComplete] = useState(false)

  // Verificar si todos los componentes han terminado de cargar
  const allComponentsLoaded = componentsLoading
    ? !componentsLoading.pyramid &&
      !componentsLoading.pendingChallenges &&
      !componentsLoading.recentMatches &&
      !componentsLoading.acceptedChallenges &&
      !componentsLoading.users
    : true

  // Debug: Log del estado de componentes
  useEffect(() => {
    if (componentsLoading) {
      console.log('Components loading state:', {
        pyramid: componentsLoading.pyramid,
        pendingChallenges: componentsLoading.pendingChallenges,
        recentMatches: componentsLoading.recentMatches,
        acceptedChallenges: componentsLoading.acceptedChallenges,
        users: componentsLoading.users,
        allLoaded: allComponentsLoaded,
      })
    }
  }, [componentsLoading, allComponentsLoaded])

  // Obtener el mensaje de carga actual
  const getLoadingMessage = () => {
    if (!componentsLoading) return 'Preparando el campo de batalla...'

    if (componentsLoading.users) return 'Cargando jugadores...'
    if (componentsLoading.pyramid) return 'Construyendo pirámide...'
    if (componentsLoading.pendingChallenges) return 'Verificando desafíos pendientes...'
    if (componentsLoading.recentMatches) return 'Obteniendo historial de partidas...'
    if (componentsLoading.acceptedChallenges) return 'Cargando partidas confirmadas...'

    return 'Finalizando preparativos...'
  }

  useEffect(() => {
    // Simular progreso de carga más suave
    const interval = setInterval(() => {
      setProgress(prev => {
        if (prev >= 95 && allComponentsLoaded) {
          // Si hemos llegado al 95% y todos los componentes están cargados, completar
          clearInterval(interval)
          setShouldComplete(true)
          return 100
        } else if (prev >= 95) {
          // Si hemos llegado al 95% pero algunos componentes siguen cargando, mantener el progreso
          return prev
        }

        // Incremento más pequeño y constante para suavidad
        const increment = Math.random() * 8 + 3
        return Math.min(prev + increment, 95)
      })
    }, 150)

    return () => clearInterval(interval)
  }, [allComponentsLoaded])

  // Efecto para completar la carga cuando shouldComplete sea true
  useEffect(() => {
    if (shouldComplete) {
      // Esperar un poco más para mostrar el 100% y luego completar
      const timeout = setTimeout(() => {
        onLoadingComplete()
      }, 600)

      return () => clearTimeout(timeout)
    }
  }, [shouldComplete, onLoadingComplete])

  return (
    <motion.div
      className="fixed inset-0 z-50 flex items-center justify-center bg-gradient-to-br from-amber-50 via-orange-50 to-yellow-50"
      initial={{ opacity: 1 }}
      exit={{
        opacity: 0,
        scale: 1.1,
        transition: { duration: 0.8, ease: 'easeInOut' },
      }}
    >
      {/* Patrón de fondo sutil */}
      <div className="absolute inset-0 opacity-5">
        <div
          className="absolute inset-0"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fillRule='evenodd'%3E%3Cg fill='%23d97706' fillOpacity='0.1'%3E%3Ccircle cx='30' cy='30' r='2'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
          }}
        />
      </div>

      <div className="text-center space-y-8 relative z-10">
        {/* Título con efecto de fill */}
        <div className="relative">
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.6, ease: 'easeOut' }}
            className="flex items-center justify-center gap-3"
          >
            {/* Contenedor del texto con efecto de fill */}
            <div className="relative">
              {/* Texto de fondo (sin llenar) */}
              <h1 className="text-6xl sm:text-7xl font-bold text-green-200 relative">
                Age Panaderos
              </h1>

              {/* Texto con fill progresivo usando clip-path */}
              <motion.h1
                className="absolute inset-0 text-6xl sm:text-7xl font-bold text-green-600 transition-all duration-300 ease-out"
                style={{
                  clipPath: `inset(0 ${100 - progress}% 0 0)`,
                }}
                animate={{
                  clipPath: `inset(0 ${100 - progress}% 0 0)`,
                }}
                transition={{
                  duration: 0.3,
                  ease: 'easeOut',
                }}
              >
                Age Panaderos
              </motion.h1>
            </div>
          </motion.div>
        </div>

        {/* Barra de progreso */}
        <div className="w-80 mx-auto space-y-4">
          {/* <div className="relative">
            <div className="w-full h-2 bg-green-200 rounded-full overflow-hidden">
              <motion.div
                className="h-full bg-gradient-to-r from-green-500 to-green-600 rounded-full"
                initial={{ width: 0 }}
                animate={{ width: `${progress}%` }}
                transition={{ duration: 0.3, ease: 'easeOut' }}
              />
            </div>
          </div> */}

          {/* Porcentaje */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="text-center"
          >
            <span className="text-lg font-semibold text-green-700">{Math.round(progress)}%</span>
          </motion.div>
        </div>

        {/* Texto de carga */}
        <motion.p
          key={getLoadingMessage()}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ delay: 0.2, duration: 0.4 }}
          className="text-green-600 text-lg"
        >
          {getLoadingMessage()}
        </motion.p>

        {/* Puntos animados */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1 }}
          className="flex justify-center space-x-2"
        >
          {[0, 1, 2].map(i => (
            <motion.div
              key={i}
              className="w-2 h-2 bg-green-500 rounded-full"
              animate={{
                scale: [1, 1.5, 1],
                opacity: [0.5, 1, 0.5],
              }}
              transition={{
                duration: 1.5,
                repeat: Infinity,
                delay: i * 0.2,
                ease: 'easeInOut',
              }}
            />
          ))}
        </motion.div>
      </div>
    </motion.div>
  )
}
