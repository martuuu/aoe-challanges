'use client'

import { useEffect, useState } from 'react'
import { CheckCircle, X } from 'lucide-react'

interface CustomAlertProps {
  message: string
  onClose: () => void
}

function CustomAlert({ message, onClose }: CustomAlertProps) {
  const [isVisible, setIsVisible] = useState(true)

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(false)
      setTimeout(() => {
        onClose()
      }, 300) // Wait for animation to complete
    }, 3000)

    return () => clearTimeout(timer)
  }, [onClose])

  const handleClose = () => {
    setIsVisible(false)
    setTimeout(() => {
      onClose()
    }, 300)
  }

  return (
    <div
      className={`fixed top-4 right-4 z-50 transform transition-all duration-300 ease-in-out ${
        isVisible ? 'translate-x-0 opacity-100' : 'translate-x-full opacity-0'
      }`}
    >
      <div className="bg-slate-800 text-white rounded-lg shadow-lg p-4 pr-12 min-w-[300px] max-w-[400px] border border-slate-600">
        <div className="flex items-center gap-3">
          <CheckCircle className="w-5 h-5 text-green-400 flex-shrink-0" />
          <p className="text-sm font-medium leading-relaxed">{message}</p>
        </div>

        <button
          onClick={handleClose}
          className="absolute top-2 right-2 p-1 hover:bg-slate-700 rounded-full transition-colors duration-200"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  )
}

interface AlertState {
  id: string
  message: string
}

export function useCustomAlert() {
  const [alerts, setAlerts] = useState<AlertState[]>([])

  const showAlert = (message: string) => {
    const id = Math.random().toString(36).substr(2, 9)
    setAlerts(prev => [...prev, { id, message }])
  }

  const removeAlert = (id: string) => {
    setAlerts(prev => prev.filter(alert => alert.id !== id))
  }

  const AlertContainer = () => (
    <div className="fixed top-0 right-0 z-50">
      {alerts.map((alert, index) => (
        <div
          key={alert.id}
          style={{
            transform: `translateY(${index * 80}px)`,
          }}
        >
          <CustomAlert message={alert.message} onClose={() => removeAlert(alert.id)} />
        </div>
      ))}
    </div>
  )

  return { showAlert, AlertContainer }
}
