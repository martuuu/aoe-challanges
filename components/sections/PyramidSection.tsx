import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { UserPlus, Crown } from 'lucide-react'

interface PyramidSectionProps {
  pyramid: { 1: string[]; 2: string[]; 3: string[]; 4: string[] }
  setPyramid: React.Dispatch<
    React.SetStateAction<{ 1: string[]; 2: string[]; 3: string[]; 4: string[] }>
  >
  userForm: { name: string; email: string }
  setUserForm: React.Dispatch<React.SetStateAction<{ name: string; email: string }>>
  isUserDialogOpen: boolean
  setIsUserDialogOpen: React.Dispatch<React.SetStateAction<boolean>>
  addUser: () => void
}

const levelInfo = {
  1: {
    name: 'El lechero',
    icon: Crown,
    badge: 'default',
    bgClass: 'bg-[#819067] text-white',
    cardColor: 'bg-gradient-to-br from-[#819067] to-[#B1AB86] text-white',
    streak: '🔥 5/5',
  },
  2: {
    name: 'Protesis Ok',
    icon: Crown,
    badge: 'secondary',
    bgClass: 'bg-[#B1AB86] text-[#0A400C]',
    cardColor: 'bg-gradient-to-br from-[#B1AB86] to-[#D2C1B6] text-[#0A400C]',
    streak: '⚡ 4/5',
  },
  3: {
    name: 'Construyo mas atras',
    icon: Crown,
    badge: 'outline',
    bgClass: 'border-blue-200 bg-blue-50 text-blue-700',
    cardColor: 'bg-gradient-to-br from-[#D2C1B6] to-[#F9F3EF] text-[#1B3C53]',
    streak: '📈 3/5',
  },
  4: {
    name: 'manco juga a otra cosa',
    icon: Crown,
    badge: 'soft',
    bgClass: 'border-orange-200 bg-orange-50 text-orange-700',
    cardColor: 'bg-gradient-to-br from-[#F79B72] to-[#F5865A] text-white',
    streak: '💀 2/5',
  },
} as const

export function PyramidSection({
  pyramid,
  setPyramid,
  userForm,
  setUserForm,
  isUserDialogOpen,
  setIsUserDialogOpen,
  addUser,
}: PyramidSectionProps) {
  return (
    <Card className="shadow-card">
      {}
      <CardHeader className="bg-gradient-to-r from-[#819067] to-[#B1AB86] text-white rounded-t-xl">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <CardTitle className="flex items-center gap-2 text-lg sm:text-xl text-white">
              <UserPlus className="w-5 h-5 sm:w-6 sm:h-6" />
              Ranking 2025
            </CardTitle>
            <CardDescription className="text-white text-sm">
              Los jugadores pueden desafiar a su mismo nivel o 1 nivel superior. Estan obligados a aceptar el desafío de los niveles inferiores.
            </CardDescription>
          </div>

          {/* Botón agregar jugador */}
          <Dialog open={isUserDialogOpen} onOpenChange={setIsUserDialogOpen}>
            <DialogTrigger asChild>
              <Button
                variant="outline"
                size="sm"
                className="sm:size-lg w-full sm:w-auto bg-white/10 border-white/20 text-white hover:bg-white/20 hover:text-white"
              >
                <UserPlus className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
                Agregar Jugador
              </Button>
            </DialogTrigger>
            <DialogContent className="mx-4 sm:mx-0">
              <DialogHeader>
                <DialogTitle>Agregar Nuevo Jugador</DialogTitle>
                <DialogDescription>
                  Los nuevos jugadores empiezan en el nivel Guerreros
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Input
                    id="name"
                    value={userForm.name}
                    onChange={e => setUserForm(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="Ingresa tu nombre"
                    className="form-input"
                  />
                </div>
                <div>
                  <Input
                    id="email"
                    type="email"
                    value={userForm.email}
                    onChange={e => setUserForm(prev => ({ ...prev, email: e.target.value }))}
                    placeholder="tu@email.com"
                    className="form-input"
                  />
                </div>
                <Button
                  onClick={addUser}
                  disabled={!userForm.name || !userForm.email}
                  className="w-full"
                >
                  Agregar Jugador
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </CardHeader>
      <CardContent className="p-6 sm:p-8 bg-gradient-to-br from-green-50/30 to-blue-50/30">
        <div className="space-y-8 sm:space-y-12">
          {Object.entries(pyramid).map(([level, players]) => {
            const levelNum = Number(level) as keyof typeof levelInfo
            const info = levelInfo[levelNum]
            const IconComponent = info.icon

            return (
              <div key={level} className="flex flex-col items-center space-y-4 sm:space-y-6">
                {/* Header del nivel */}
                <div className="text-center space-y-2">
                  <div className="flex items-center justify-center gap-3">
                    <Badge
                      variant={info.badge}
                      className={`text-sm sm:text-base px-3 sm:px-4 py-2 shadow-sm hover:shadow-md transition-all duration-300 ${info.bgClass}`}
                    >
                      <IconComponent className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
                      {info.name}
                    </Badge>
                  </div>
                  <div className="text-xs sm:text-sm text-blue-600 font-medium">
                    Racha promedio: {info.streak}
                  </div>
                </div>

                {/* Contenedor de jugadores */}
                <div className="flex flex-wrap justify-center gap-3 sm:gap-4">
                  {players.map((player, index) => (
                    <div
                      key={player}
                      className={`
                        ${info.cardColor}
                        px-4 sm:px-6 py-3 sm:py-4 
                        rounded-xl font-semibold text-sm sm:text-base
                        shadow-lg hover:shadow-xl transition-all duration-300 
                        hover:-translate-y-1 hover:scale-105
                        border border-white/20
                        min-w-[100px] text-center
                      `}
                    >
                      {level === '1' && <span className="mr-2 text-xl">👑</span>}
                      {player}
                    </div>
                  ))}
                </div>
              </div>
            )
          })}
        </div>
      </CardContent>
    </Card>
  )
}
