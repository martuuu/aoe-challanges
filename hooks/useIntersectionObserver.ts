"use client"

import { useEffect, useRef, useState } from "react"

export function useIntersectionObserver(options = {}) {
  const [isIntersecting, setIsIntersecting] = useState(false)
  const [hasIntersected, setHasIntersected] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          const { top, bottom } = entry.boundingClientRect
          const viewportHeight = window.innerHeight

          // Verificar si está en el 70% central del viewport
          const centerStart = viewportHeight * 0.15 // 15% desde arriba
          const centerEnd = viewportHeight * 0.85 // 85% desde arriba

          const isInCenterZone = top >= centerStart && bottom <= centerEnd

          setIsIntersecting(isInCenterZone)

          if (isInCenterZone && !hasIntersected) {
            setHasIntersected(true)
          }
        } else {
          setIsIntersecting(false)
        }
      },
      {
        threshold: [0, 0.25, 0.5, 0.75, 1],
        rootMargin: "0px",
        ...options,
      },
    )

    const currentRef = ref.current
    if (currentRef) {
      observer.observe(currentRef)
    }

    return () => {
      if (currentRef) {
        observer.unobserve(currentRef)
      }
    }
  }, [hasIntersected])

  return { ref, isIntersecting, hasIntersected }
}
