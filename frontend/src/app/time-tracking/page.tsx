'use client'

import { useState, useEffect } from 'react'
import { Play, Pause, Square, Clock, Calendar, BarChart3, Timer, Plus, Search, Filter } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { MainLayout } from '@/components/layout/main-layout'

const timeEntries = [
  {
    id: 1,
    task: 'Implementar autenticação JWT',
    project: 'Sistema E-commerce',
    user: 'João Silva',
    startTime: '2024-01-15T09:00:00',
    endTime: '2024-01-15T12:30:00',
    duration: 210, // minutes
    description: 'Desenvolvimento do sistema de login e middleware de autenticação',
    status: 'completed'
  },
  {
    id: 2,
    task: 'Design da página de checkout',
    project: 'Sistema E-commerce',
    user: 'Ana Oliveira',
    startTime: '2024-01-15T14:00:00',
    endTime: '2024-01-15T17:45:00',
    duration: 225,
    description: 'Criação de wireframes e protótipos da interface de checkout',
    status: 'completed'
  },
  {
    id: 3,
    task: 'Configurar pipeline CI/CD',
    project: 'App Mobile Banking',
    user: 'Pedro Costa',
    startTime: '2024-01-15T10:30:00',
    endTime: null,
    duration: 120,
    description: 'Configuração do GitHub Actions para deploy automático',
    status: 'running'
  },
  {
    id: 4,
    task: 'Testes unitários API',
    project: 'App Mobile Banking',
    user: 'Maria Santos',
    startTime: '2024-01-14T08:00:00',
    endTime: '2024-01-14T16:00:00',
    duration: 480,
    description: 'Implementação de testes para endpoints de usuário e autenticação',
    status: 'completed'
  },
  {
    id: 5,
    task: 'Dashboard de analytics',
    project: 'Portal Corporativo',
    user: 'Carlos Mendes',
    startTime: '2024-01-15T13:00:00',
    endTime: '2024-01-15T15:30:00',
    duration: 150,
    description: 'Desenvolvimento de gráficos e métricas em tempo real',
    status: 'completed'
  }
]

