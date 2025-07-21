"use client"

import { useState, useEffect } from "react"
import { Card } from "@/components/ui/card"
import { Swords } from "lucide-react"
import { useIntersectionObserver } from "@/hooks/useIntersectionObserver"

interface PlayerCardProps {
  player: string
  level: string
  onChallenge: (player: string) => void
}

export function PlayerCard({ player, level, onChallenge }: PlayerCardProps) {
  const [showSnippet, setShowSnippet] = useState(false)
  const { ref, isIntersecting, hasIntersected } = useIntersectionObserver()

  // Posiciones aleatorias para los snippets
  const snippetPositions = [
    {
      position: "top-0 left-0 -translate-x-2 -translate-y-2",
      tail: "bottom-0 translate-y-full border-t-slate-800 border-b-transparent left-4",
    },
    {
      position: "top-0 right-0 translate-x-2 -translate-y-2",
      tail: "bottom-0 translate-y-full border-t-slate-800 border-b-transparent right-4",
    },
    {
      position: "bottom-0 left-0 -translate-x-2 translate-y-2",
      tail: "top-0 -translate-y-full border-b-slate-800 border-t-transparent left-4",
    },
    {
      position: "bottom-0 right-0 translate-x-2 translate-y-2",
      tail: "top-0 -translate-y-full border-b-slate-800 border-t-transparent right-4",
    },
    {
      position: "top-1/2 left-0 -translate-x-full -translate-y-1/2",
      tail: "right-0 translate-x-full border-l-slate-800 border-r-transparent top-1/2 -translate-y-1/2",
    },
    {
      position: "top-1/2 right-0 translate-x-full -translate-y-1/2",
      tail: "left-0 -translate-x-full border-r-slate-800 border-l-transparent top-1/2 -translate-y-1/2",
    },
  ]

  const randomSnippet = snippetPositions[Math.floor(Math.random() * snippetPositions.length)]

  // Mostrar snippet cuando está en el viewport central
  useEffect(() => {
    if (isIntersecting && hasIntersected && !showSnippet) {
      const timer = setTimeout(
        () => {
          setShowSnippet(true)
        },
        Math.random() * 1000 + 500,
      ) // Delay aleatorio entre 500ms y 1500ms

      return () => clearTimeout(timer)
    }
  }, [isIntersecting, hasIntersected, showSnippet])

  // Ocultar snippet después de un tiempo
  useEffect(() => {
    if (showSnippet) {
      const timer = setTimeout(() => {
        setShowSnippet(false)
      }, 4000) // Mostrar por 4 segundos

      return () => clearTimeout(timer)
    }
  }, [showSnippet])

  const handleChallengeClick = () => {
    onChallenge(player)
    setShowSnippet(false)
  }

  return (
    <>
      <style jsx>{`
        @keyframes bounce-in {
          0% {
            opacity: 0;
            transform: scale(0.3) translateY(10px);
          }
          50% {
            opacity: 1;
            transform: scale(1.05);
          }
          70% {
            transform: scale(0.9);
          }
          100% {
            opacity: 1;
            transform: scale(1);
          }
        }
        
        .animate-bounce-in {
          animation: bounce-in 0.6s cubic-bezier(0.68, -0.55, 0.265, 1.55);
        }

        @keyframes pulse-glow {
          0%, 100% {
            box-shadow: 0 0 5px rgba(59, 130, 246, 0.5);
          }
          50% {
            box-shadow: 0 0 20px rgba(59, 130, 246, 0.8);
          }
        }

        .animate-pulse-glow {
          animation: pulse-glow 2s infinite;
        }
      `}</style>

      <div ref={ref} className="relative">
        <Card
          className={`p-4 transition-all duration-300 hover:scale-105 hover:shadow-lg relative ${
            showSnippet ? "animate-pulse-glow" : ""
          } ${
            level === "1"
              ? "bg-gradient-to-br from-yellow-50 to-yellow-100 border-yellow-300 shadow-lg"
              : level === "2"
                ? "bg-gradient-to-br from-gray-50 to-gray-100 border-gray-300"
                : level === "3"
                  ? "bg-gradient-to-br from-orange-50 to-orange-100 border-orange-300"
                  : "bg-gradient-to-br from-red-50 to-red-100 border-red-300"
          }`}
        >
          <div className="text-center">
            <div className="font-bold text-lg">{player}</div>
            <div className="text-sm text-gray-500">Nivel {level}</div>
          </div>

          {/* Snippet de desafío animado */}
          {showSnippet && (
            <div className={`absolute ${randomSnippet.position} z-20 animate-bounce-in`}>
              <div className="relative">
                {/* Burbuja de chat */}
                <button
                  onClick={handleChallengeClick}
                  className="bg-slate-800 text-white px-3 py-2 rounded-lg shadow-lg whitespace-nowrap text-sm font-medium hover:bg-slate-700 transition-colors cursor-pointer"
                >
                  <div className="flex items-center gap-2">
                    <span>¿Me desafías?</span>
                    <Swords className="w-4 h-4" />
                  </div>
                </button>

                {/* Cola de la burbuja */}
                <div className={`absolute w-0 h-0 border-4 border-transparent ${randomSnippet.tail}`}></div>
              </div>
            </div>
          )}
        </Card>
      </div>
    </>
  )
}
