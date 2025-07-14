'use client'

import { useState } from 'react'
import { Plus, Search, Filter, MoreHorizontal, Calendar, User, Clock, Flag, CheckCircle2, Circle, AlertCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { MainLayout } from '@/components/layout/main-layout'

const tasks = [
  {
    id: 1,
    title: 'Implementar autenticação JWT',
    description: 'Desenvolver sistema completo de autenticação com JWT tokens',
    status: 'todo',
    priority: 'Alta',
    project: 'Sistema E-commerce',
    assignee: 'João Silva',
    dueDate: '2024-01-20',
    estimatedHours: 8,
    tags: ['Backend', 'Segurança'],
    progress: 0
  },
  {
    id: 2,
    title: 'Design da página de checkout',
    description: 'Criar interface moderna e intuitiva para finalização de compras',
    status: 'in-progress',
    priority: 'Alta',
    project: 'Sistema E-commerce',
    assignee: 'Ana Oliveira',
    dueDate: '2024-01-18',
    estimatedHours: 12,
    tags: ['Frontend', 'UX/UI'],
    progress: 65
  },
  {
    id: 3,
    title: 'Configurar pipeline CI/CD',
    description: 'Automatizar deploy e testes usando GitHub Actions',
    status: 'in-progress',
    priority: 'Média',
    project: 'App Mobile Banking',
    assignee: 'Pedro Costa',
    dueDate: '2024-01-22',
    estimatedHours: 6,
    tags: ['DevOps', 'Automação'],
    progress: 30
  },
  {
    id: 4,
    title: 'Testes unitários API',
    description: 'Implementar cobertura de testes para todos os endpoints',
    status: 'todo',
    priority: 'Média',
    project: 'App Mobile Banking',
    assignee: 'Maria Santos',
    dueDate: '2024-01-25',
    estimatedHours: 16,
    tags: ['Backend', 'Testes'],
    progress: 0
  },
  {
    id: 5,
    title: 'Otimização de performance',
    description: 'Melhorar tempo de carregamento das páginas principais',
    status: 'done',
    priority: 'Alta',
    project: 'Portal Corporativo',
    assignee: 'Carlos Mendes',
    dueDate: '2024-01-15',
    estimatedHours: 10,
    tags: ['Frontend', 'Performance'],
    progress: 100
  },
  {
    id: 6,
    title: 'Integração com gateway de pagamento',
    description: 'Conectar sistema com Stripe e PayPal',
    status: 'review',
    priority: 'Alta',
    project: 'Sistema E-commerce',
    assignee: 'Beatriz Lima',
    dueDate: '2024-01-19',
    estimatedHours: 14,
    tags: ['Backend', 'Integração'],
    progress: 90
  },
  {
    id: 7,
    title: 'Dashboard de analytics',
    description: 'Criar painel com métricas e relatórios em tempo real',
    status: 'todo',
    priority: 'Baixa',
    project: 'Portal Corporativo',
    assignee: 'João Silva',
    dueDate: '2024-01-30',
    estimatedHours: 20,
    tags: ['Frontend', 'Analytics'],
    progress: 0
  },
  {
    id: 8,
    title: 'Documentação da API',
    description: 'Criar documentação completa usando Swagger',
    status: 'in-progress',
    priority: 'Baixa',
    project: 'App Mobile Banking',
    assignee: 'Ana Oliveira',
    dueDate: '2024-01-28',
    estimatedHours: 8,
    tags: ['Documentação', 'API'],
    progress: 45
  }
]

const statusConfig = {
  'todo': {
    title: 'A Fazer',
    color: 'bg-gray-100 border-gray-300',
    icon: Circle,
    badgeColor: 'bg-gray-100 text-gray-800'
  },
  'in-progress': {
    title: 'Em Progresso',
    color: 'bg-blue-50 border-blue-300',
    icon: Clock,
    badgeColor: 'bg-blue-100 text-blue-800'
  },
  'review': {
    title: 'Em Revisão',
    color: 'bg-yellow-50 border-yellow-300',
    icon: AlertCircle,
    badgeColor: 'bg-yellow-100 text-yellow-800'
  },
  'done': {
    title: 'Concluído',
    color: 'bg-green-50 border-green-300',
    icon: CheckCircle2,
    badgeColor: 'bg-green-100 text-green-800'
  }
}

const priorityColors = {
  'Alta': 'bg-red-100 text-red-800',
  'Média': 'bg-yellow-100 text-yellow-800',
  'Baixa': 'bg-green-100 text-green-800'
}

export default function TasksPage() {
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedProject, setSelectedProject] = useState('all')
  const [selectedPriority, setSelectedPriority] = useState('all')

  const filteredTasks = tasks.filter(task => {
    const matchesSearch = task.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         task.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         task.assignee.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesProject = selectedProject === 'all' || task.project === selectedProject
    const matchesPriority = selectedPriority === 'all' || task.priority === selectedPriority
    return matchesSearch && matchesProject && matchesPriority
  })

  const getTasksByStatus = (status: string) => {
    return filteredTasks.filter(task => task.status === status)
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR')
  }

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase()
  }

  const isOverdue = (dueDate: string) => {
    return new Date(dueDate) < new Date()
  }

  return (
    <MainLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold">Tarefas</h1>
            <p className="text-muted-foreground">
              Gerencie tarefas com quadro Kanban
            </p>
          </div>
          <Button className="flex items-center gap-2">
            <Plus className="h-4 w-4" />
            Nova Tarefa
          </Button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total de Tarefas</CardTitle>
              <Circle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{tasks.length}</div>
              <p className="text-xs text-muted-foreground">
                +2 novas hoje
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Em Progresso</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {tasks.filter(t => t.status === 'in-progress').length}
              </div>
              <p className="text-xs text-muted-foreground">
                Ativas no momento
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Concluídas</CardTitle>
              <CheckCircle2 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {tasks.filter(t => t.status === 'done').length}
              </div>
              <p className="text-xs text-muted-foreground">
                Esta semana
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Atrasadas</CardTitle>
              <AlertCircle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">
                {tasks.filter(t => t.status !== 'done' && isOverdue(t.dueDate)).length}
              </div>
              <p className="text-xs text-muted-foreground">
                Precisam atenção
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <Input
              placeholder="Buscar tarefas..."
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
              value={selectedPriority}
              onChange={(e) => setSelectedPriority(e.target.value)}
              className="px-3 py-2 border border-input bg-background rounded-md text-sm"
            >
              <option value="all">Todas as Prioridades</option>
              <option value="Alta">Alta</option>
              <option value="Média">Média</option>
              <option value="Baixa">Baixa</option>
            </select>
            <Button variant="outline" size="icon">
              <Filter className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Kanban Board */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {Object.entries(statusConfig).map(([status, config]) => {
            const statusTasks = getTasksByStatus(status)
            const StatusIcon = config.icon
            
            return (
              <div key={status} className="space-y-4">
                {/* Column Header */}
                <div className={`p-4 rounded-lg border-2 border-dashed ${config.color}`}>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <StatusIcon className="h-5 w-5" />
                      <h3 className="font-semibold">{config.title}</h3>
                    </div>
                    <Badge variant="secondary" className="text-xs">
                      {statusTasks.length}
                    </Badge>
                  </div>
                </div>

                {/* Tasks */}
                <div className="space-y-3">
                  {statusTasks.map((task) => (
                    <Card key={task.id} className="hover:shadow-md transition-shadow cursor-pointer">
                      <CardHeader className="pb-3">
                        <div className="flex justify-between items-start">
                          <div className="space-y-1">
                            <CardTitle className="text-sm font-medium leading-tight">
                              {task.title}
                            </CardTitle>
                            <CardDescription className="text-xs line-clamp-2">
                              {task.description}
                            </CardDescription>
                          </div>
                          <Button variant="ghost" size="icon" className="h-6 w-6">
                            <MoreHorizontal className="h-3 w-3" />
                          </Button>
                        </div>
                      </CardHeader>
                      
                      <CardContent className="pt-0 space-y-3">
                        {/* Priority and Project */}
                        <div className="flex gap-2">
                          <Badge className={priorityColors[task.priority as keyof typeof priorityColors]} variant="secondary">
                            <Flag className="h-3 w-3 mr-1" />
                            {task.priority}
                          </Badge>
                        </div>

                        {/* Project */}
                        <div className="text-xs text-muted-foreground">
                          📋 {task.project}
                        </div>

                        {/* Progress Bar */}
                        {task.progress > 0 && (
                          <div className="space-y-1">
                            <div className="flex justify-between text-xs">
                              <span>Progresso</span>
                              <span>{task.progress}%</span>
                            </div>
                            <div className="w-full bg-gray-200 rounded-full h-1.5">
                              <div 
                                className="bg-blue-600 h-1.5 rounded-full transition-all"
                                style={{ width: `${task.progress}%` }}
                              ></div>
                            </div>
                          </div>
                        )}

                        {/* Tags */}
                        <div className="flex flex-wrap gap-1">
                          {task.tags.map((tag, index) => (
                            <Badge key={index} variant="outline" className="text-xs">
                              {tag}
                            </Badge>
                          ))}
                        </div>

                        {/* Footer */}
                        <div className="flex items-center justify-between pt-2 border-t">
                          <div className="flex items-center gap-2">
                            <Avatar className="h-6 w-6">
                              <AvatarFallback className="text-xs bg-primary text-primary-foreground">
                                {getInitials(task.assignee)}
                              </AvatarFallback>
                            </Avatar>
                            <span className="text-xs text-muted-foreground">
                              {task.assignee}
                            </span>
                          </div>
                          
                          <div className="flex items-center gap-1 text-xs text-muted-foreground">
                            <Calendar className="h-3 w-3" />
                            <span className={isOverdue(task.dueDate) && task.status !== 'done' ? 'text-red-600 font-medium' : ''}>
                              {formatDate(task.dueDate)}
                            </span>
                          </div>
                        </div>

                        {/* Estimated Hours */}
                        <div className="flex items-center gap-1 text-xs text-muted-foreground">
                          <Clock className="h-3 w-3" />
                          <span>{task.estimatedHours}h estimadas</span>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                  
                  {/* Add Task Button */}
                  <Button 
                    variant="ghost" 
                    className="w-full h-12 border-2 border-dashed border-gray-300 hover:border-gray-400"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Adicionar Tarefa
                  </Button>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </MainLayout>
  )
}

