'use client'

import { useState } from 'react'
import { Plus, Search, Filter, MoreHorizontal, FileText, Calendar, DollarSign, User, Building, CheckCircle, Clock, AlertTriangle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { MainLayout } from '@/components/layout/main-layout'

const contracts = [
  {
    id: 1,
    title: 'Desenvolvimento Sistema E-commerce',
    client: 'TechCorp',
    value: 85000,
    startDate: '2024-01-01',
    endDate: '2024-06-30',
    status: 'active',
    progress: 65,
    type: 'Desenvolvimento',
    manager: 'João Silva',
    description: 'Desenvolvimento completo de plataforma de e-commerce com integração de pagamentos',
    milestones: [
      { name: 'Análise e Planejamento', completed: true, dueDate: '2024-01-15' },
      { name: 'Desenvolvimento Backend', completed: true, dueDate: '2024-03-01' },
      { name: 'Desenvolvimento Frontend', completed: false, dueDate: '2024-04-15' },
      { name: 'Testes e Deploy', completed: false, dueDate: '2024-06-01' }
    ]
  },
  {
    id: 2,
    title: 'App Mobile Banking',
    client: 'FinanceInc',
    value: 120000,
    startDate: '2023-10-01',
    endDate: '2024-03-31',
    status: 'active',
    progress: 85,
    type: 'Mobile',
    manager: 'Maria Santos',
    description: 'Aplicativo mobile para serviços bancários com autenticação biométrica',
    milestones: [
      { name: 'Design UX/UI', completed: true, dueDate: '2023-11-15' },
      { name: 'Desenvolvimento iOS', completed: true, dueDate: '2024-01-15' },
      { name: 'Desenvolvimento Android', completed: true, dueDate: '2024-02-01' },
      { name: 'Testes e Publicação', completed: false, dueDate: '2024-03-15' }
    ]
  },
  {
    id: 3,
    title: 'Portal Corporativo',
    client: 'ServicePro',
    value: 42000,
    startDate: '2024-02-01',
    endDate: '2024-05-31',
    status: 'pending',
    progress: 0,
    type: 'Web',
    manager: 'Pedro Costa',
    description: 'Portal interno para gestão de funcionários e processos corporativos',
    milestones: [
      { name: 'Levantamento de Requisitos', completed: false, dueDate: '2024-02-15' },
      { name: 'Arquitetura do Sistema', completed: false, dueDate: '2024-03-01' },
      { name: 'Desenvolvimento', completed: false, dueDate: '2024-04-30' },
      { name: 'Implantação', completed: false, dueDate: '2024-05-31' }
    ]
  },
  {
    id: 4,
    title: 'Sistema CRM Personalizado',
    client: 'SalesForce Pro',
    value: 18000,
    startDate: '2023-11-01',
    endDate: '2024-01-31',
    status: 'completed',
    progress: 100,
    type: 'CRM',
    manager: 'Ana Oliveira',
    description: 'Sistema de gestão de relacionamento com clientes com automação de vendas',
    milestones: [
      { name: 'Análise de Requisitos', completed: true, dueDate: '2023-11-15' },
      { name: 'Desenvolvimento Core', completed: true, dueDate: '2023-12-15' },
      { name: 'Integrações', completed: true, dueDate: '2024-01-10' },
      { name: 'Entrega Final', completed: true, dueDate: '2024-01-31' }
    ]
  },
  {
    id: 5,
    title: 'Consultoria em DevOps',
    client: 'StartupTech',
    value: 7500,
    startDate: '2023-12-01',
    endDate: '2024-02-29',
    status: 'cancelled',
    progress: 25,
    type: 'Consultoria',
    manager: 'Carlos Mendes',
    description: 'Implementação de práticas DevOps e automação de deploy',
    milestones: [
      { name: 'Auditoria Atual', completed: true, dueDate: '2023-12-15' },
      { name: 'Plano de Implementação', completed: false, dueDate: '2024-01-15' },
      { name: 'Configuração CI/CD', completed: false, dueDate: '2024-02-15' },
      { name: 'Treinamento Equipe', completed: false, dueDate: '2024-02-29' }
    ]
  }
]

const statusConfig = {
  'active': {
    label: 'Ativo',
    color: 'bg-green-100 text-green-800',
    icon: CheckCircle
  },
  'pending': {
    label: 'Pendente',
    color: 'bg-yellow-100 text-yellow-800',
    icon: Clock
  },
  'completed': {
    label: 'Concluído',
    color: 'bg-blue-100 text-blue-800',
    icon: CheckCircle
  },
  'cancelled': {
    label: 'Cancelado',
    color: 'bg-red-100 text-red-800',
    icon: AlertTriangle
  }
}

const typeColors = {
  'Desenvolvimento': 'bg-purple-100 text-purple-800',
  'Mobile': 'bg-blue-100 text-blue-800',
  'Web': 'bg-green-100 text-green-800',
  'CRM': 'bg-orange-100 text-orange-800',
  'Consultoria': 'bg-indigo-100 text-indigo-800'
}

export default function ContractsPage() {
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedStatus, setSelectedStatus] = useState('all')
  const [selectedType, setSelectedType] = useState('all')

  const filteredContracts = contracts.filter(contract => {
    const matchesSearch = contract.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         contract.client.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         contract.description.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = selectedStatus === 'all' || contract.status === selectedStatus
    const matchesType = selectedType === 'all' || contract.type === selectedType
    return matchesSearch && matchesStatus && matchesType
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

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase()
  }

  const totalValue = contracts.reduce((sum, contract) => sum + contract.value, 0)
  const activeContracts = contracts.filter(c => c.status === 'active').length
  const completedContracts = contracts.filter(c => c.status === 'completed').length

  return (
    <MainLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold">Contratos</h1>
            <p className="text-muted-foreground">
              Gerencie contratos e acompanhe progresso
            </p>
          </div>
          <Button className="flex items-center gap-2">
            <Plus className="h-4 w-4" />
            Novo Contrato
          </Button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total de Contratos</CardTitle>
              <FileText className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{contracts.length}</div>
              <p className="text-xs text-muted-foreground">
                +1 novo este mês
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Contratos Ativos</CardTitle>
              <CheckCircle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{activeContracts}</div>
              <p className="text-xs text-muted-foreground">
                Em andamento
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Concluídos</CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{completedContracts}</div>
              <p className="text-xs text-muted-foreground">
                Finalizados
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Valor Total</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatCurrency(totalValue)}</div>
              <p className="text-xs text-muted-foreground">
                Receita total
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <Input
              placeholder="Buscar contratos..."
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
              <option value="active">Ativo</option>
              <option value="pending">Pendente</option>
              <option value="completed">Concluído</option>
              <option value="cancelled">Cancelado</option>
            </select>
            <select
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value)}
              className="px-3 py-2 border border-input bg-background rounded-md text-sm"
            >
              <option value="all">Todos os Tipos</option>
              <option value="Desenvolvimento">Desenvolvimento</option>
              <option value="Mobile">Mobile</option>
              <option value="Web">Web</option>
              <option value="CRM">CRM</option>
              <option value="Consultoria">Consultoria</option>
            </select>
            <Button variant="outline" size="icon">
              <Filter className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Contracts Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {filteredContracts.map((contract) => {
            const StatusIcon = statusConfig[contract.status as keyof typeof statusConfig].icon
            
            return (
              <Card key={contract.id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div className="space-y-1">
                      <CardTitle className="text-lg">{contract.title}</CardTitle>
                      <CardDescription className="flex items-center gap-2">
                        <Building className="h-4 w-4" />
                        {contract.client}
                      </CardDescription>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge className={statusConfig[contract.status as keyof typeof statusConfig].color}>
                        <StatusIcon className="h-3 w-3 mr-1" />
                        {statusConfig[contract.status as keyof typeof statusConfig].label}
                      </Badge>
                      <Button variant="ghost" size="icon">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                
                <CardContent className="space-y-4">
                  {/* Type and Value */}
                  <div className="flex justify-between items-center">
                    <Badge className={typeColors[contract.type as keyof typeof typeColors]}>
                      {contract.type}
                    </Badge>
                    <div className="text-right">
                      <div className="text-lg font-bold text-green-600">
                        {formatCurrency(contract.value)}
                      </div>
                      <div className="text-xs text-muted-foreground">Valor total</div>
                    </div>
                  </div>

                  {/* Description */}
                  <p className="text-sm text-muted-foreground line-clamp-2">
                    {contract.description}
                  </p>

                  {/* Progress */}
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Progresso</span>
                      <span>{contract.progress}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-blue-600 h-2 rounded-full transition-all"
                        style={{ width: `${contract.progress}%` }}
                      ></div>
                    </div>
                  </div>

                  {/* Dates */}
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <div className="text-muted-foreground">Início</div>
                      <div className="font-medium">{formatDate(contract.startDate)}</div>
                    </div>
                    <div>
                      <div className="text-muted-foreground">Fim</div>
                      <div className="font-medium">{formatDate(contract.endDate)}</div>
                    </div>
                  </div>

                  {/* Manager */}
                  <div className="flex items-center gap-2">
                    <User className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">Gerente: {contract.manager}</span>
                  </div>

                  {/* Milestones */}
                  <div className="space-y-2">
                    <div className="text-sm font-medium">Marcos do Projeto</div>
                    <div className="space-y-1">
                      {contract.milestones.map((milestone, index) => (
                        <div key={index} className="flex items-center gap-2 text-xs">
                          <div className={`w-2 h-2 rounded-full ${milestone.completed ? 'bg-green-500' : 'bg-gray-300'}`}></div>
                          <span className={milestone.completed ? 'line-through text-muted-foreground' : ''}>
                            {milestone.name}
                          </span>
                          <span className="text-muted-foreground">
                            ({formatDate(milestone.dueDate)})
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex gap-2 pt-2">
                    <Button variant="outline" size="sm" className="flex-1">
                      Ver Detalhes
                    </Button>
                    <Button variant="outline" size="sm" className="flex-1">
                      Editar
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>

        {filteredContracts.length === 0 && (
          <div className="text-center py-12">
            <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">Nenhum contrato encontrado</h3>
            <p className="text-muted-foreground mb-4">
              Tente ajustar os filtros ou adicionar um novo contrato.
            </p>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Adicionar Contrato
            </Button>
          </div>
        )}
      </div>
    </MainLayout>
  )
}

