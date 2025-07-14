'use client'

import { useState } from 'react'
import { Eye, Download, MessageSquare, Calendar, Clock, CheckCircle, AlertCircle, FileText, DollarSign, BarChart3, Users } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { MainLayout } from '@/components/layout/main-layout'

const clientProjects = [
  {
    id: 1,
    name: 'Sistema E-commerce',
    description: 'Plataforma completa de vendas online com integração de pagamentos',
    status: 'in-progress',
    progress: 65,
    startDate: '2024-01-01',
    endDate: '2024-06-30',
    budget: 85000,
    spent: 55250,
    manager: 'João Silva',
    team: ['João Silva', 'Ana Oliveira', 'Pedro Costa'],
    milestones: [
      { name: 'Análise e Planejamento', completed: true, dueDate: '2024-01-15' },
      { name: 'Desenvolvimento Backend', completed: true, dueDate: '2024-03-01' },
      { name: 'Desenvolvimento Frontend', completed: false, dueDate: '2024-04-15' },
      { name: 'Testes e Deploy', completed: false, dueDate: '2024-06-01' }
    ],
    recentUpdates: [
      { date: '2024-01-15', message: 'Backend API completamente implementada', type: 'milestone' },
      { date: '2024-01-12', message: 'Integração com gateway de pagamento finalizada', type: 'update' },
      { date: '2024-01-10', message: 'Testes de segurança aprovados', type: 'update' }
    ]
  },
  {
    id: 2,
    name: 'App Mobile Banking',
    description: 'Aplicativo móvel para serviços bancários com autenticação biométrica',
    status: 'in-progress',
    progress: 85,
    startDate: '2023-10-01',
    endDate: '2024-03-31',
    budget: 120000,
    spent: 102000,
    manager: 'Maria Santos',
    team: ['Maria Santos', 'Carlos Mendes', 'Beatriz Lima'],
    milestones: [
      { name: 'Design UX/UI', completed: true, dueDate: '2023-11-15' },
      { name: 'Desenvolvimento iOS', completed: true, dueDate: '2024-01-15' },
      { name: 'Desenvolvimento Android', completed: true, dueDate: '2024-02-01' },
      { name: 'Testes e Publicação', completed: false, dueDate: '2024-03-15' }
    ],
    recentUpdates: [
      { date: '2024-01-14', message: 'Versão Android aprovada nos testes', type: 'milestone' },
      { date: '2024-01-11', message: 'Implementação de autenticação biométrica concluída', type: 'update' },
      { date: '2024-01-08', message: 'Testes de performance finalizados', type: 'update' }
    ]
  }
]

const invoices = [
  {
    id: 'INV-2024-001',
    amount: 25000,
    issueDate: '2024-01-15',
    dueDate: '2024-02-14',
    status: 'paid',
    description: 'Desenvolvimento Backend - Fase 2'
  },
  {
    id: 'INV-2024-002',
    amount: 18500,
    issueDate: '2024-01-20',
    dueDate: '2024-02-19',
    status: 'pending',
    description: 'Desenvolvimento Mobile - Sprint 3'
  },
  {
    id: 'INV-2023-045',
    amount: 22000,
    issueDate: '2023-12-15',
    dueDate: '2024-01-14',
    status: 'paid',
    description: 'Desenvolvimento Frontend - Fase 1'
  }
]

const messages = [
  {
    id: 1,
    from: 'João Silva',
    subject: 'Atualização do Projeto E-commerce',
    message: 'Olá! Gostaria de informar que concluímos a integração com o gateway de pagamento. O sistema está funcionando perfeitamente nos testes.',
    date: '2024-01-15T10:30:00',
    read: false,
    priority: 'normal'
  },
  {
    id: 2,
    from: 'Maria Santos',
    subject: 'Aprovação de Testes - App Banking',
    message: 'Boa notícia! A versão Android do aplicativo foi aprovada em todos os testes de segurança e performance. Estamos prontos para a próxima fase.',
    date: '2024-01-14T14:20:00',
    read: true,
    priority: 'high'
  },
  {
    id: 3,
    from: 'Suporte PontoHub',
    subject: 'Fatura INV-2024-002 Disponível',
    message: 'Sua nova fatura está disponível para visualização e pagamento. Valor: R$ 18.500,00 - Vencimento: 19/02/2024',
    date: '2024-01-12T09:15:00',
    read: true,
    priority: 'normal'
  }
]

