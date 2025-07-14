'use client'

import { useState } from 'react'
import { Plus, Search, Filter, MoreHorizontal, Receipt, Calendar, DollarSign, Download, Send, Eye, CheckCircle, Clock, AlertTriangle, XCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { MainLayout } from '@/components/layout/main-layout'

const invoices = [
  {
    id: 'INV-2024-001',
    client: 'TechCorp',
    project: 'Sistema E-commerce',
    amount: 25000,
    issueDate: '2024-01-15',
    dueDate: '2024-02-14',
    status: 'paid',
    paymentDate: '2024-02-10',
    description: 'Desenvolvimento Backend - Fase 2',
    items: [
      { description: 'Desenvolvimento API REST', quantity: 80, rate: 150, amount: 12000 },
      { description: 'Integração Banco de Dados', quantity: 40, rate: 150, amount: 6000 },
      { description: 'Testes Unitários', quantity: 30, rate: 120, amount: 3600 },
      { description: 'Documentação Técnica', quantity: 20, rate: 100, amount: 2000 },
      { description: 'Deploy e Configuração', quantity: 10, rate: 140, amount: 1400 }
    ]
  },
  {
    id: 'INV-2024-002',
    client: 'FinanceInc',
    project: 'App Mobile Banking',
    amount: 18500,
    issueDate: '2024-01-20',
    dueDate: '2024-02-19',
    status: 'pending',
    paymentDate: null,
    description: 'Desenvolvimento Mobile - Sprint 3',
    items: [
      { description: 'Desenvolvimento iOS', quantity: 60, rate: 160, amount: 9600 },
      { description: 'Desenvolvimento Android', quantity: 50, rate: 160, amount: 8000 },
      { description: 'Testes em Dispositivos', quantity: 6, rate: 150, amount: 900 }
    ]
  },
  {
    id: 'INV-2024-003',
    client: 'ServicePro',
    project: 'Portal Corporativo',
    amount: 12000,
    issueDate: '2024-01-25',
    dueDate: '2024-02-24',
    status: 'sent',
    paymentDate: null,
    description: 'Análise e Planejamento',
    items: [
      { description: 'Levantamento de Requisitos', quantity: 40, rate: 120, amount: 4800 },
      { description: 'Arquitetura do Sistema', quantity: 30, rate: 140, amount: 4200 },
      { description: 'Prototipagem', quantity: 20, rate: 150, amount: 3000 }
    ]
  },
  {
    id: 'INV-2024-004',
    client: 'StartupTech',
    project: 'Consultoria DevOps',
    amount: 8500,
    issueDate: '2024-01-10',
    dueDate: '2024-02-09',
    status: 'overdue',
    paymentDate: null,
    description: 'Implementação CI/CD',
    items: [
      { description: 'Auditoria de Infraestrutura', quantity: 16, rate: 180, amount: 2880 },
      { description: 'Configuração Pipeline', quantity: 24, rate: 170, amount: 4080 },
      { description: 'Treinamento Equipe', quantity: 8, rate: 190, amount: 1520 }
    ]
  },
  {
    id: 'INV-2023-045',
    client: 'TechCorp',
    project: 'Sistema E-commerce',
    amount: 22000,
    issueDate: '2023-12-15',
    dueDate: '2024-01-14',
    status: 'paid',
    paymentDate: '2024-01-12',
    description: 'Desenvolvimento Frontend - Fase 1',
    items: [
      { description: 'Interface de Usuário', quantity: 70, rate: 140, amount: 9800 },
      { description: 'Integração com API', quantity: 40, rate: 150, amount: 6000 },
      { description: 'Testes de Interface', quantity: 30, rate: 120, amount: 3600 },
      { description: 'Otimização Performance', quantity: 20, rate: 130, amount: 2600 }
    ]
  },
  {
    id: 'INV-2024-005',
    client: 'FinanceInc',
    project: 'App Mobile Banking',
    amount: 5500,
    issueDate: '2024-01-30',
    dueDate: '2024-03-01',
    status: 'draft',
    paymentDate: null,
    description: 'Testes e Validação Final',
    items: [
      { description: 'Testes de Segurança', quantity: 20, rate: 180, amount: 3600 },
      { description: 'Testes de Performance', quantity: 12, rate: 160, amount: 1900 }
    ]
  }
]

const statusConfig = {
  'draft': {
    label: 'Rascunho',
    color: 'bg-gray-100 text-gray-800',
    icon: Receipt
  },
  'sent': {
    label: 'Enviada',
    color: 'bg-blue-100 text-blue-800',
    icon: Send
  },
  'pending': {
    label: 'Pendente',
    color: 'bg-yellow-100 text-yellow-800',
    icon: Clock
  },
  'paid': {
    label: 'Paga',
    color: 'bg-green-100 text-green-800',
    icon: CheckCircle
  },
  'overdue': {
    label: 'Vencida',
    color: 'bg-red-100 text-red-800',
    icon: AlertTriangle
  },
  'cancelled': {
    label: 'Cancelada',
    color: 'bg-red-100 text-red-800',
    icon: XCircle
  }
}

export default function InvoicesPage() {
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedStatus, setSelectedStatus] = useState('all')
  const [selectedClient, setSelectedClient] = useState('all')

  const filteredInvoices = invoices.filter(invoice => {
    const matchesSearch = invoice.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         invoice.client.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         invoice.project.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         invoice.description.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = selectedStatus === 'all' || invoice.status === selectedStatus
    const matchesClient = selectedClient === 'all' || invoice.client === selectedClient
    return matchesSearch && matchesStatus && matchesClient
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

  const isOverdue = (dueDate: string, status: string) => {
    return status !== 'paid' && status !== 'cancelled' && new Date(dueDate) < new Date()
  }

  const totalAmount = invoices.reduce((sum, invoice) => sum + invoice.amount, 0)
  const paidAmount = invoices.filter(i => i.status === 'paid').reduce((sum, invoice) => sum + invoice.amount, 0)
  const pendingAmount = invoices.filter(i => i.status === 'pending' || i.status === 'sent').reduce((sum, invoice) => sum + invoice.amount, 0)
  const overdueAmount = invoices.filter(i => i.status === 'overdue').reduce((sum, invoice) => sum + invoice.amount, 0)

  return (
    <MainLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold">Faturas</h1>
            <p className="text-muted-foreground">
              Gerencie faturas e acompanhe pagamentos
            </p>
          </div>
          <Button className="flex items-center gap-2">
            <Plus className="h-4 w-4" />
            Nova Fatura
          </Button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Faturado</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatCurrency(totalAmount)}</div>
              <p className="text-xs text-muted-foreground">
                {invoices.length} faturas
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Recebido</CardTitle>
              <CheckCircle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">{formatCurrency(paidAmount)}</div>
              <p className="text-xs text-muted-foreground">
                Pagamentos confirmados
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Pendente</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-yellow-600">{formatCurrency(pendingAmount)}</div>
              <p className="text-xs text-muted-foreground">
                Aguardando pagamento
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Vencidas</CardTitle>
              <AlertTriangle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">{formatCurrency(overdueAmount)}</div>
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
              placeholder="Buscar faturas..."
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
              <option value="draft">Rascunho</option>
              <option value="sent">Enviada</option>
              <option value="pending">Pendente</option>
              <option value="paid">Paga</option>
              <option value="overdue">Vencida</option>
              <option value="cancelled">Cancelada</option>
            </select>
            <select
              value={selectedClient}
              onChange={(e) => setSelectedClient(e.target.value)}
              className="px-3 py-2 border border-input bg-background rounded-md text-sm"
            >
              <option value="all">Todos os Clientes</option>
              <option value="TechCorp">TechCorp</option>
              <option value="FinanceInc">FinanceInc</option>
              <option value="ServicePro">ServicePro</option>
              <option value="StartupTech">StartupTech</option>
            </select>
            <Button variant="outline" size="icon">
              <Filter className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Invoices List */}
        <div className="space-y-4">
          {filteredInvoices.map((invoice) => {
            const StatusIcon = statusConfig[invoice.status as keyof typeof statusConfig].icon
            const isInvoiceOverdue = isOverdue(invoice.dueDate, invoice.status)
            
            return (
              <Card key={invoice.id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div className="flex-1 space-y-3">
                      {/* Header */}
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <h3 className="text-lg font-semibold">{invoice.id}</h3>
                          <Badge className={statusConfig[invoice.status as keyof typeof statusConfig].color}>
                            <StatusIcon className="h-3 w-3 mr-1" />
                            {statusConfig[invoice.status as keyof typeof statusConfig].label}
                          </Badge>
                          {isInvoiceOverdue && (
                            <Badge className="bg-red-100 text-red-800">
                              <AlertTriangle className="h-3 w-3 mr-1" />
                              Vencida
                            </Badge>
                          )}
                        </div>
                        <div className="flex items-center gap-2">
                          <Button variant="ghost" size="icon">
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="icon">
                            <Download className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="icon">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>

                      {/* Client and Project */}
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                        <div>
                          <div className="text-muted-foreground">Cliente</div>
                          <div className="font-medium">{invoice.client}</div>
                        </div>
                        <div>
                          <div className="text-muted-foreground">Projeto</div>
                          <div className="font-medium">{invoice.project}</div>
                        </div>
                        <div>
                          <div className="text-muted-foreground">Descrição</div>
                          <div className="font-medium">{invoice.description}</div>
                        </div>
                      </div>

                      {/* Dates */}
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                        <div>
                          <div className="text-muted-foreground">Data de Emissão</div>
                          <div className="font-medium">{formatDate(invoice.issueDate)}</div>
                        </div>
                        <div>
                          <div className="text-muted-foreground">Vencimento</div>
                          <div className={`font-medium ${isInvoiceOverdue ? 'text-red-600' : ''}`}>
                            {formatDate(invoice.dueDate)}
                          </div>
                        </div>
                        <div>
                          <div className="text-muted-foreground">Data de Pagamento</div>
                          <div className="font-medium">
                            {invoice.paymentDate ? formatDate(invoice.paymentDate) : '-'}
                          </div>
                        </div>
                      </div>

                      {/* Items Summary */}
                      <div className="space-y-2">
                        <div className="text-sm font-medium">Itens da Fatura</div>
                        <div className="space-y-1">
                          {invoice.items.slice(0, 3).map((item, index) => (
                            <div key={index} className="flex justify-between text-xs text-muted-foreground">
                              <span>{item.description}</span>
                              <span>{item.quantity}h × {formatCurrency(item.rate)} = {formatCurrency(item.amount)}</span>
                            </div>
                          ))}
                          {invoice.items.length > 3 && (
                            <div className="text-xs text-muted-foreground">
                              +{invoice.items.length - 3} itens adicionais
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="flex gap-2 pt-2">
                        {invoice.status === 'draft' && (
                          <>
                            <Button variant="outline" size="sm">
                              <Send className="h-4 w-4 mr-2" />
                              Enviar
                            </Button>
                            <Button variant="outline" size="sm">
                              Editar
                            </Button>
                          </>
                        )}
                        {invoice.status === 'sent' && (
                          <>
                            <Button variant="outline" size="sm">
                              <CheckCircle className="h-4 w-4 mr-2" />
                              Marcar como Paga
                            </Button>
                            <Button variant="outline" size="sm">
                              <Send className="h-4 w-4 mr-2" />
                              Reenviar
                            </Button>
                          </>
                        )}
                        {invoice.status === 'pending' && (
                          <Button variant="outline" size="sm">
                            <CheckCircle className="h-4 w-4 mr-2" />
                            Marcar como Paga
                          </Button>
                        )}
                        {invoice.status === 'overdue' && (
                          <>
                            <Button variant="outline" size="sm">
                              <CheckCircle className="h-4 w-4 mr-2" />
                              Marcar como Paga
                            </Button>
                            <Button variant="outline" size="sm">
                              <Send className="h-4 w-4 mr-2" />
                              Enviar Lembrete
                            </Button>
                          </>
                        )}
                        <Button variant="outline" size="sm">
                          <Download className="h-4 w-4 mr-2" />
                          Download PDF
                        </Button>
                      </div>
                    </div>
                    
                    {/* Amount */}
                    <div className="text-right ml-6">
                      <div className="text-3xl font-bold text-primary">
                        {formatCurrency(invoice.amount)}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        Valor total
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>

        {filteredInvoices.length === 0 && (
          <div className="text-center py-12">
            <Receipt className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">Nenhuma fatura encontrada</h3>
            <p className="text-muted-foreground mb-4">
              Tente ajustar os filtros ou criar uma nova fatura.
            </p>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Criar Fatura
            </Button>
          </div>
        )}
      </div>
    </MainLayout>
  )
}

