import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { LoadingSpinner } from '@/components/ui/loading'
import { Eye, EyeOff, LogIn, AlertCircle } from 'lucide-react'
import { useAuth } from '@/hooks/useAuth'
import { validateEmail } from '@/lib/auth-client'
import { useCustomAlert } from '@/components/ui/custom-alert'

interface LoginFormProps {
  onSuccess?: () => void
}

export function LoginForm({ onSuccess }: LoginFormProps) {
  const { login, isLoading, error, clearError } = useAuth()
  const { showAlert } = useCustomAlert()
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  })
  const [showPassword, setShowPassword] = useState(false)
  const [fieldErrors, setFieldErrors] = useState({
    email: '',
    password: '',
  })

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))

    // Limpiar errores cuando el usuario empiece a escribir
    if (fieldErrors[field as keyof typeof fieldErrors]) {
      setFieldErrors(prev => ({ ...prev, [field]: '' }))
    }
    if (error) {
      clearError()
    }
  }

  const validateForm = () => {
    const errors = { email: '', password: '' }
    let isValid = true

    if (!formData.email) {
      errors.email = 'El email es requerido'
      isValid = false
    } else if (!validateEmail(formData.email)) {
      errors.email = 'Formato de email inválido'
      isValid = false
    }

    if (!formData.password) {
      errors.password = 'La contraseña es requerida'
      isValid = false
    }

    setFieldErrors(errors)
    return isValid
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateForm()) {
      return
    }

    try {
      await login(formData)
      showAlert('Log-in exitoso')
      onSuccess?.()
    } catch {
      // El error ya se maneja en el hook useAuth
    }
  }

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader className="text-center">
        <CardTitle className="text-2xl font-bold text-green-700 flex items-center justify-center gap-2">
          <LogIn className="w-6 h-6" />
          Ingresar como Jugador
        </CardTitle>
        <CardDescription className="text-blue-600">
          Usa tu email registrado y la contraseña que te proporcionamos
        </CardDescription>
      </CardHeader>

      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Error general */}
          {error && (
            <Alert variant="destructive">
              <AlertCircle className="w-4 h-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {/* Campo Email */}
          <div className="space-y-2">
            <Label htmlFor="email" className="text-sm font-medium text-green-700">
              Email
            </Label>
            <Input
              id="email"
              type="email"
              value={formData.email}
              onChange={e => handleInputChange('email', e.target.value)}
              placeholder="tu@email.com"
              className={`
                form-input transition-all
                ${fieldErrors.email ? 'border-red-300 focus:border-red-400 focus:ring-red-200' : ''}
              `}
              disabled={isLoading}
            />
            {fieldErrors.email && <p className="text-sm text-red-600">{fieldErrors.email}</p>}
          </div>

          {/* Campo Contraseña */}
          <div className="space-y-2">
            <Label htmlFor="password" className="text-sm font-medium text-green-700">
              Contraseña
            </Label>
            <div className="relative">
              <Input
                id="password"
                type={showPassword ? 'text' : 'password'}
                value={formData.password}
                onChange={e => handleInputChange('password', e.target.value)}
                placeholder="Tu contraseña"
                className={`
                  form-input pr-10 transition-all
                  ${
                    fieldErrors.password
                      ? 'border-red-300 focus:border-red-400 focus:ring-red-200'
                      : ''
                  }
                `}
                disabled={isLoading}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                disabled={isLoading}
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
            {fieldErrors.password && <p className="text-sm text-red-600">{fieldErrors.password}</p>}
          </div>

          {/* Botón Submit */}
          <Button
            type="submit"
            className="w-full bg-[#819067] hover:bg-[#0A400C] text-white"
            disabled={isLoading}
          >
            {isLoading ? (
              <div className="flex items-center gap-2">
                <LoadingSpinner size="sm" variant="white" />
                Ingresando...
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <LogIn className="w-4 h-4" />
                Ingresar
              </div>
            )}
          </Button>
        </form>

        {/* Información sobre contraseñas */}
        <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
          <h4 className="text-sm font-medium text-blue-800 mb-2">¿No sabes tu contraseña?</h4>
          <p className="text-xs text-blue-700">Jodete por boludo.</p>
        </div>
      </CardContent>
    </Card>
  )
}