export default function TimeTrackingPage() {
  const [isRunning, setIsRunning] = useState(false)
  const [currentTime, setCurrentTime] = useState(0) // seconds
  const [selectedTask, setSelectedTask] = useState('')
  const [description, setDescription] = useState('')
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedProject, setSelectedProject] = useState('all')
  const [selectedUser, setSelectedUser] = useState('all')

  // Timer effect
  useEffect(() => {
    let interval: NodeJS.Timeout
    if (isRunning) {
      interval = setInterval(() => {
        setCurrentTime(time => time + 1)
      }, 1000)
    }
    return () => clearInterval(interval)
  }, [isRunning])

  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600)
    const minutes = Math.floor((seconds % 3600) / 60)
    const secs = seconds % 60
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
  }

  const formatDuration = (minutes: number) => {
    const hours = Math.floor(minutes / 60)
    const mins = minutes % 60
    if (hours > 0) {
      return `${hours}h ${mins}m`
    }
    return `${mins}m`
  }

  const formatDateTime = (dateString: string) => {
    return new Date(dateString).toLocaleString('pt-BR')
  }

  const startTimer = () => {
    setIsRunning(true)
  }

  const pauseTimer = () => {
    setIsRunning(false)
  }

  const stopTimer = () => {
    setIsRunning(false)
    setCurrentTime(0)
    setSelectedTask('')
    setDescription('')
  }

  const filteredEntries = timeEntries.filter(entry => {
    const matchesSearch = entry.task.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         entry.description.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesProject = selectedProject === 'all' || entry.project === selectedProject
    const matchesUser = selectedUser === 'all' || entry.user === selectedUser
    return matchesSearch && matchesProject && matchesUser
  })

  const totalHoursToday = timeEntries
    .filter(entry => entry.startTime.startsWith('2024-01-15'))
    .reduce((sum, entry) => sum + entry.duration, 0)

  const totalHoursWeek = timeEntries.reduce((sum, entry) => sum + entry.duration, 0)

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase()
  }

  return (
    <MainLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold">Time Tracking</h1>
            <p className="text-muted-foreground">
              Controle seu tempo e produtividade
            </p>
          </div>
          <Button className="flex items-center gap-2">
            <Plus className="h-4 w-4" />
            Nova Entrada
          </Button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Hoje</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatDuration(totalHoursToday)}</div>
              <p className="text-xs text-muted-foreground">
                Tempo trabalhado
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Esta Semana</CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatDuration(totalHoursWeek)}</div>
              <p className="text-xs text-muted-foreground">
                Total semanal
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Sessões Ativas</CardTitle>
              <Timer className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {timeEntries.filter(e => e.status === 'running').length}
              </div>
              <p className="text-xs text-muted-foreground">
                Em andamento
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Produtividade</CardTitle>
              <BarChart3 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">92%</div>
              <p className="text-xs text-muted-foreground">
                Meta semanal
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Timer Section */}
        <Card className="border-2 border-primary/20">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Timer className="h-5 w-5" />
              Timer de Trabalho
            </CardTitle>
            <CardDescription>
              Inicie o timer para rastrear seu tempo de trabalho
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Current Timer Display */}
            <div className="text-center">
              <div className="text-6xl font-mono font-bold text-primary mb-4">
                {formatTime(currentTime)}
              </div>
              {isRunning && (
                <Badge variant="secondary" className="bg-green-100 text-green-800">
                  <div className="w-2 h-2 bg-green-500 rounded-full mr-2 animate-pulse"></div>
                  Em execução
                </Badge>
              )}
            </div>

            {/* Task Selection */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Tarefa</label>
                <select
                  value={selectedTask}
                  onChange={(e) => setSelectedTask(e.target.value)}
                  className="w-full px-3 py-2 border border-input bg-background rounded-md text-sm"
                  disabled={isRunning}
                >
                  <option value="">Selecione uma tarefa</option>
                  <option value="Implementar autenticação JWT">Implementar autenticação JWT</option>
                  <option value="Design da página de checkout">Design da página de checkout</option>
                  <option value="Configurar pipeline CI/CD">Configurar pipeline CI/CD</option>
                  <option value="Testes unitários API">Testes unitários API</option>
                  <option value="Dashboard de analytics">Dashboard de analytics</option>
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Descrição</label>
                <Input
                  placeholder="Descreva o que está fazendo..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  disabled={isRunning}
                />
              </div>
            </div>

            {/* Timer Controls */}
            <div className="flex justify-center gap-4">
              {!isRunning ? (
                <Button 
                  onClick={startTimer} 
                  size="lg" 
                  className="flex items-center gap-2"
                  disabled={!selectedTask}
                >
                  <Play className="h-5 w-5" />
                  Iniciar
                </Button>
              ) : (
                <Button 
                  onClick={pauseTimer} 
                  size="lg" 
                  variant="outline"
                  className="flex items-center gap-2"
                >
                  <Pause className="h-5 w-5" />
                  Pausar
                </Button>
              )}
              
              <Button 
                onClick={stopTimer} 
                size="lg" 
                variant="destructive"
                className="flex items-center gap-2"
                disabled={currentTime === 0}
              >
                <Square className="h-5 w-5" />
                Parar
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <Input
              placeholder="Buscar entradas de tempo..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          <div className="flex gap-2">
            <select
              value={selectedProject}
              onChange={(e) => setSelectedProject(e.target.value)}
              className="px-3 py-2 border border-input bg-background rounded-md text-sm"
            >
              <option value="all">Todos os Projetos</option>
              <option value="Sistema E-commerce">Sistema E-commerce</option>
              <option value="App Mobile Banking">App Mobile Banking</option>
              <option value="Portal Corporativo">Portal Corporativo</option>
            </select>
            <select
              value={selectedUser}
              onChange={(e) => setSelectedUser(e.target.value)}
              className="px-3 py-2 border border-input bg-background rounded-md text-sm"
            >
              <option value="all">Todos os Usuários</option>
              <option value="João Silva">João Silva</option>
              <option value="Ana Oliveira">Ana Oliveira</option>
              <option value="Pedro Costa">Pedro Costa</option>
              <option value="Maria Santos">Maria Santos</option>
              <option value="Carlos Mendes">Carlos Mendes</option>
            </select>
            <Button variant="outline" size="icon">
              <Filter className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Time Entries List */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">Entradas de Tempo Recentes</h3>
          
          {filteredEntries.map((entry) => (
            <Card key={entry.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div className="flex-1 space-y-2">
                    <div className="flex items-center gap-3">
                      <h4 className="font-semibold">{entry.task}</h4>
                      <Badge variant="outline">{entry.project}</Badge>
                      {entry.status === 'running' && (
                        <Badge className="bg-green-100 text-green-800">
                          <div className="w-2 h-2 bg-green-500 rounded-full mr-2 animate-pulse"></div>
                          Em execução
                        </Badge>
                      )}
                    </div>
                    
                    <p className="text-sm text-muted-foreground">
                      {entry.description}
                    </p>
                    
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <Avatar className="h-5 w-5">
                          <AvatarFallback className="text-xs bg-primary text-primary-foreground">
                            {getInitials(entry.user)}
                          </AvatarFallback>
                        </Avatar>
                        <span>{entry.user}</span>
                      </div>
                      
                      <div className="flex items-center gap-1">
                        <Clock className="h-4 w-4" />
                        <span>{formatDateTime(entry.startTime)}</span>
                        {entry.endTime && (
                          <>
                            <span>-</span>
                            <span>{formatDateTime(entry.endTime)}</span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                  
                  <div className="text-right">
                    <div className="text-2xl font-bold text-primary">
                      {formatDuration(entry.duration)}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      Duração
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {filteredEntries.length === 0 && (
          <div className="text-center py-12">
            <Timer className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">Nenhuma entrada encontrada</h3>
            <p className="text-muted-foreground mb-4">
              Inicie o timer ou ajuste os filtros para ver as entradas de tempo.
            </p>
            <Button>
              <Play className="h-4 w-4 mr-2" />
              Iniciar Timer
            </Button>
          </div>
        )}
      </div>
    </MainLayout>
  )
}

