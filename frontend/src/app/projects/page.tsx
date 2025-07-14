'use client'

import { useState } from 'react'
import { Plus, Search, Filter, MoreHorizontal, Calendar, Users, Target, TrendingUp } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { MainLayout } from '@/components/layout/main-layout'

const projects = [
  {
    id: 1,
    name: 'Sistema de E-commerce',
    description: 'Desenvolvimento de plataforma completa de e-commerce com integração de pagamentos',
    company: 'TechCorp',
    status: 'Em Andamento',
    progress: 75,
    startDate: '2024-01-15',
    endDate: '2024-02-15',
    budget: 50000,
    spent: 37500,
    team: [
      { name: 'João Silva', avatar: '/avatars/joao.jpg' },
      { name: 'Maria Santos', avatar: '/avatars/maria.jpg' },
      { name: 'Pedro Costa', avatar: '/avatars/pedro.jpg' },
    ],
    tasks: { total: 24, completed: 18, inProgress: 4, pending: 2 },
    priority: 'Alta'
  },
  {
    id: 2,
    name: 'App Mobile Banking',
    description: 'Aplicativo móvel para serviços bancários com autenticação biométrica',
    company: 'FinanceInc',
    status: 'Em Revisão',
    progress: 90,
    startDate: '2023-12-01',
    endDate: '2024-01-30',
    budget: 75000,
    spent: 67500,
    team: [
      { name: 'Ana Oliveira', avatar: '/avatars/ana.jpg' },
      { name: 'Carlos Mendes', avatar: '/avatars/carlos.jpg' },
    ],
    tasks: { total: 32, completed: 29, inProgress: 2, pending: 1 },
    priority: 'Alta'
  },
  {
    id: 3,
    name: 'Portal do Cliente',
    description: 'Portal web para clientes acessarem informações e serviços',
    company: 'ServicePro',
    status: 'Planejamento',
    progress: 25,
    startDate: '2024-02-01',
    endDate: '2024-03-01',
    budget: 30000,
    spent: 7500,
    team: [
      { name: 'Lucas Ferreira', avatar: '/avatars/lucas.jpg' },
      { name: 'Beatriz Lima', avatar: '/avatars/beatriz.jpg' },
    ],
    tasks: { total: 16, completed: 4, inProgress: 3, pending: 9 },
    priority: 'Média'
  },
  {
    id: 4,
    name: 'Sistema de CRM',
    description: 'Customer Relationship Management com automação de vendas',
    company: 'SalesForce Pro',
    status: 'Concluído',
    progress: 100,
    startDate: '2023-10-01',
    endDate: '2023-12-15',
    budget: 40000,
    spent: 38000,
    team: [
      { name: 'Rafael Santos', avatar: '/avatars/rafael.jpg' },
      { name: 'Camila Rocha', avatar: '/avatars/camila.jpg' },
    ],
    tasks: { total: 28, completed: 28, inProgress: 0, pending: 0 },
    priority: 'Baixa'
  }
]

const statusColors = {
  'Em Andamento': 'bg-blue-100 text-blue-800',
  'Em Revisão': 'bg-yellow-100 text-yellow-800',
  'Planejamento': 'bg-gray-100 text-gray-800',
  'Concluído': 'bg-green-100 text-green-800',
  'Pausado': 'bg-red-100 text-red-800'
}

const priorityColors = {
  'Alta': 'bg-red-100 text-red-800',
  'Média': 'bg-yellow-100 text-yellow-800',
  'Baixa': 'bg-green-100 text-green-800'
}