const statusConfig = {
  'in-progress': {
    label: 'Em Progresso',
    color: 'bg-blue-100 text-blue-800',
    icon: Clock
  },
  'completed': {
    label: 'Concluído',
    color: 'bg-green-100 text-green-800',
    icon: CheckCircle
  },
  'on-hold': {
    label: 'Pausado',
    color: 'bg-yellow-100 text-yellow-800',
    icon: AlertCircle
  }
}

const invoiceStatusConfig = {
  'paid': {
    label: 'Paga',
    color: 'bg-green-100 text-green-800'
  },
  'pending': {
    label: 'Pendente',
    color: 'bg-yellow-100 text-yellow-800'
  },
  'overdue': {
    label: 'Vencida',
    color: 'bg-red-100 text-red-800'
  }
}

export default function ClientPortalPage() {
  const [selectedProject, setSelectedProject] = useState(clientProjects[0])

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value)
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR')
  }

  const formatDateTime = (dateString: string) => {
    return new Date(dateString).toLocaleString('pt-BR')
  }

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase()
  }

  const totalBudget = clientProjects.reduce((sum, project) => sum + project.budget, 0)
  const totalSpent = clientProjects.reduce((sum, project) => sum + project.spent, 0)
  const totalInvoices = invoices.reduce((sum, invoice) => sum + invoice.amount, 0)
  const pendingInvoices = invoices.filter(i => i.status === 'pending').reduce((sum, invoice) => sum + invoice.amount, 0)

  return (
    <MainLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold">Portal do Cliente</h1>
            <p className="text-muted-foreground">
              Acompanhe seus projetos e faturas
            </p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline">
              <MessageSquare className="h-4 w-4 mr-2" />
              Mensagens
            </Button>
            <Button>
              <Calendar className="h-4 w-4 mr-2" />
              Agendar Reunião
            </Button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Projetos Ativos</CardTitle>
              <BarChart3 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{clientProjects.length}</div>
              <p className="text-xs text-muted-foreground">
                Em desenvolvimento
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Orçamento Total</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatCurrency(totalBudget)}</div>
              <p className="text-xs text-muted-foreground">
                Investimento aprovado
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Valor Executado</CardTitle>
              <CheckCircle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatCurrency(totalSpent)}</div>
              <p className="text-xs text-muted-foreground">
                {Math.round((totalSpent / totalBudget) * 100)}% do orçamento
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Faturas Pendentes</CardTitle>
              <FileText className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatCurrency(pendingInvoices)}</div>
              <p className="text-xs text-muted-foreground">
                Aguardando pagamento
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Projects Section */}
          <div className="lg:col-span-2 space-y-6">
            {/* Project Selection */}
            <Card>
              <CardHeader>
                <CardTitle>Meus Projetos</CardTitle>
                <CardDescription>
                  Selecione um projeto para ver detalhes
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {clientProjects.map((project) => {
                    const StatusIcon = statusConfig[project.status as keyof typeof statusConfig].icon
                    
                    return (
                      <Card 
                        key={project.id} 
                        className={`cursor-pointer transition-all hover:shadow-md ${
                          selectedProject.id === project.id ? 'ring-2 ring-primary' : ''
                        }`}
                        onClick={() => setSelectedProject(project)}
                      >
                        <CardContent className="p-4">
                          <div className="space-y-3">
                            <div className="flex justify-between items-start">
                              <h3 className="font-semibold">{project.name}</h3>
                              <Badge className={statusConfig[project.status as keyof typeof statusConfig].color}>
                                <StatusIcon className="h-3 w-3 mr-1" />
                                {statusConfig[project.status as keyof typeof statusConfig].label}
                              </Badge>
                            </div>
                            
                            <p className="text-sm text-muted-foreground line-clamp-2">
                              {project.description}
                            </p>
                            
                            <div className="space-y-2">
                              <div className="flex justify-between text-sm">
                                <span>Progresso</span>
                                <span>{project.progress}%</span>
                              </div>
                              <div className="w-full bg-gray-200 rounded-full h-2">
                                <div 
                                  className="bg-blue-600 h-2 rounded-full transition-all"
                                  style={{ width: `${project.progress}%` }}
                                ></div>
                              </div>
                            </div>
                            
                            <div className="flex justify-between text-sm text-muted-foreground">
                              <span>Orçamento: {formatCurrency(project.budget)}</span>
                              <span>Gasto: {formatCurrency(project.spent)}</span>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    )
                  })}
                </div>
              </CardContent>
            </Card>

            {/* Project Details */}
            <Card>
              <CardHeader>
                <CardTitle>{selectedProject.name}</CardTitle>
                <CardDescription>
                  Detalhes e progresso do projeto
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Project Info */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <div className="text-sm text-muted-foreground">Gerente do Projeto</div>
                    <div className="font-medium">{selectedProject.manager}</div>
                  </div>
                  <div>
                    <div className="text-sm text-muted-foreground">Período</div>
                    <div className="font-medium">
                      {formatDate(selectedProject.startDate)} - {formatDate(selectedProject.endDate)}
                    </div>
                  </div>
                </div>

                {/* Team */}
                <div>
                  <div className="text-sm text-muted-foreground mb-2">Equipe</div>
                  <div className="flex gap-2">
                    {selectedProject.team.map((member, index) => (
                      <Avatar key={index} className="h-8 w-8">
                        <AvatarFallback className="text-xs bg-primary text-primary-foreground">
                          {getInitials(member)}
                        </AvatarFallback>
                      </Avatar>
                    ))}
                  </div>
                </div>

                {/* Milestones */}
                <div>
                  <div className="text-sm font-medium mb-3">Marcos do Projeto</div>
                  <div className="space-y-3">
                    {selectedProject.milestones.map((milestone, index) => (
                      <div key={index} className="flex items-center gap-3">
                        <div className={`w-4 h-4 rounded-full flex items-center justify-center ${
                          milestone.completed ? 'bg-green-500' : 'bg-gray-300'
                        }`}>
                          {milestone.completed && <CheckCircle className="h-3 w-3 text-white" />}
                        </div>
                        <div className="flex-1">
                          <div className={`text-sm ${milestone.completed ? 'line-through text-muted-foreground' : 'font-medium'}`}>
                            {milestone.name}
                          </div>
                          <div className="text-xs text-muted-foreground">
                            Prazo: {formatDate(milestone.dueDate)}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Recent Updates */}
                <div>
                  <div className="text-sm font-medium mb-3">Atualizações Recentes</div>
                  <div className="space-y-3">
                    {selectedProject.recentUpdates.map((update, index) => (
                      <div key={index} className="flex gap-3 p-3 bg-gray-50 rounded-lg">
                        <div className={`w-2 h-2 rounded-full mt-2 ${
                          update.type === 'milestone' ? 'bg-green-500' : 'bg-blue-500'
                        }`}></div>
                        <div className="flex-1">
                          <div className="text-sm">{update.message}</div>
                          <div className="text-xs text-muted-foreground">
                            {formatDate(update.date)}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Messages */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MessageSquare className="h-5 w-5" />
                  Mensagens
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {messages.slice(0, 3).map((message) => (
                  <div key={message.id} className={`p-3 rounded-lg border ${!message.read ? 'bg-blue-50 border-blue-200' : 'bg-gray-50'}`}>
                    <div className="flex justify-between items-start mb-1">
                      <div className="text-sm font-medium">{message.from}</div>
                      {!message.read && (
                        <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                      )}
                    </div>
                    <div className="text-sm font-medium mb-1">{message.subject}</div>
                    <div className="text-xs text-muted-foreground line-clamp-2">
                      {message.message}
                    </div>
                    <div className="text-xs text-muted-foreground mt-2">
                      {formatDateTime(message.date)}
                    </div>
                  </div>
                ))}
                <Button variant="outline" className="w-full">
                  Ver Todas as Mensagens
                </Button>
              </CardContent>
            </Card>

            {/* Recent Invoices */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  Faturas Recentes
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {invoices.map((invoice) => (
                  <div key={invoice.id} className="p-3 border rounded-lg">
                    <div className="flex justify-between items-start mb-2">
                      <div className="text-sm font-medium">{invoice.id}</div>
                      <Badge className={invoiceStatusConfig[invoice.status as keyof typeof invoiceStatusConfig].color}>
                        {invoiceStatusConfig[invoice.status as keyof typeof invoiceStatusConfig].label}
                      </Badge>
                    </div>
                    <div className="text-sm text-muted-foreground mb-2">
                      {invoice.description}
                    </div>
                    <div className="flex justify-between items-center">
                      <div className="text-lg font-bold text-primary">
                        {formatCurrency(invoice.amount)}
                      </div>
                      <div className="flex gap-1">
                        <Button variant="ghost" size="icon" className="h-6 w-6">
                          <Eye className="h-3 w-3" />
                        </Button>
                        <Button variant="ghost" size="icon" className="h-6 w-6">
                          <Download className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                    <div className="text-xs text-muted-foreground mt-1">
                      Vencimento: {formatDate(invoice.dueDate)}
                    </div>
                  </div>
                ))}
                <Button variant="outline" className="w-full">
                  Ver Todas as Faturas
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </MainLayout>
  )
}