export default function ProjectsPage() {
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedStatus, setSelectedStatus] = useState('all')

  const filteredProjects = projects.filter(project => {
    const matchesSearch = project.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         project.company.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = selectedStatus === 'all' || project.status === selectedStatus
    return matchesSearch && matchesStatus
  })

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value)
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR')
  }

  return (
    <MainLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold">Projetos</h1>
            <p className="text-muted-foreground">
              Gerencie todos os projetos da sua empresa
            </p>
          </div>
          <Button className="flex items-center gap-2">
            <Plus className="h-4 w-4" />
            Novo Projeto
          </Button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total de Projetos</CardTitle>
              <Target className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{projects.length}</div>
              <p className="text-xs text-muted-foreground">
                +2 novos este mês
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Em Andamento</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {projects.filter(p => p.status === 'Em Andamento').length}
              </div>
              <p className="text-xs text-muted-foreground">
                75% de progresso médio
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Orçamento Total</CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {formatCurrency(projects.reduce((sum, p) => sum + p.budget, 0))}
              </div>
              <p className="text-xs text-muted-foreground">
                {formatCurrency(projects.reduce((sum, p) => sum + p.spent, 0))} gastos
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Equipe Total</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {projects.reduce((sum, p) => sum + p.team.length, 0)}
              </div>
              <p className="text-xs text-muted-foreground">
                Membros ativos
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <Input
              placeholder="Buscar projetos..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          <div className="flex gap-2">
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="px-3 py-2 border border-input bg-background rounded-md text-sm"
            >
              <option value="all">Todos os Status</option>
              <option value="Em Andamento">Em Andamento</option>
              <option value="Em Revisão">Em Revisão</option>
              <option value="Planejamento">Planejamento</option>
              <option value="Concluído">Concluído</option>
            </select>
            <Button variant="outline" size="icon">
              <Filter className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Projects Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {filteredProjects.map((project) => (
            <Card key={project.id} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div className="space-y-1">
                    <CardTitle className="text-lg">{project.name}</CardTitle>
                    <CardDescription>{project.company}</CardDescription>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge className={statusColors[project.status as keyof typeof statusColors]}>
                      {project.status}
                    </Badge>
                    <Button variant="ghost" size="icon">
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
                <p className="text-sm text-muted-foreground">{project.description}</p>
              </CardHeader>
              
              <CardContent className="space-y-4">
                {/* Progress */}
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Progresso</span>
                    <span>{project.progress}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-primary h-2 rounded-full transition-all"
                      style={{ width: `${project.progress}%` }}
                    />
                  </div>
                </div>

                {/* Tasks Summary */}
                <div className="grid grid-cols-4 gap-2 text-center">
                  <div className="space-y-1">
                    <div className="text-lg font-semibold text-blue-600">{project.tasks.total}</div>
                    <div className="text-xs text-muted-foreground">Total</div>
                  </div>
                  <div className="space-y-1">
                    <div className="text-lg font-semibold text-green-600">{project.tasks.completed}</div>
                    <div className="text-xs text-muted-foreground">Concluídas</div>
                  </div>
                  <div className="space-y-1">
                    <div className="text-lg font-semibold text-yellow-600">{project.tasks.inProgress}</div>
                    <div className="text-xs text-muted-foreground">Em Progresso</div>
                  </div>
                  <div className="space-y-1">
                    <div className="text-lg font-semibold text-gray-600">{project.tasks.pending}</div>
                    <div className="text-xs text-muted-foreground">Pendentes</div>
                  </div>
                </div>

                {/* Budget */}
                <div className="flex justify-between items-center">
                  <div className="space-y-1">
                    <div className="text-sm text-muted-foreground">Orçamento</div>
                    <div className="font-semibold">{formatCurrency(project.budget)}</div>
                  </div>
                  <div className="space-y-1 text-right">
                    <div className="text-sm text-muted-foreground">Gasto</div>
                    <div className="font-semibold">{formatCurrency(project.spent)}</div>
                  </div>
                </div>

                {/* Timeline */}
                <div className="flex justify-between items-center text-sm">
                  <div className="flex items-center gap-1">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <span>{formatDate(project.startDate)}</span>
                  </div>
                  <div className="text-muted-foreground">até</div>
                  <div>{formatDate(project.endDate)}</div>
                </div>

                {/* Team and Priority */}
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    <div className="flex -space-x-2">
                      {project.team.slice(0, 3).map((member, index) => (
                        <Avatar key={index} className="h-8 w-8 border-2 border-background">
                          <AvatarFallback className="text-xs">
                            {member.name.split(' ').map(n => n[0]).join('')}
                          </AvatarFallback>
                        </Avatar>
                      ))}
                      {project.team.length > 3 && (
                        <div className="h-8 w-8 rounded-full bg-muted border-2 border-background flex items-center justify-center text-xs">
                          +{project.team.length - 3}
                        </div>
                      )}
                    </div>
                  </div>
                  <Badge className={priorityColors[project.priority as keyof typeof priorityColors]}>
                    {project.priority}
                  </Badge>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {filteredProjects.length === 0 && (
          <div className="text-center py-12">
            <Target className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">Nenhum projeto encontrado</h3>
            <p className="text-muted-foreground mb-4">
              Tente ajustar os filtros ou criar um novo projeto.
            </p>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Criar Primeiro Projeto
            </Button>
          </div>
        )}
      </div>
    </MainLayout>
  )
}

